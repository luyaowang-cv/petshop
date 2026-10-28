export default defineAppConfig({
  pages: [
    'pages/login/index',
    'pages/home/index',
    'pages/appointments/index',
    'pages/me/index',
    'pages/pets/index',
    'pages/pet-detail/index',
    'pages/pet-edit/index',
    'pages/booking/index',
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#ffffff',
    navigationBarTitleText: '爱尚宠物',
    navigationBarTextStyle: 'black',
  },
  tabBar: {
    color: '#999999',
    selectedColor: '#07c160',
    backgroundColor: '#ffffff',
    borderStyle: 'black',
    list: [
      { pagePath: 'pages/home/index', text: '首页' },
      { pagePath: 'pages/appointments/index', text: '预约' },
      { pagePath: 'pages/me/index', text: '我的' },
    ],
  },
})
