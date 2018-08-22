//index.js
//获取应用实例
const app = getApp()

Page({
      data: {
        canIUse: wx.canIUse('button.open-type.getUserInfo')
      },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function () {

    wx.getSetting({
      success: function(res){
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称
          wx.getUserInfo({
            success: function(res) {
              //console.log(res.userInfo)
            }
          })
        }else if(!res.authSetting['scope.werun']){
          wx.authorize({
            scope: 'scope.werun',
            success() {
              // 用户已经同意小程序使用录音功能，后续调用 wx.startRecord 接口不会弹窗询问
              //wx.startRecord()
            }
          })
        }
      }
    });
  },
  bindGetUserInfo: function(e) {
    console.log(e.detail.userInfo)

    wx.navigateTo({
      url: '/pages/main/main'
    })
  }
})
