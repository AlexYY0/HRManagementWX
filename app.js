/**
 * App() 函数
 * 
 * 用来注册一个小程序。接受一个 object 参数，其指定小程序的生命周期函数等。
 * 
 * @param onLaunch // 当小程序初始化完成时，会触发 onLaunch（全局只触发一次）
 * @param onShow   // 当小程序启动，或从后台进入前台显示，会触发 onShow
 * @param onHide   // 当小程序从前台进入后台，会触发 onHide
 * @param getUserInfo // 获取用户信息
 * 
 * @author marsliang <marsliang@tencent.com>
 * @date   2016‎-11-‎14 ‎20:07:04
 * @update 2016-11-17
 */
//app.js
App({
  onLaunch: function () {
    // 展示本地存储能力
    console.log('APP-onLaunch 生命周期函数--监听小程序初始化');
    var _this = this;
    //读取缓存
    try {
      var data = wx.getStorageSync('cache')
      if (data) {
        _this.cache = data;
        _this.processData(data);
      }
    } catch (e) { }
  },

  //后台切换至前台时
  onShow: function () {
    console.log('App-onShow 生命周期函数--监听小程序显示');
  },

  onHide: function () {
    console.log('App-onHide 生命周期函数--监听小程序隐藏');
  },

  //getUser函数，在index中调用
  getUser: function (update_cb, bind) {
    var _this = this;
    wx.login({
      success: function (res) {
        if (res.code) {
          //调用函数获取微信用户信息
          _this.getUserInfo(function (info) {
            _this._user.wx = info.userInfo;
            //发送code与微信用户信息，获取学生数据
            wx.request({
              method: 'POST',
              header: {
                "Content-Type":"application/x-www-form-urlencoded"
              },
              url: _this._server + '/wxlogin',
              data: {
                "code" : res.code
              },
              success: function (res) {
                if (res.data && res.data.status == 200) {
                  var status = false;
                  //判断缓存是否有更新
                  if (!_this.cache || _this.cache != res.data.obj) {
                    wx.setStorage({
                      key: "cache",
                      data: res.data.obj
                    });
                    status = true;
                    _this.processData(res.data.obj);
                  }
                  if (!_this._user.is_bind) {
                    wx.navigateTo({
                      url: '/pages/me/login/login'
                    });
                  }
                  //如果缓存有更新，则执行回调函数
                  if (status) {
                    typeof update_cb == "function" && update_cb();
                  }
                } else {
                  //清除缓存
                  if (_this.cache) {
                    wx.removeStorage({ key: 'cache' });
                    _this.cache = '';
                  }
                }
              },
              fail: function (res) {
                //清除缓存
                if (_this.cache) {
                  wx.removeStorage({ key: 'cache' });
                  _this.cache = '';
                }
              }
            });
          });
        }
      }
    });
  },

  processData: function (data) {
    var _this = this;
    _this._user.we = data;
    _this._user.is_bind = data.is_bind;
    _this._user.skey = data.authorization;
    return data;
  },

  getUserInfo: function (cb) {
    //获取微信用户信息
    wx.getUserInfo({
      success: function (res) {
        typeof cb == "function" && cb(res);
      }
    });
  },
  showErrorModal: function (content, title) {
    wx.showModal({
      title: title || '加载失败',
      content: content || '未知错误',
      showCancel: false
    });
  },
  showLoadToast: function (title, duration) {
    wx.showToast({
      title: title || '加载中',
      icon: 'loading',
      duration: duration || 10000
    });
  },
  util: require('/utils/util.js'),
  _server: 'http://localhost:8081/wechatapi',
  _user: {
    //微信数据
    wx: {},
    //员工数据
    we: {},
  },
});