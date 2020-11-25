// pages/sign/sign.js
var api = require('../../utils/api.js')
//获取应用实例
var app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    user: {},
    // 是否有签到任务
    flag: false,
    remind: '加载中',
    duration: 400,
    distance: '0',

    currenttask: {},
    clockInFlag: 0,
    currentTimeFlag: 0,
    // 倒计时
    clock: {
      hour: '00',
      min: '00'
    },
    // 打卡按钮状态 0:未按压 1：按压 2：完成
    btn: 0,
    btnPress: false,

    updateAddres: false,

    // 提示框默认隐藏
    modalHidden: true,
    modalText: '',
  },

  // 更新任务数据
  updateDistance: function () {
    var that = this;

    this.setData({
      updateAddres: true
    });

    setTimeout(function () {
      that.setData({
        updateAddres: false
      });
    }, 1000);

    this.updateTask();
  },
  // 获取任务
  updateTask: function () {
    var that = this;
    var today=app.util.getYMD(new Date());
    api.get('/getattelogday',{
      today: today
    }).then(res => {
      if (res.obj && res.status === 200) {
        that.setData({
          currenttask: res.obj
        })
        wx.getLocation({
          type: 'wgs84', // 默认为 wgs84 返回 gps 坐标，gcj02 返回可用于 wx.openLocation 的坐标
          success: function(res){
            var my = {
              latitude: res.latitude,
              longitude: res.longitude
            }
            var d = that.getDistance(my.latitude, my.longitude, that.data.currenttask.latitude, that.data.currenttask.longitude);
            that.setData({
              distance: '打卡位置距离您还有' + d + '公里'
            })

            that.setData({
              flag: true,
              clockInFlag: that.data.currenttask.attelogday.clockinflag
            })
            // 时间
            var sign;
            var out;
            var now = new Date();
            var nowDate = app.util.getYMD(now);
            var time_str = nowDate + ' ' + that.data.currenttask.businesshours.begintime;
            var time_end = nowDate + ' ' + that.data.currenttask.businesshours.endtime;
            sign = new Date(time_str.replace(/-/g, '/'));
            out = new Date(time_end.replace(/-/g, '/'));

            var disBeginTime = Math.abs(now.getTime() - sign.getTime());
            var disEndTime = Math.abs(now.getTime() - out.getTime());
            if (now.getTime() <= sign.getTime()) {
              // 未上班
              that.setData({
                currentTimeFlag: 0
              })
              that.setData({
                'clock.hour': app.util.formatNumber(Math.floor(disBeginTime/(3600*1000))),
                'clock.min': app.util.formatNumber(Math.floor(disBeginTime%(3600*1000)/(60*1000)))
              })
            } else if(now.getTime() <= out.getTime() && now.getTime() > sign.getTime()) {
              // 上班中
              that.setData({
                currentTimeFlag: 1
              })
              if(that.data.clockInFlag==0){
                that.setData({
                  'clock.hour': app.util.formatNumber(Math.floor(disBeginTime/(3600*1000))),
                  'clock.min': app.util.formatNumber(Math.floor(disBeginTime%(3600*1000)/(60*1000)))
                })
              } else{
                that.setData({
                  'clock.hour': app.util.formatNumber(Math.floor(disEndTime/(3600*1000))),
                  'clock.min': app.util.formatNumber(Math.floor(disEndTime%(3600*1000)/(60*1000)))
                })
              }
            } else {
              // 已下班
              that.setData({
                currentTimeFlag: 2
              })
              that.setData({
                'clock.hour': app.util.formatNumber(Math.floor(disEndTime/(3600*1000))),
                'clock.min': app.util.formatNumber(Math.floor(disEndTime%(3600*1000)/(60*1000)))
              })
            }
          }
        })
      } else if (res.status === 200) {
        wx.hideToast();
        app.showErrorModal(res.msg, '好好休息，今日不用打卡');
      } else {
        wx.hideToast();
        app.showErrorModal(res.msg, '获取打卡数据失败');
      }
    }).catch(err => {
      wx.hideToast();
      app.showErrorModal(err.errMsg, '获取打卡数据失败');
    })
  },
  // 计算距离
  getDistance: function (lat1, lng1, lat2, lng2) {
    function rad(d) {
      return d * Math.PI / 180.0
    }

    var radLat1 = rad(lat1);
    var radLat2 = rad(lat2);
    var a = radLat1 - radLat2;
    var b = rad(lng1) - rad(lng2);
    var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a/2),2) +
        Math.cos(radLat1)*Math.cos(radLat2)*Math.pow(Math.sin(b/2),2)));
    s = s * 6378.137 ;// EARTH_RADIUS;
    s = (Math.round(s * 10000) / 10000).toFixed(2);
    return s;

  },

  // 签到打卡
  signTask: function () {
    var that = this;
    var d;

    if (!this.data.btnPress) {
      wx.showToast({
        title: '请求中',
        icon: 'loading',
        duration: 1000
      })
      this.setData({
        'btn': 1,
        'btnPress': true
      });
      setTimeout(function () {
        that.setData({
          'btn': 0,
          'btnPress': false
        });
      }, 500);

      wx.getLocation({
        type: 'wgs84',
        success: function(res){
          var my = {
            latitude: res.latitude,
            longitude: res.longitude
          };
          var d = that.getDistance(my.latitude, my.longitude, that.data.currenttask.latitude, that.data.currenttask.longitude);

          if (d < 10) {
            if (that.data.currentTimeFlag == 0 && parseInt(that.data.clock.hour) > 2) {
              that.setData({
                modalText: '您来的太早了',
                modalHidden: false
              })
            } else if(that.data.currentTimeFlag == 0 && parseInt(that.data.clock.hour) < 2){
              //打卡上班
              api.get("/signin",{
                signintime: app.util.formatTime(new Date()),
                clockinflag: 20
              }).then(res => {
                if (res.status === 200) {
                  that.updateTask();
                  wx.showToast({
                    title: '签到成功',
                    icon: 'success',
                    duration: 1000
                  });
                  that.setData({
                    clockInFlag: 20,
                    modalHidden: true
                  })
                }else {
                  wx.hideToast();
                  app.showErrorModal(res.msg, '上班打卡失败');
                }
              }).catch(err => {
                wx.hideToast();
                app.showErrorModal(err.errMsg, '上班打卡失败');
              })
            } else if(that.data.currentTimeFlag == 1 && that.data.clockInFlag == 0){
              //迟到打卡
              api.get("/signin",{
                signintime: app.util.formatTime(new Date()),
                clockinflag: 10
              }).then(res => {
                if (res.status === 200) {
                  that.updateTask();
                  wx.showToast({
                    title: '签到成功',
                    icon: 'success',
                    duration: 1000
                  });
                  that.setData({
                    clockInFlag: 10,
                    modalHidden: true
                  })
                }else {
                  wx.hideToast();
                  app.showErrorModal(res.msg, '上班打卡失败');
                }
              }).catch(err => {
                wx.hideToast();
                app.showErrorModal(err.errMsg, '上班打卡失败');
              })
            } else if(that.data.currentTimeFlag == 1 && (that.data.clockInFlag == 10||that.data.clockInFlag ==20)){
              //早退打卡
              api.get("/signout",{
                signouttime: app.util.formatTime(new Date()),
              }).then(res => {
                if (res.status === 200) {
                  that.updateTask();
                  wx.showToast({
                    title: '早退成功',
                    icon: 'success',
                    duration: 1000
                  });
                  that.setData({
                    clockInFlag: 21,
                    modalHidden: true
                  })
                }else {
                  wx.hideToast();
                  app.showErrorModal(res.msg, '早退下班打卡失败');
                }
              }).catch(err => {
                wx.hideToast();
                app.showErrorModal(err.errMsg, '早退下班打卡失败');
              })
            } else if(that.data.currentTimeFlag == 2){
              //打卡下班
              api.get("/signout",{
                signouttime: app.util.formatTime(new Date()),
              }).then(res => {
                if (res.status === 200) {
                  that.updateTask();
                  wx.showToast({
                    title: '签退成功',
                    icon: 'success',
                    duration: 1000
                  });
                  that.setData({
                    clockInFlag: 22,
                    modalHidden: true
                  })
                }else {
                  wx.hideToast();
                  app.showErrorModal(res.msg, '下班打卡失败');
                }
              }).catch(err => {
                wx.hideToast();
                app.showErrorModal(err.errMsg, '下班打卡失败');
              })
            }
          } else {
            wx.hideToast()
            that.setData({
              'modalText': '您还没有到达任务地点附近',
              'modalHidden': false
            });
          }
          // success
        },
        fail: function() {
          // fail
        },
        complete: function() {
          // complete
        }
      })
    }

  },
  // 隐藏弹出框
  modalChange: function () {
    this.setData({
      'modalHidden': true
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    this.login();
  },
  login: function(){
    var _this = this;
    //如果有缓存
    if(!!app.cache){
      try{
        _this.response();
      }catch(e){
        //报错则清除缓存
        wx.removeStorage({ key: 'cache' });
      }
    }
    //然后通过登录用户, 如果缓存更新将执行该回调函数
    app.getUser(_this.response);
  },
  response: function(){
    var _this = this;
    _this.setData({
      user: app._user
    });
    //判断绑定状态
    if(!app._user.is_bind){
      _this.setData({
        'remind': '未绑定'
      });
    }else{
      _this.setData({
        'remind': '加载中'
      });
      _this.updateTask();
    }
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var _this = this;
    function isEmptyObject(obj){ for(var key in obj){return false;} return true; }
    function isEqualObject(obj1, obj2){ if(JSON.stringify(obj1) != JSON.stringify(obj2)){return false;} return true; }
    var l_user = _this.data.user,  //本页用户数据
        g_user = app._user; //全局用户数据
    //排除第一次加载页面的情况（全局用户数据未加载完整 或 本页用户数据与全局用户数据相等）
    if(isEmptyObject(l_user) || !g_user.skey || isEqualObject(l_user.we, g_user.we)){
      return false;
    }
    //全局用户数据和本页用户数据不一致时，重新获取卡片数据
    if(!isEqualObject(l_user.we, g_user.we)){
      //判断绑定状态
      if(!g_user.is_bind){
        _this.setData({
          'remind': '未绑定'
        });
      }else{
        _this.setData({
          'remind': '加载中'
        });
        //清空数据
        _this.setData({
          user: app._user,
        });
        _this.updateTask();
      }
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function(){
    if(app._user.is_bind){
      this.updateDistance();
    }
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})