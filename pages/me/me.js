// pages/me/me.js
//获取应用实例
var app = getApp();
Page({
  data: {
    user: {}
  },
  onShow: function(){
    this.getData();
  },
  getData: function(){
    var _this = this;
    var date=new Date();
    var month=(new Date()).getMonth();
    var days = ['一','二','三','四','五','六','日'];
    _this.setData({
      'user': app._user,
      'is_bind': !!app._user.is_bind,
      'today': app.util.getYMD(date),
      'quarter': Math.ceil(month/3),
      'week': days[date.getUTCDay()]
    });
  }
});