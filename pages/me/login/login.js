// pages/me/login/login.js
//获取应用实例
var api = require('../../../utils/api.js')
var app=getApp()
Page({
  data: {
    remind: '加载中',
    help_status: false,
    username_focus: false,
    passwd_focus: false,
    username: '',
    passwd: '',
    angle: 0
  },
  onReady: function () {
    var _this = this;
    setTimeout(function () {
      _this.setData({
        remind: ''
      });
    }, 1000);
    wx.onAccelerometerChange(function (res) {
      var angle = -(res.x * 30).toFixed(1);
      if (angle > 14) { angle = 14; }
      else if (angle < -14) { angle = -14; }
      if (_this.data.angle !== angle) {
        _this.setData({
          angle: angle
        });
      }
    });
  },
  bind: function () {
    var _this = this;
    if (!_this.data.username || !_this.data.passwd) {
      app.showErrorModal('账号及密码不能为空', '提醒');
      return false;
    }
    app.showLoadToast('绑定中');
    api.post('/bind',{
        username: _this.data.username,
        password: _this.data.passwd
      }).then(res => {
      if (res.status === 200) {
        app.showLoadToast('请稍候');
        //清除缓存
        if (app.cache) {
          wx.removeStorage({ key: 'cache' });
          app.cache = '';
        }
        app.getUser(function () {
          wx.showToast({
            title: '绑定成功',
            icon: 'success',
            duration: 1500
          });
          wx.navigateBack();
        });
      } else {
        wx.hideToast();
        app.showErrorModal(res.msg, '绑定失败');
      }
    }).catch(err => {
      wx.hideToast();
      app.showErrorModal(err.errMsg, '绑定失败');
    })
  },
  usernameInput: function (e) {
    this.setData({
      username: e.detail.value
    });
    if (e.detail.value.length >= 11) {
      wx.hideKeyboard();
    }
  },
  passwdInput: function (e) {
    this.setData({
      passwd: e.detail.value
    });
  },
  inputFocus: function (e) {
    if (e.target.id == 'username') {
      this.setData({
        'username_focus': true
      });
    } else if (e.target.id == 'passwd') {
      this.setData({
        'passwd_focus': true
      });
    }
  },
  inputBlur: function (e) {
    if (e.target.id == 'username') {
      this.setData({
        'username_focus': false
      });
    } else if (e.target.id == 'passwd') {
      this.setData({
        'passwd_focus': false
      });
    }
  },
  tapHelp: function (e) {
    if (e.target.id == 'help') {
      this.hideHelp();
    }
  },
  showHelp: function (e) {
    this.setData({
      'help_status': true
    });
  },
  hideHelp: function (e) {
    this.setData({
      'help_status': false
    });
  }
});