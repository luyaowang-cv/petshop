"use client";

import {
  Card,
  Row,
  Col,
  Statistic,
  Space,
  Button,
  Table,
  Spin,
  Modal,
  Form,
  DatePicker,
  Select,
  message,
} from "antd";
import {
  CalendarOutlined,
  UserOutlined,
  ShoppingOutlined,
  PlusOutlined,
  TeamOutlined,
  CrownOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StatusTag } from "@/components/common";
import Link from "next/link";
import dayjs from "dayjs";
import { useState } from "react";
import {
  APPOINTMENT_KEY,
  fetchAppointments,
  createAppointment,
} from "@/services/queries/Appointment";
import { CUSTOMER_KEY, fetchCustomers } from "@/services/queries/Customer";
import {
  PETSHOPSERVICE_KEY,
  fetchPetshopServices,
} from "@/services/queries/PetshopServices";
import { fetchFinanceStatistics } from "@/services/queries/Finance";
import { MemberLevel } from "@/@types/Customer";
import { AppointmentStatus } from "@/@types/Appointment";

export default function Dashboard() {
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const [appointmentModalVisible, setAppointmentModalVisible] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<
    string | undefined
  >();

  // 获取今日预约
  const today = dayjs().startOf("day").toISOString(); // 今天00:00:00
  const tomorrow = dayjs().add(1, "day").startOf("day").toISOString(); // 明天00:00:00
  const { data: appointmentsData, isLoading: isLoadingAppointments } = useQuery(
    {
      queryKey: [APPOINTMENT_KEY, "today"],
      queryFn: () =>
        fetchAppointments({
          startDate: today,
          endDate: tomorrow,
          page: 1,
          pageSize: 100,
        }),
    },
  );

  // 获取客户数据
  const { data: customersData, isLoading: isLoadingCustomers } = useQuery({
    queryKey: [CUSTOMER_KEY],
    queryFn: fetchCustomers,
  });

  // 获取服务数据
  const { data: servicesData, isLoading: isLoadingServices } = useQuery({
    queryKey: [PETSHOPSERVICE_KEY],
    queryFn: fetchPetshopServices,
  });

  // 获取财务统计
  const { data: financeData, isLoading: isLoadingFinance } = useQuery({
    queryKey: ["finance-statistics"],
    queryFn: fetchFinanceStatistics,
  });

  // 创建预约
  const createAppointmentMutation = useMutation({
    mutationFn: createAppointment,
    onSuccess: () => {
      message.success("预约创建成功！");
      queryClient.invalidateQueries({ queryKey: [APPOINTMENT_KEY] });
      setAppointmentModalVisible(false);
      form.resetFields();
      setSelectedCustomerId(undefined);
    },
    onError: () => {
      message.error("创建预约失败，请重试");
    },
  });

  // 计算统计数据
  const todayAppointments = appointmentsData?.appointments?.length || 0;
  const totalCustomers = customersData?.customers?.length || 0;
  const vipMembers =
    customersData?.customers?.filter((c) => c.memberLevel === MemberLevel.VIP)
      .length || 0;
  const totalServices = servicesData?.services?.length || 0;
  const totalPets =
    customersData?.customers?.reduce((sum, c) => sum + c.pets.length, 0) || 0;
  const monthlyRevenue = financeData?.monthIncome || 0;
  const monthlyProfit = financeData?.monthProfit || 0;

  const isLoading =
    isLoadingAppointments ||
    isLoadingCustomers ||
    isLoadingServices ||
    isLoadingFinance;

  // 获取选中客户的宠物列表
  const selectedCustomer = customersData?.customers?.find(
    (c) => c.id === selectedCustomerId,
  );
  const customerPets = selectedCustomer?.pets || [];

  // 打开新建预约弹窗
  const handleOpenAppointmentModal = () => {
    setAppointmentModalVisible(true);
  };

  // 关闭弹窗
  const handleCloseAppointmentModal = () => {
    setAppointmentModalVisible(false);
    form.resetFields();
    setSelectedCustomerId(undefined);
  };

  // 提交预约表单
  const handleSubmitAppointment = async () => {
    try {
      const values = await form.validateFields();
      await createAppointmentMutation.mutateAsync({
        petId: values.petId,
        serviceId: values.serviceId,
        appointmentTime: values.appointmentTime.toDate(),
      });
    } catch (error) {
      console.error("表单验证失败:", error);
    }
  };

  // 今日预约表格列
  const columns = [
    {
      title: "预约时间",
      dataIndex: "appointmentTime",
      key: "appointmentTime",
      width: 180,
      render: (date: string) => dayjs(date).format("HH:mm"),
    },
    {
      title: "客户",
      key: "customer",
      width: 120,
      render: (_: any, record: any) => {
        const ownerId = record.pet?.ownerId;
        if (!ownerId) return "-";
        const owner = customersData?.customers?.find((c) => c.id === ownerId);
        return owner?.name || "-";
      },
    },
    {
      title: "宠物",
      dataIndex: ["pet", "name"],
      key: "pet",
      width: 120,
    },
    {
      title: "服务",
      dataIndex: ["service", "title"],
      key: "service",
      render: (title: string) => title || "-",
    },
    {
      title: "金额",
      key: "price",
      width: 100,
      render: (_: any, record: any) => {
        const value = record.service?.value;
        return value ? `¥${(value / 100).toFixed(0)}` : "-";
      },
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status: AppointmentStatus) => <StatusTag status={status} />,
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      <Spin spinning={isLoading}>
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          {/* 数据统计卡片 */}
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="今日预约"
                  value={todayAppointments}
                  prefix={<CalendarOutlined />}
                  valueStyle={{ color: "#1890ff" }}
                  suffix="个"
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="客户总数"
                  value={totalCustomers}
                  prefix={<UserOutlined />}
                  valueStyle={{ color: "#52c41a" }}
                  suffix="位"
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="VIP会员"
                  value={vipMembers}
                  prefix={<CrownOutlined />}
                  valueStyle={{ color: "#faad14" }}
                  suffix="位"
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="服务项目"
                  value={totalServices}
                  prefix={<ShoppingOutlined />}
                  valueStyle={{ color: "#722ed1" }}
                  suffix="项"
                />
              </Card>
            </Col>
          </Row>

          {/* 第二行统计 */}
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="宠物总数"
                  value={totalPets}
                  prefix={<TeamOutlined />}
                  valueStyle={{ color: "#13c2c2" }}
                  suffix="只"
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="本月收入"
                  value={monthlyRevenue}
                  precision={2}
                  prefix={<DollarOutlined />}
                  valueStyle={{ color: "#52c41a" }}
                  suffix="元"
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="本月利润"
                  value={monthlyProfit}
                  precision={2}
                  prefix={<DollarOutlined />}
                  valueStyle={{
                    color: monthlyProfit >= 0 ? "#52c41a" : "#ff4d4f",
                  }}
                  suffix="元"
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  size="large"
                  block
                  onClick={handleOpenAppointmentModal}
                  style={{ height: "80px", fontSize: "16px" }}
                >
                  新建预约
                </Button>
              </Card>
            </Col>
          </Row>

          {/* 今日预约列表 */}
          <Card
            title={
              <span style={{ fontSize: "18px", fontWeight: 600 }}>
                今日预约
              </span>
            }
            bordered={false}
            extra={
              <Link href="/dashboard/appointments">
                <Button type="link">查看全部</Button>
              </Link>
            }
          >
            {todayAppointments === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "48px 0",
                  color: "#8c8c8c",
                }}
              >
                今日暂无预约
              </div>
            ) : (
              <Table
                columns={columns}
                dataSource={appointmentsData?.appointments || []}
                rowKey="id"
                pagination={false}
                size="middle"
              />
            )}
          </Card>
        </Space>
      </Spin>

      {/* 新建预约弹窗 */}
      <Modal
        title="新建预约"
        open={appointmentModalVisible}
        onOk={handleSubmitAppointment}
        onCancel={handleCloseAppointmentModal}
        confirmLoading={createAppointmentMutation.isLoading}
        width={600}
        okText="创建预约"
        cancelText="取消"
      >
        <Form form={form} layout="vertical" style={{ marginTop: 24 }}>
          <Form.Item
            name="customerId"
            label="选择客户"
            rules={[{ required: true, message: "请选择客户" }]}
          >
            <Select
              placeholder="请选择客户"
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              onChange={(value) => {
                setSelectedCustomerId(value);
                form.setFieldValue("petId", undefined);
              }}
              options={customersData?.customers?.map((customer) => ({
                label: `${customer.name} - ${customer.phone.replace(/\D/g, "").slice(-11)}`,
                value: customer.id,
              }))}
            />
          </Form.Item>

          <Form.Item
            name="petId"
            label="选择宠物"
            rules={[{ required: true, message: "请选择宠物" }]}
          >
            <Select
              placeholder={selectedCustomerId ? "请选择宠物" : "请先选择客户"}
              disabled={!selectedCustomerId}
              options={customerPets.map((pet) => ({
                label: `${pet.name} (${pet.breed})`,
                value: pet.id,
              }))}
            />
          </Form.Item>

          <Form.Item
            name="serviceId"
            label="选择服务"
            rules={[{ required: true, message: "请选择服务" }]}
          >
            <Select
              placeholder="请选择服务"
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              options={servicesData?.services?.map((service) => ({
                label: `${service.title} - ¥${(service.value / 100).toFixed(0)}`,
                value: service.id,
              }))}
            />
          </Form.Item>

          <Form.Item
            name="appointmentTime"
            label="预约时间"
            rules={[
              { required: true, message: "请选择预约时间" },
              {
                validator: (_, value) => {
                  if (value && dayjs(value).isBefore(dayjs())) {
                    return Promise.reject(
                      new Error("预约时间不能早于当前时间"),
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <DatePicker
              showTime
              format="YYYY-MM-DD HH:mm"
              placeholder="请选择预约时间"
              style={{ width: "100%" }}
              disabledDate={(current) => {
                return current && current < dayjs().startOf("day");
              }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
