/**
 * 中文文本常量
 * 集中管理所有界面文本，方便维护和国际化
 */

// 通用文本
export const COMMON = {
  // 操作
  CREATE: "新建",
  EDIT: "编辑",
  DELETE: "删除",
  CANCEL: "取消",
  SAVE: "保存",
  SUBMIT: "提交",
  CONFIRM: "确认",
  BACK: "返回",
  SEARCH: "搜索",
  FILTER: "筛选",
  RESET: "重置",
  EXPORT: "导出",
  IMPORT: "导入",
  REFRESH: "刷新",
  VIEW: "查看",
  DETAIL: "详情",

  // 状态
  SUCCESS: "成功",
  FAILED: "失败",
  LOADING: "加载中...",
  NO_DATA: "暂无数据",

  // 提示
  CONFIRM_DELETE: "确认删除",
  DELETE_WARNING: "删除后无法恢复，确定要删除吗？",
  OPERATION_SUCCESS: "操作成功",
  OPERATION_FAILED: "操作失败",
  SAVE_SUCCESS: "保存成功",
  DELETE_SUCCESS: "删除成功",

  // 表单
  REQUIRED_FIELD: "此项为必填项",
  INVALID_EMAIL: "请输入有效的邮箱地址",
  INVALID_PHONE: "请输入有效的手机号码",
  PASSWORD_MIN_LENGTH: "密码至少需要6个字符",
};

// 菜单文本
export const MENU = {
  // 主菜单
  DASHBOARD: "首页",
  PRODUCTS: "商品管理",
  CUSTOMERS: "客户管理",
  SERVICES: "服务管理",
  ORDERS: "订单管理",
  INVENTORY: "库存管理",
  FINANCE: "财务统计",
  SETTINGS: "系统设置",

  // 商品管理子菜单
  PRODUCT_LIST: "商品列表",
  PRODUCT_CATEGORY: "商品分类",

  // 客户管理子菜单
  CUSTOMER_LIST: "客户列表",
  PET_RECORDS: "宠物档案",

  // 服务管理子菜单
  SERVICE_ITEMS: "服务项目",
  SERVICE_ORDERS: "服务订单",

  // 订单管理子菜单
  PRODUCT_ORDERS: "商品订单",
  CASHIER: "收银台",

  // 库存管理子菜单
  INVENTORY_LIST: "库存列表",
  STOCK_IN: "入库记录",

  // 财务统计子菜单
  REVENUE_STATS: "收入统计",
  PRODUCT_SALES: "商品销量",

  // 系统设置子菜单
  STORE_INFO: "门店信息",
  PAYMENT_SETTINGS: "支付设置",
  SMS_SETTINGS: "短信设置",
  ABOUT: "关于系统",
};

// 预约相关
export const APPOINTMENT = {
  TITLE: "预约管理",
  NEW: "新建预约",
  EDIT: "编辑预约",
  DETAIL: "预约详情",
  LIST: "预约列表",

  // 字段
  TIME: "预约时间",
  CUSTOMER: "客户",
  PET: "宠物",
  SERVICE: "服务",
  STATUS: "状态",
  NOTES: "备注",

  // 状态
  STATUS_PENDING: "待处理",
  STATUS_DONE: "已完成",
  STATUS_CANCELED: "已取消",

  // 操作
  CANCEL_APPOINTMENT: "取消预约",
  COMPLETE_APPOINTMENT: "完成预约",

  // 提示
  SELECT_CUSTOMER: "请选择客户",
  SELECT_PET: "请选择宠物",
  SELECT_SERVICE: "请选择服务",
  SELECT_TIME: "请选择预约时间",
};

// 客户相关
export const CUSTOMER = {
  TITLE: "客户管理",
  NEW: "添加客户",
  EDIT: "编辑客户",
  DETAIL: "客户详情",
  LIST: "客户列表",

  // 字段
  NAME: "客户姓名",
  PHONE: "联系电话",
  EMAIL: "邮箱",
  ADDRESS: "地址",
  NOTES: "备注",
  PETS: "宠物",
  PET_COUNT: "宠物数量",

  // 操作
  ADD_PET: "添加宠物",
  EDIT_PET: "编辑宠物",
  DELETE_PET: "删除宠物",

  // 提示
  ENTER_NAME: "请输入客户姓名",
  ENTER_PHONE: "请输入联系电话",
  NO_PETS: "该客户还没有宠物",
};

// 会员相关
export const MEMBER = {
  TITLE: "会员管理",
  UPGRADE: "升级会员",
  RECHARGE: "会员充值",
  POINTS: "积分管理",
  DETAIL: "会员详情",

  // 会员等级
  LEVEL_REGULAR: "普通用户",
  LEVEL_VIP: "VIP会员",

  // 字段
  LEVEL: "会员等级",
  POINTS: "会员积分",
  BALANCE: "储值余额",
  EXPIRE_DATE: "到期时间",
  JOIN_DATE: "成为会员时间",

  // 统计
  TOTAL_MEMBERS: "会员总数",
  VIP_MEMBERS: "VIP会员",
  TOTAL_BALANCE: "储值总额",
  TOTAL_POINTS: "积分总数",

  // 操作
  UPGRADE_TO_VIP: "升级为VIP",
  ADD_POINTS: "增加积分",
  DEDUCT_POINTS: "扣除积分",
  RECHARGE_BALANCE: "充值余额",

  // 提示
  SELECT_LEVEL: "请选择会员等级",
  ENTER_POINTS: "请输入积分",
  ENTER_AMOUNT: "请输入金额",
  UPGRADE_SUCCESS: "升级成功",
  RECHARGE_SUCCESS: "充值成功",
  POINTS_UPDATED: "积分更新成功",

  // 权益
  BENEFITS: "会员权益",
  DISCOUNT: "消费折扣",
  POINTS_RATE: "积分倍率",
};

// 宠物相关
export const PET = {
  TITLE: "宠物信息",
  NEW: "添加宠物",
  EDIT: "编辑宠物",

  // 字段
  NAME: "宠物名称",
  BREED: "品种",
  AGE: "年龄",
  GENDER: "性别",
  WEIGHT: "体重",
  NOTES: "备注",

  // 性别
  MALE: "公",
  FEMALE: "母",

  // 提示
  ENTER_NAME: "请输入宠物名称",
  ENTER_BREED: "请输入品种",
  ENTER_AGE: "请输入年龄",
  AGE_UNIT: "岁",
  WEIGHT_UNIT: "kg",
};

// 服务相关
export const SERVICE = {
  TITLE: "服务管理",
  NEW: "添加服务",
  EDIT: "编辑服务",
  DETAIL: "服务详情",
  LIST: "服务列表",

  // 字段
  NAME: "服务名称",
  DESCRIPTION: "服务描述",
  PRICE: "价格",
  DURATION: "时长",
  CATEGORY: "分类",

  // 提示
  ENTER_NAME: "请输入服务名称",
  ENTER_DESCRIPTION: "请输入服务描述",
  ENTER_PRICE: "请输入价格",
  ENTER_DURATION: "请输入时长",
  PRICE_UNIT: "元",
  DURATION_UNIT: "分钟",
};

// 用户相关
export const USER = {
  LOGIN: "登录",
  LOGOUT: "退出登录",
  PROFILE: "个人信息",

  // 字段
  EMAIL: "邮箱",
  PASSWORD: "密码",
  NAME: "姓名",

  // 提示
  ENTER_EMAIL: "请输入邮箱",
  ENTER_PASSWORD: "请输入密码",
  LOGIN_SUCCESS: "登录成功",
  LOGIN_FAILED: "登录失败",
  LOGOUT_SUCCESS: "退出成功",
  INVALID_CREDENTIALS: "邮箱或密码错误",
};

// 统计相关
export const STATS = {
  TODAY_APPOINTMENTS: "今日预约",
  TOTAL_CUSTOMERS: "客户总数",
  TOTAL_SERVICES: "服务项目",
  TOTAL_PETS: "宠物总数",
  MONTHLY_REVENUE: "本月营收",

  // 单位
  COUNT_UNIT: "个",
  CUSTOMER_UNIT: "位",
  SERVICE_UNIT: "项",
  PET_UNIT: "只",
  CURRENCY_UNIT: "元",
};

// 快捷操作
export const QUICK_ACTIONS = {
  TITLE: "快捷操作",
  NEW_APPOINTMENT: "新建预约",
  ADD_CUSTOMER: "添加客户",
  ADD_SERVICE: "添加服务",
};

// 时间相关
export const TIME = {
  TODAY: "今天",
  YESTERDAY: "昨天",
  THIS_WEEK: "本周",
  THIS_MONTH: "本月",
  LAST_MONTH: "上月",
  CUSTOM: "自定义",

  // 格式
  DATE_FORMAT: "YYYY-MM-DD",
  TIME_FORMAT: "HH:mm",
  DATETIME_FORMAT: "YYYY-MM-DD HH:mm",
};

// 商品相关
export const PRODUCT = {
  TITLE: "商品管理",
  NEW: "添加商品",
  EDIT: "编辑商品",
  DETAIL: "商品详情",
  LIST: "商品列表",

  // 字段
  NAME: "商品名称",
  CATEGORY: "商品分类",
  PRICE: "售价",
  COST: "成本",
  STOCK: "库存数量",
  MIN_STOCK: "最低库存预警",
  UNIT: "单位",
  DESCRIPTION: "商品描述",
  IMAGE: "商品图片",
  STATUS: "状态",
  LOW_STOCK: "库存不足",

  // 分类
  CATEGORY_FOOD: "食品",
  CATEGORY_SUPPLIES: "用品",
  CATEGORY_MEDICINE: "药品",
  CATEGORY_TOY: "玩具",
  CATEGORY_PET: "宠物",
  CATEGORY_OTHER: "其他",

  // 单位
  UNIT_PIECE: "个",
  UNIT_BAG: "袋",
  UNIT_BOTTLE: "瓶",
  UNIT_BOX: "盒",

  // 状态
  STATUS_ACTIVE: "在售",
  STATUS_INACTIVE: "已下架",

  // 操作
  TOGGLE_STATUS: "切换状态",
  ACTIVATE: "上架",
  DEACTIVATE: "下架",
  BATCH_DELETE: "批量删除",
  BATCH_ACTIVATE: "批量上架",
  BATCH_DEACTIVATE: "批量下架",
  SELECTED_COUNT: "已选择",
  CLEAR_SELECTION: "清空选择",

  // 提示
  ENTER_NAME: "请输入商品名称",
  ENTER_CATEGORY: "请选择商品分类",
  ENTER_PRICE: "请输入售价",
  ENTER_COST: "请输入成本",
  ENTER_STOCK: "请输入库存数量",
  ENTER_MIN_STOCK: "请输入最低库存预警",
  ENTER_UNIT: "请选择单位",
  PRICE_UNIT: "元",
  STOCK_UNIT: "件",
};
