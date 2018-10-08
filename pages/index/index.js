//index.js
//获取应用实例
const app = getApp();
var amapFile = require('../../libs/amap-wx.js');
let amapFun = new amapFile.AMapWX({
  key: app.globalData.amapkey
});
var QQMapWX = require('../../libs/qqmap-wx-jssdk.min');
var qqmapsdk = new QQMapWX({
  key: app.globalData.qqmapkey
});
Page({
  data: {
    mapHeight: 0,
    myLongitude: 0, // 经度
    myLatitude: 0, // 纬度
    curLongitude: 0, // 经度
    curLatitude: 0, // 纬度
    markers: [],
    controls: [],
    line: [],
    polyline: [],
    restaurantName: '',
    address: '',
    distance: 0,
    cost: 0,
    curMarkerId: 0,
    page_index: 1,
    mapType: '1',
    amap: 'active',
    qmap: ''
  },
  onReady: function(e) {
    // 使用 wx.createMapContext 获取 map 上下文,map为map的id
    this.mapCtx = wx.createMapContext('map')
  },
  onShow() {
    const that = this;
    app.getMyLocation(function (res){
      that.setData({
        myLatitude: res.latitude,
        myLongitude: res.longitude,
        curLongitude: res.longitude,
        curLatitude: res.latitude
      });
      //that.getRestaurantQQ();
      that.getRestaurantAmap();
    })
    wx.getSystemInfo({ // 设置地图高度，否则地图高度为0
      success: function(res) {
        that.setData({
          mapHeight: res.windowHeight,
        })
      }
    });
  },
  getRestaurantAmap: function () {
    const that = this;
    amapFun.getPoiAround({
      iconPathSelected: '../../image/restaurant5.png',
      iconPath: '../../image/restaurant4.png',
      querytypes: '餐饮服务',
      location: that.data.curLongitude + ',' + that.data.curLatitude,
      success: function(res) {
        console.log(res);
        let data = res.markers;
        let markers = [];
        let marker = {};
        if (data.length > 0) {
          for (let i = 0; i < data.length; i++) {
            marker = {
              id: i,
              latitude: data[i].latitude,
              longitude: data[i].longitude,
              restaurantName: data[i].name,
              iconPath: data[i].iconPath,
              address: data[i].address
            }
            markers.push(marker);
          }
          that.setData({
            markers: markers,
            restaurantName: data[0].name,
            address: data[0].address,
            curMarkerId: 0
          })
          that.distanceAmap();
        }
      },
      fail: function(info) {
        //失败回调
        console.log(info)
      }
    })
  },
  getRestaurantQQ: function() {
    const that = this;
    qqmapsdk.search({
      keyword: '餐饮',  //搜索关键词
      location: that.data.curLatitude + ',' + that.data.curLongitude,  //设置周边搜索中心点
      page_size: 20,
      page_index: that.data.page_index,
      success: function (res) { //搜索成功后的回调
        let mks = [];
        let data = res.data;
        for (let i = 0; i < data.length; i++) {
          if(i == 0){
            mks.push({ // 获取返回结果，放到mks数组中
              restaurantName: data[i].title,
              id: data[i].id,
              latitude: data[i].location.lat,
              longitude: data[i].location.lng,
              iconPath: "../../image/restaurant5.png", //图标路径
              address: data[i].address,
            })
          }else{
            mks.push({ // 获取返回结果，放到mks数组中
              id: i,
              latitude: data[i].location.lat,
              longitude: data[i].location.lng,
              iconPath: "../../image/restaurant4.png", //图标路径
              restaurantName: data[i].title,
              restaurantId: data[i].id,
              address: data[i].address,
            
            })
          }
        }
        that.setData({ //设置markers属性，将搜索结果显示在地图中
          markers: mks,
          restaurantName: data[0].title,
          address: data[0].address,
          curMarkerId: 0
        })
        that.distanceQQmap();
      },
      fail: function (res) {
        console.log(res);
      }
    });
  },
  markertap(e) {
    console.log(e);
    let markerId = e.markerId;
    this.resetMarkers(markerId);
  },
  // 地图发生变化的时候，获取中间点，也就是用户选择的位置
  regionchange(e) {
    if (e.type == 'end') {
      this.getLngLat();
    }
  },
  // 获取中间点的经纬度，并mark出来
  getLngLat: function() {
    let that = this;
    that.mapCtx = wx.createMapContext("map");
    that.mapCtx.getCenterLocation({
      success: function(res) {
        let curLatitude = res.latitude;
        let curLongitude = res.longitude;
        that.setData({
          curLongitude: curLongitude,
          curLatitude: curLatitude
        })
        if(that.data.mapType == '1'){
          that.getRestaurantAmap();
        }else{
          that.getRestaurantQQ();
        }
      }
    })
  },
  random: function() {
    let restaurants = this.data.markers;
    let num = Math.floor(Math.random() * (restaurants.length));
    console.log(num);
    this.resetMarkers(num);
  },
  resetMarkers: function(markerId) {
    // let marker = this.data.markers;
    // for (let item of marker) {
    //   if (item.id == markerId) {
    //     item.iconPath = '../../image/restaurant5.png';
    //     this.data.restaurantName = item.restaurantName;
    //     this.data.address = item.address;
    //   } else {
    //     item.iconPath = '../../image/restaurant4.png';
    //   }
    // }
    let lastMarker = "markers["+this.data.curMarkerId+"].iconPath";
    let newMarker = "markers["+markerId+"].iconPath";
    this.setData({
      //markers: marker,
      [lastMarker]: '../../image/restaurant4.png',
      [newMarker]: '../../image/restaurant5.png',
      curMarkerId: markerId,
      restaurantName: this.data.markers[markerId].restaurantName,
      address: this.data.markers[markerId].address
    })
    if(this.data.mapType == '1'){
      this.distanceAmap();
      console.log(12);
    }else{
      this.distanceQQmap();
    }
  },
  distanceAmap: function() {
    const that = this;
    let marker = this.data.markers[this.data.curMarkerId];
    amapFun.getWalkingRoute({
      origin: that.data.myLongitude + ',' + that.data.myLatitude, // 出发点,lon,lat
      destination: marker.longitude + ',' + marker.latitude, // 目的地
      success: function(data) {
        let points = [];
        if (data.paths && data.paths[0] && data.paths[0].steps) {
          let steps = data.paths[0].steps;
          for (let i = 0; i < steps.length; i++) {
            let poLen = steps[i].polyline.split(';');
            for (let j = 0; j < poLen.length; j++) {
              points.push({
                longitude: parseFloat(poLen[j].split(',')[0]),
                latitude: parseFloat(poLen[j].split(',')[1])
              })
            }
          }
        }
        let distance = 0;
        let cost = 0;
        if (data.paths[0] && data.paths[0].distance) {
          distance = data.paths[0].distance;
        }
        if (data.paths[0] && data.paths[0].duration) {
            cost= parseInt(data.paths[0].duration / 60);
        }
        that.setData({
          line: [{
            points: points,
            color: "#5aad80",
            width: 3
          }],
          distance: distance,
          cost: cost
        });
      },
      fail: function(info) {
        console.log(info);
      }
    });
  },
  distanceQQmap: function(){
    let that = this;
    let marker = this.data.markers[this.data.curMarkerId];
    //网络请求设置
    let opt = {
      //WebService请求地址，from为起点坐标，to为终点坐标，开发key为必填
      url: 'https://apis.map.qq.com/ws/direction/v1/walking/?from=' + that.data.myLatitude + ',' + that.data.myLongitude + '&to=' + marker.latitude + ',' + marker.longitude + '&key=' + app.globalData.qqmapkey,
      method: 'GET',
      dataType: 'json',
      //请求成功回调
      success: function (res) {
        console.log(res);
        let ret = res.data
        if (ret.status != 0) return; //服务异常处理
        let coors = ret.result.routes[0].polyline, 
            pl = [];
        let distance = ret.result.routes[0].distance;
        let cost = ret.result.routes[0].duration;
        //坐标解压（返回的点串坐标，通过前向差分进行压缩）
        let kr = 1000000;
        for (let i = 2; i < coors.length; i++) {
          coors[i] = Number(coors[i - 2]) + Number(coors[i]) / kr;
        }
        //将解压后的坐标放入点串数组pl中
        for (let i = 0; i < coors.length; i += 2) {
          pl.push({ latitude: coors[i], longitude: coors[i + 1] })
        }
        //设置polyline属性，将路线显示出来
        that.setData({
          line: [{
            points: pl,
            color: "#5aad80",
            width: 3
          }],
          distance: distance,
          cost: cost
        })
      }
    };
    wx.request(opt);
  },
  toList: function() {
    wx.navigateTo({
      url: '../list/list',
    })
  },
  switchMap: function(e){
    let mapType = e.target.dataset.type;
    if(mapType == '1'){
      this.setData({
        mapType: mapType,
        amap: 'active',
        qmap: ''
      });
      this.getRestaurantAmap();
    }else{
      this.setData({
        mapType: mapType,
        amap: '',
        qmap: 'active'
      })
      this.getRestaurantQQ();
    }
  }
})