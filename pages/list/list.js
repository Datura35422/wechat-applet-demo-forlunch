// pages/list/list.js
const app = getApp();
// 引入SDK核心类
const QQMapWX = require('../../libs/qqmap-wx-jssdk.min');
// 实例化API核心类
const qqmapsdk = new QQMapWX({
  key: app.globalData.qqmapkey
});
Page({
  data: {
    list: [],
    page_index: 1,
    randomRestaurant: '',
    restaurant: []
  },
  onLoad: function (options) {
    const that = this;
    app.getMyLocation(function () {
      that.getRestaurantQQ();
    })
  },
  upper: function () {
    this.setData({
      list: [],
      page_index: 1,
      restaurant: []
    })
    this.getRestaurantQQ();
  },
  lower: function () {
    this.setData({
      page_index: this.data.page_index+1
    })
    this.getRestaurantQQ();
  },
  onShareAppMessage: function () {

  },
  getRestaurantQQ: function () {
    const that = this;
    qqmapsdk.search({
      keyword: '餐饮',  //搜索关键词
      location: app.globalData.myLatitude + ',' + app.globalData.myLongitude,  //设置周边搜索中心点
      page_size: 20,
      page_index: that.data.page_index,
      success: function (res) { //搜索成功后的回调
        wx.stopPullDownRefresh();
        console.log(res);
        let newlist = [];
        let data = res.data;
        let item = {};
        for (let i = 0; i < data.length; i++) {
          item = {
            id: data[i].id,
            select: true,
            title: data[i].title,
            desc: data[i].category.split(':')[1]
          }
          newlist.push(item);
        }
        that.data.restaurant = that.data.restaurant.concat(newlist);
        that.data.list = that.data.list.concat(newlist);
        that.setData({ //设置markers属性，将搜索结果显示在地图中
          list: that.data.list,
          restaurant: that.data.restaurant
        })
      },
      fail: function (res) {
        console.log(res);
      }
    });
  },
  selectSwitch: function(e){
    console.log(e); //.target.dataset
    let index = e.target.dataset.index;
    let item = "list["+index+"].select";
    let listItem = this.data.list[index];
    let rest = this.data.restaurant;
    if(listItem.select){ // 选中 -》 未选中
      for (let i = 0, len = rest.length;i<len;i++){
        if (listItem.id == rest[i].id){
          this.data.restaurant.splice(i, 1);
          break;
        }
      }
    }else{//未选中 -》选中
      this.data.restaurant.push(listItem);
    }
    this.setData({
      [item]: !this.data.list[index].select,
      restaurant: this.data.restaurant
    })
  },
  random: function(){
    let len = this.data.restaurant.length;
    let index = Math.floor(Math.random() * (len));
    console.log(index);
    if(len > 0){
      this.setData({
        randomRestaurant: this.data.restaurant[index].title
      })
    }
  }
})