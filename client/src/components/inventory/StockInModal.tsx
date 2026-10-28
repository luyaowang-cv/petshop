"use client";

import { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Radio,
  Space,
  Divider,
  Button,
  message,
} from "antd";
import { PlusOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { useProducts, useProductMutations } from "@/services/queries/Product";
import { useStockRecordMutations } from "@/services/queries/StockRecord";
import { ProductCategory, type Product } from "@/@types/Product";
import { StockInType } from "@/@types/StockRecord";
import { centsToYuan, yuanToCents } from "@/services/api/product";

const { Option } = Select;
const { TextArea } = Input;

interface StockInModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess?: () => void;
}

type ModalMode = "select" | "add"; // select: 选择现有商品, add: 添加新商品

export default function StockInModal({
  visible,
  onCancel,
  onSuccess,
}: StockInModalProps) {
  const [mode, setMode] = useState<ModalMode>("select");
  const [selectedProductId, setSelectedProductId] = useState<
    string | undefined
  >();
  const [productSearchText, setProductSearchText] = useState("");

  const [form] = Form.useForm();

  // 监听单位字段的变化（用于添加新商品模式）
  const watchedUnit = Form.useWatch("unit", form);

  // 查询所有商品（用于选择）
  const { data: allProductsData } = useProducts({
    page: 1,
    pageSize: 1000,
    search: productSearchText,
  });

  // 商品和库存操作
  const { createProduct } = useProductMutations();
  const { createStockRecord } = useStockRecordMutations();

  // 获取选中的商品
  const selectedProduct = allProductsData?.data.find(
    (p) => p.id === selectedProductId,
  );

  // 重置表单
  const resetForm = () => {
    form.resetFields();
    setMode("select");
    setSelectedProductId(undefined);
    setProductSearchText("");
  };

  // 关闭弹窗
  const handleCancel = () => {
    resetForm();
    onCancel();
  };

  // 切换到添加新商品模式
  const switchToAddMode = () => {
    setMode("add");
    form.resetFields();
    form.setFieldsValue({
      type: StockInType.PURCHASE,
      operator: "管理员",
    });
  };

  // 返回选择商品模式
  const switchToSelectMode = () => {
    setMode("select");
    form.resetFields();
    form.setFieldsValue({
      type: StockInType.PURCHASE,
      operator: "管理员",
    });
  };

  // 处理商品选择
  const handleProductSelect = (value: string) => {
    if (value === "ADD_NEW") {
      switchToAddMode();
    } else {
      setSelectedProductId(value);
    }
  };

  // 提交表单
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (mode === "add") {
        // 添加新商品并入库
        await handleAddProductAndStockIn(values);
      } else {
        // 现有商品入库
        await handleStockIn(values);
      }

      message.success(mode === "add" ? "商品添加并入库成功" : "入库成功");
      resetForm();
      onSuccess?.();
      onCancel();
    } catch (error) {
      console.error("操作失败:", error);
    }
  };

  // 现有商品入库
  const handleStockIn = async (values: any) => {
    if (!selectedProductId) {
      message.error("请选择商品");
      return;
    }

    const data = {
      productId: selectedProductId,
      quantity: values.quantity,
      type: values.type,
      cost: values.cost ? yuanToCents(values.cost) : undefined,
      supplier: values.supplier,
      operator: values.operator,
      note: values.note,
    };

    await createStockRecord.mutateAsync(data);
  };

  // 添加新商品并入库
  const handleAddProductAndStockIn = async (values: any) => {
    // 1. 先创建商品
    const productData = {
      name: values.productName,
      category: values.category,
      price: yuanToCents(values.price),
      cost: yuanToCents(values.productCost),
      stock: 0, // 初始库存为0
      minStock: values.minStock,
      unit: values.unit,
      description: values.description,
    };

    const newProduct = await createProduct.mutateAsync(productData);

    // 2. 再进行入库
    const stockData = {
      productId: newProduct.id,
      quantity: values.quantity,
      type: values.type,
      cost: values.cost ? yuanToCents(values.cost) : undefined,
      supplier: values.supplier,
      operator: values.operator,
      note: values.note,
    };

    await createStockRecord.mutateAsync(stockData);
  };

  // 初始化表单默认值
  useEffect(() => {
    if (visible) {
      form.setFieldsValue({
        type: StockInType.PURCHASE,
        operator: "管理员",
      });
    }
  }, [visible, form]);

  return (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {mode === "add" && (
            <Button
              type="text"
              size="small"
              icon={<ArrowLeftOutlined />}
              onClick={switchToSelectMode}
            />
          )}
          <span>{mode === "select" ? "商品入库" : "添加新商品并入库"}</span>
        </div>
      }
      open={visible}
      onOk={handleSubmit}
      onCancel={handleCancel}
      confirmLoading={createStockRecord.isPending || createProduct.isPending}
      width={700}
      okText={mode === "select" ? "确认入库" : "添加并入库"}
      cancelText="取消"
    >
      <Form form={form} layout="vertical" style={{ marginTop: 24 }}>
        {mode === "select" ? (
          // 选择现有商品模式
          <>
            <Form.Item
              label="选择商品"
              required
              tooltip="选择要入库的商品，或添加新商品"
            >
              <Select
                placeholder="请选择商品"
                showSearch
                value={selectedProductId}
                onChange={handleProductSelect}
                filterOption={false}
                onSearch={setProductSearchText}
                notFoundContent={
                  <div style={{ textAlign: "center", padding: "20px 0" }}>
                    <p style={{ marginBottom: 8, color: "#999" }}>未找到商品</p>
                    <Button
                      type="link"
                      icon={<PlusOutlined />}
                      onClick={switchToAddMode}
                    >
                      添加新商品
                    </Button>
                  </div>
                }
              >
                <Option
                  value="ADD_NEW"
                  style={{
                    borderBottom: "1px solid #f0f0f0",
                    fontWeight: 500,
                  }}
                >
                  <PlusOutlined /> 添加新商品
                </Option>
                {allProductsData?.data.map((product) => (
                  <Option key={product.id} value={product.id}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <span>{product.name}</span>
                      <span style={{ color: "#999", fontSize: 12 }}>
                        库存: {product.stock}
                        {product.unit}
                      </span>
                    </div>
                  </Option>
                ))}
              </Select>
            </Form.Item>

            {selectedProduct && (
              <div
                style={{
                  padding: "12px",
                  background: "#f5f5f5",
                  borderRadius: "4px",
                  marginBottom: "16px",
                }}
              >
                <Space
                  direction="vertical"
                  size="small"
                  style={{ width: "100%" }}
                >
                  <div>
                    <strong>商品名称：</strong>
                    {selectedProduct.name}
                  </div>
                  <div>
                    <strong>当前库存：</strong>
                    {selectedProduct.stock} {selectedProduct.unit}
                  </div>
                  <div>
                    <strong>成本单价：</strong>¥
                    {centsToYuan(selectedProduct.cost).toFixed(2)}
                  </div>
                </Space>
              </div>
            )}
          </>
        ) : (
          // 添加新商品模式
          <>
            <Divider orientation="left" style={{ margin: "16px 0" }}>
              商品基本信息
            </Divider>

            <Form.Item
              name="productName"
              label="商品名称"
              rules={[{ required: true, message: "请输入商品名称" }]}
            >
              <Input placeholder="请输入商品名称" />
            </Form.Item>

            <Space style={{ width: "100%" }} size="large">
              <Form.Item
                name="category"
                label="商品分类"
                rules={[{ required: true, message: "请选择商品分类" }]}
                style={{ flex: 1 }}
              >
                <Select placeholder="请选择商品分类">
                  <Option value={ProductCategory.FOOD}>食品</Option>
                  <Option value={ProductCategory.SUPPLIES}>用品</Option>
                  <Option value={ProductCategory.MEDICINE}>药品</Option>
                  <Option value={ProductCategory.TOY}>玩具</Option>
                  <Option value={ProductCategory.PET}>宠物</Option>
                  <Option value={ProductCategory.OTHER}>其他</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="unit"
                label="单位"
                rules={[{ required: true, message: "请选择单位" }]}
                style={{ flex: 1 }}
              >
                <Select placeholder="请选择单位">
                  <Option value="个">个</Option>
                  <Option value="袋">袋</Option>
                  <Option value="瓶">瓶</Option>
                  <Option value="盒">盒</Option>
                  <Option value="只">只</Option>
                </Select>
              </Form.Item>
            </Space>

            <Space style={{ width: "100%" }} size="large">
              <Form.Item
                name="price"
                label="售价（元）"
                rules={[
                  { required: true, message: "请输入售价" },
                  { type: "number", min: 0, message: "售价不能为负数" },
                ]}
                style={{ flex: 1 }}
              >
                <InputNumber
                  placeholder="请输入售价"
                  style={{ width: "100%" }}
                  min={0}
                  precision={2}
                  prefix="¥"
                />
              </Form.Item>

              <Form.Item
                name="productCost"
                label="成本价（元）"
                rules={[
                  { required: true, message: "请输入成本价" },
                  { type: "number", min: 0, message: "成本价不能为负数" },
                ]}
                style={{ flex: 1 }}
              >
                <InputNumber
                  placeholder="请输入成本价"
                  style={{ width: "100%" }}
                  min={0}
                  precision={2}
                  prefix="¥"
                />
              </Form.Item>

              <Form.Item
                name="minStock"
                label="库存预警值"
                rules={[
                  { required: true, message: "请输入库存预警值" },
                  { type: "number", min: 0, message: "预警值不能为负数" },
                ]}
                style={{ flex: 1 }}
              >
                <InputNumber
                  placeholder="预警值"
                  style={{ width: "100%" }}
                  min={0}
                />
              </Form.Item>
            </Space>

            <Form.Item name="description" label="商品描述">
              <TextArea
                placeholder="请输入商品描述（可选）"
                rows={2}
                maxLength={200}
                showCount
              />
            </Form.Item>

            <Divider orientation="left" style={{ margin: "16px 0" }}>
              入库信息
            </Divider>
          </>
        )}

        {/* 入库信息（两种模式共用） */}
        <Form.Item
          name="quantity"
          label="入库数量"
          rules={[
            { required: true, message: "请输入入库数量" },
            { type: "number", min: 1, message: "数量必须大于0" },
          ]}
        >
          <InputNumber
            placeholder="请输入入库数量"
            style={{ width: "100%" }}
            min={1}
            addonAfter={
              mode === "select"
                ? selectedProduct?.unit || "件"
                : watchedUnit || "件"
            }
          />
        </Form.Item>

        <Form.Item
          name="type"
          label="入库类型"
          rules={[{ required: true, message: "请选择入库类型" }]}
        >
          <Radio.Group>
            <Radio value={StockInType.PURCHASE}>采购入库</Radio>
            <Radio value={StockInType.ADJUSTMENT}>库存调整</Radio>
          </Radio.Group>
        </Form.Item>

        <Space style={{ width: "100%" }} size="large">
          <Form.Item
            name="cost"
            label="本次进货成本（元/单位）"
            tooltip="可选，用于更新商品成本价"
            style={{ flex: 1 }}
          >
            <InputNumber
              placeholder="进货成本"
              style={{ width: "100%" }}
              min={0}
              precision={2}
              prefix="¥"
            />
          </Form.Item>

          <Form.Item
            name="supplier"
            label="供应商"
            tooltip="仅采购入库时填写"
            style={{ flex: 1 }}
          >
            <Input placeholder="供应商名称" />
          </Form.Item>
        </Space>

        <Form.Item
          name="operator"
          label="操作员"
          rules={[{ required: true, message: "请输入操作员" }]}
        >
          <Input placeholder="请输入操作员姓名" />
        </Form.Item>

        <Form.Item name="note" label="备注">
          <TextArea
            placeholder="请输入备注信息（可选）"
            rows={2}
            maxLength={200}
            showCount
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
