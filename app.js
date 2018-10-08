//app.js
App({
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