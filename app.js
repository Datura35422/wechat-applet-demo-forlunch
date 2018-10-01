//app.js
App({
  onLaunch: function () {
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
  },
  globalData: {
    userInfo: null,
    amapkey: 'd34095f6c86e603ae4026fe74f4128c6',
    qqmapkey: 'YO5BZ-3BR32-43AU3-CTHPG-CLALO-MMFUP',
    myLongitude: 0, // 经度
    myLatitude: 0, // 纬度
  },
  getMyLocation: function(cb){
    const that = this;
    wx.getLocation({
      type: 'gcj02', //返回可以用于wx.openLocation的经纬度
      success(res) {
        that.globalData.myLatitude = res.latitude;
        that.globalData.myLongitude = res.longitude;
        if(typeof cb == 'function'){
          cb(res);
        }
        console.log(res,that.globalData);
      }
    });
  }
})