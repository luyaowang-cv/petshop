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
    'pages/profile-edit/index',
  ],
  window: {
    backgroundTextStyle: 'light',
    backgroundColor: '#F6F7F9',
    navigationBarBackgroundColor: '#ffffff',
    navigationBarTitleText: '爱尚宠物',
    navigationBarTextStyle: 'black',
  },
  tabBar: {
    color: '#9B9FA6',
    selectedColor: '#FF7A45',
    backgroundColor: '#ffffff',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/home/index',
        text: '首页',
        iconPath: 'assets/tabbar/home.png',
        selectedIconPath: 'assets/tabbar/home-active.png',
      },
      {
        pagePath: 'pages/appointments/index',
        text: '预约',
        iconPath: 'assets/tabbar/appointment.png',
        selectedIconPath: 'assets/tabbar/appointment-active.png',
      },
      {
        pagePath: 'pages/me/index',
        text: '我的',
        iconPath: 'assets/tabbar/me.png',
        selectedIconPath: 'assets/tabbar/me-active.png',
      },
    ],
  },
})
