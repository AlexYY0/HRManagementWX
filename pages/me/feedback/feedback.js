// pages/me/feedback/feedback.js
//获取应用实例
var api = require('../../../utils/api.js')
var app = getApp();
Page({
  data: {
    title: '',
    content: '',
    info: '',
    imgs: [],
    imgLen: 0,
    upload: false,
    uploading: false,
    qiniu: ''
  },
  onLoad: function () {
    var _this = this;
    wx.getSystemInfo({
      success: function (res) {
        var info = '---\r\n用户信息\r\n';
        info += '微信名：' + app._user.wx.nickName;
        info += '（工号：' + app._user.we.userid + '-姓名：' + app._user.we.empname + '）';
        info += '\r\n手机型号：' + res.model;
        info += '（' + res.windowWidth + 'x' + res.windowHeight + '）';
        info += '\r\n微信版本号：' + res.version;
        _this.setData({
          info: info
        });
      }
    });
    api.get('/gettoken',{}).then(res => {
      if (res.obj && res.status === 200) {
		  _this.setData({
            upload: true,
            qiniu: res.obj
          });
      }else {
        wx.hideToast();
        app.showErrorModal(res.msg, '获取七牛云令牌失败');
      }
    }).catch(err => {
      wx.hideToast();
      app.showErrorModal(err.errMsg, '获取七牛云令牌失败');
    });
  },
  listenerTitle: function (e) {
    this.setData({
      'title': e.detail.value
    });
  },
  listenerTextarea: function (e) {
    this.setData({
      'content': e.detail.value
    });
  },
  choosePhoto: function () {
    var _this = this;
    wx.showModal({
      title: '提示',
      content: '上传图片需要消耗流量，是否继续？',
      confirmText: '继续',
      success: function (res) {
        if (res.confirm) {
          wx.chooseImage({
            count: 4,
            sourceType: ['album'],
            success: function (res) {
              var tempFilePaths = res.tempFilePaths, imgLen = tempFilePaths.length;
              _this.setData({
                uploading: true,
                imgLen: imgLen
              });
              tempFilePaths.forEach(function (e) {
                _this.uploadImg(e);
              });
            }
          });
        }
      }
    });
  },
  uploadImg: function (path) {
    var _this = this;
    // 上传图片
    wx.uploadFile({
      url: 'https://upload.qiniup.com',
      header: {
        'Content-Type': 'multipart/form-data'
      },
      filePath: path,
      name: 'file',
      formData: {
        token: _this.data.qiniu
      },
      success: function (res) {
        var data = JSON.parse(res.data);
        if (data.key) {
          _this.setData({
            imgs: _this.data.imgs.concat('http://storage.emperorws.club/' + data.key)
          });
        }
        if (_this.data.imgs.length === _this.data.imgLen) {
          _this.setData({
            uploading: false
          });
        }
      },
      fail: function (res) {
        _this.setData({
          imgLen: _this.data.imgLen - 1
        });
      }
    });
  },
  previewPhoto: function (e) {
    var _this = this;
    //预览图片
    if (_this.data.uploading) {
      app.showErrorModal('正在上传图片', '预览失败');
      return false;
    }
    wx.previewImage({
      current: _this.data.imgs[e.target.dataset.index],
      urls: _this.data.imgs
    });
  },
  submit: function () {
    var _this = this, title = '', content = '', imgs = '';
    if (_this.data.uploading) {
      app.showErrorModal('正在上传图片', '提交失败');
      return false;
    }
    if (!_this.data.title) {
      app.showErrorModal('请输入反馈标题', '提交失败');
      return false;
    }
    wx.showModal({
      title: '提示',
      content: '是否确认提交反馈？',
      success: function (res) {
        if (res.confirm) {
          if (!_this.data.content) {
            app.showErrorModal('请输入反馈内容', '提交失败');
            return false;
          }
          title = '【' + app._user.wx.nickName + '】' + _this.data.title;
          content = _this.data.content + '\r\n\r\n' + _this.data.info;
          if (_this.data.imgLen) {
            _this.data.imgs.forEach(function (e) {
              imgs += '\r\n\r\n' + '![img](' + e + '?imageView2/2/w/750/interlace/0/q/88|watermark/2/text/V2Xph43pgq4=/font/5b6u6L2v6ZuF6buR/fontsize/500/fill/I0VGRUZFRg==/dissolve/100/gravity/SouthEast/dx/10/dy/10)';
            });
            content += imgs;
          }
          app.showLoadToast();
		  api.get('/feedback',{
			  title: title,
              content: content
		  }).then(res => {
			  if (res.data.obj && res.status === 200) {
				  var text = '反馈成功，您可通过访问 ' + res.data.obj.url + ' 了解反馈动态';
				  wx.showModal({
					  title: '反馈成功',
					  content: text,
					  showCancel: false,
					  success: function (res) {
						wx.navigateBack();
					  }
				});
			  }else {
                wx.hideToast();
				app.showErrorModal(res.data.msg, '提交失败');
			  }
			}).catch(err => {
              wx.hideToast();
			  app.showErrorModal(err.errMsg, '提交失败');
			});
          }
        }
    });
  }
});