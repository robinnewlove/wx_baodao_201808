// pages/moment/moment.js
const stringUtil = require('../../utils/stringUtil.js');

var windowWidth;
var windowHeight;

var _windowWidth_pos;

const TEXT_COLOR = '#000000';
const WHITE = '#FFFFFF';
const THEME_COLOR = '#FF555C';
const GRAY_COLOR = '#333333';
const TINT_COLOR = '#747474';

const temp = 0.01;
//图片长宽比
const scale = 1.77866667;
//背景图高度
const bgScale = 1;
//头像和宽的比
const avatarWidthScale = 0.232;
const avatarHeightScale = 0.13043478;
//头像白色圆形背景
const avatarBgWidthScale = 0.232;
const avatarStrokeWidth = 1;
//昵称高度比
const nicknameHeightScale = 0.14 + 5 * temp;
//第一行文字高度
const topTextScale = 0.515 + 3 * temp;
//分享内容
const contentScale = 0.585 + 3 * temp;
const contentScale2 = 0.620 + 3 * temp;
//二维码直径
const qrCodeWidthScale = 0.341;
//二维码高度
const qrCodeHeightScale = 0.74;
//极客文字
const bpbScale = 0.91 + temp * 2;
//识别文字
const decodeScale = 0.935 + temp * 2;


Page({

  /**
   * 页面的初始数据
   */
  data: {
    detailStr: {
      // tip: 'canvas绘制,你值得拥有',
      // content: '组件库极客组件库',
      // contentOther: 'canvas，canvas，canvas',
      // bpbMini: '组件库演示小程序',
      clickToMini: '长按识别二维码'
    },
    avatar4: 'https://wx.qlogo.cn/mmopen/vi_32/gcs9nfrPIjZSfZvMmVCK81MpPbWqDspNfc2lRLqllfrpYT61RQWNMHXCfzSia7OiapOfXTjYFR6EF7JQZib5MRCdA/132',
    avatar: 'https://werun.renlai.fun/static/images/share-ico-1.png',
    bgImage1: 'https://werun.renlai.fun/static/images/sharepage-1.jpg',
    nickname: 'Geek',
    canvasHeight: 0,
    imageWidth: 0,
    imageHeight: 0,
    targetSharePath: null,
    QRPath: '../../images/geek-qr.jpg',
    avatarPath: null,
    bgImage1Path: null,
    realShow: false,
    imgload:0,
    userInfo:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    wx.getSystemInfo({
      success: function (res) {
        windowWidth = res.windowWidth*0.7;
        windowHeight = res.windowWidth * scale*0.7;

        _windowWidth_pos = (res.windowWidth-windowWidth)/2
        that.setData({
          canvasHeight: windowHeight,
          imageWidth: windowWidth * 0.7,
          imageHeight: windowHeight * 0.7
        })

      },
    }),
    wx.getSetting({
          success: function (res) {
            if (res.authSetting['scope.userInfo']) {
              // 已经授权，可以直接调用 getUserInfo 获取头像昵称
              wx.getUserInfo({
                success: function (res) {
                  console.log(res.userInfo)

                  that.setData({
                    nickname:res.userInfo.nickName
                  });
                }
              })
            }
          }
        }),
    wx.login({
      success: function (res) {
        if (res.code) {
          //发起网络请求
          wx.request({
            url: 'https://werun.renlai.fun/wechat/wx/user_login',
            data: {
              code: res.code
            },
            method:"GET",
            success:function (res){
              console.log(res.data.openid);
              console.log(res.data.session_key);
              var sessionId = res.data.session_key;
              that.setData({
                sessionId: sessionId,
                openId: res.data.openid
              });
              wx.setStorageSync('sessionId', sessionId);
              //console.log(res.data)
              that.shareMemontListener();
            }
          })
        } else {
          console.log('登录失败！' + res.errMsg)
        }
      }
    })
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

  },

  shareMemontListener: function () {
    this.shareMoments();
  },

  /**
   * 生成分享图到朋友圈
   */
  shareMoments: function () {
    var that = this;
    //没有分享图先用 canvas 生成，否则直接预览
    if (that.data.targetSharePath) {
      that.setData({
        realShow: false
      })
    } else {
      that.showLoading();
      that.downloadAvatar();
    }
  },

  showErrorModel: function (content) {
    this.hideLoading();
    if (!content) {
      content = '网络错误';
    }
    wx.showModal({
      title: '提示',
      content: content,
    })
  },

  showLoading: function () {
    wx.showLoading({
      title: '加载中...',
    })
  },

  hideLoading: function () {
    wx.hideLoading();
  },

  /**
   * 下载头像
   */
  downloadAvatar: function () {
    var that = this;
    wx.downloadFile({
      url: that.data.avatar,
      success: function (res) {
        that.setData({
          avatarPath: res.tempFilePath,
          imgload:that.data.imgload+1
        })
        console.log(that.data.imgload);
        if(that.data.imgload == 2){
          console.log('这里是第一个')
          that.drawImage();
        }
      },
      fail: function () {
        that.showErrorModel();
      }
    });
    wx.downloadFile({
      url: that.data.bgImage1,
      success: function (res) {
        that.setData({
          bgImage1Path: res.tempFilePath,
          imgload:that.data.imgload+1
        })
        console.log(that.data.imgload);
        if(that.data.imgload == 2){
          console.log('这里是第二个')
          that.drawImage();
        }

      },
      fail: function () {
        that.showErrorModel();
      }
    })
  },

  drawImage: function () {
    var that = this;
    const ctx = wx.createCanvasContext('myCanvas', this);
    var bgPath = that.data.bgImage1Path;
    ctx.setFillStyle(WHITE);
    ctx.fillRect(0, 0, windowWidth, windowHeight);

    //绘制背景图片
    //ctx.drawImage(bgPath, _windowWidth_pos, 10, windowWidth, windowHeight * bgScale);

    ctx.drawImage(bgPath, _windowWidth_pos, 10, 750, 1334);

    //头像背景圆
    ctx.arc(windowWidth / 2-_windowWidth_pos/2, 113*0.7, (avatarWidthScale / 2) * windowWidth + avatarStrokeWidth, 0, 2 * Math.PI);
    ctx.setFillStyle('#333333');
    ctx.fill();

    // //先绘制圆，裁剪成圆形图片
    ctx.save();
    ctx.beginPath();
    // //圆的原点x坐标，y坐标，半径，起始弧度，终止弧度
    ctx.arc(windowWidth / 2-_windowWidth_pos/2, 113*0.7, (avatarWidthScale / 2) * windowWidth+avatarStrokeWidth, 0, 2 * Math.PI);
    ctx.setStrokeStyle(WHITE);
    ctx.stroke();
    ctx.clip();
    // 绘制头像
    // //图片路径，左上角x坐标，左上角y坐标，宽，高
    var avatarWidth = avatarWidthScale * windowWidth;//头像半径
     ctx.drawImage(that.data.avatarPath, windowWidth * (0.5 - avatarWidthScale / 2)-_windowWidth_pos/2, avatarHeightScale * windowHeight-10, avatarWidth, avatarWidth);
     ctx.restore();

    // //绘制 content
    // ctx.setFillStyle(GRAY_COLOR);
    // ctx.setFontSize(18);
    // ctx.setTextAlign('center');
    // ctx.fillText(that.data.detailStr.content, windowWidth / 2, contentScale * windowHeight);
    // ctx.setFillStyle(GRAY_COLOR);
    // ctx.setFontSize(18);
    // ctx.setTextAlign('center');
    // ctx.fillText(that.data.detailStr.contentOther, windowWidth / 2, contentScale2 * windowHeight);

    //绘制二维码
    ctx.drawImage(that.data.QRPath, windowWidth * (0.5 - qrCodeWidthScale / 2), qrCodeHeightScale * windowHeight, qrCodeWidthScale * windowWidth, qrCodeWidthScale * windowWidth);
    console.log('font------------>' + wx.canIUse('canvasContext.font'));

    //绘制 按压提示文字
    ctx.setFillStyle(TINT_COLOR);
    ctx.setFontSize(10);
    ctx.setTextAlign('center');
    ctx.fillText(that.data.detailStr.clickToMini, windowWidth / 2, decodeScale * windowHeight);

    //绘制加粗文字--------------------------------------------------------------
    //绘制昵称
    that.setFontStyle(ctx, 'bold');
    ctx.setFillStyle(WHITE);
    ctx.setFontSize(20);
    ctx.setTextAlign('center');
    ctx.fillText(stringUtil.substringStr(that.data.nickname), windowWidth / 2/0.7, nicknameHeightScale * windowHeight);

    //绘制文字超神模式
    // ctx.setFillStyle(THEME_COLOR);
    // ctx.setFontSize(24);
    // ctx.setTextAlign('center');
    // ctx.fillText(that.data.detailStr.tip, windowWidth / 2, topTextScale * windowHeight);

    //绘制 Geek小程序 文字
    // ctx.setFillStyle(TINT_COLOR);
    // ctx.setFontSize(16);
    // ctx.setTextAlign('center');
    // ctx.fillText(that.data.detailStr.bpbMini, windowWidth / 2, bpbScale * windowHeight);

    //绘制到 canvas 上
    ctx.draw(false, function () {
      console.log('callback--------------->');
      that.saveCanvasImage();
    });
  },

  /**
   * 改变字体样式
   */
  setFontStyle: function (ctx, fontWeight) {
    if (wx.canIUse('canvasContext.font')) {
      ctx.font = 'normal ' + fontWeight + ' ' + '14px' + ' sans-serif';
    }
  },

  //转化为图片
  saveCanvasImage: function () {
    var that = this;
    wx.canvasToTempFilePath({
      canvasId: 'myCanvas',
      success: function (res) {
        console.log(res.tempFilePath);
        that.setData({
          targetSharePath: res.tempFilePath,
          realShow: false
        })
      },
      complete: function () {
        that.hideLoading();
      }
    }, this)
  },

  /**
   * 保存到相册
   */
  saveImageTap: function () {
    var that = this;
    that.requestAlbumScope();
  },


  /**
   * 检测相册权限
   */
  requestAlbumScope: function () {
    var that = this;
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.writePhotosAlbum']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          that.saveImageToPhotosAlbum();
        } else {
          wx.authorize({
            scope: 'scope.writePhotosAlbum',
            success(res) {
              that.saveImageToPhotosAlbum();
            },
            fail() {
              wx.showModal({
                title: '提示',
                content: '你需要授权才能保存图片到相册',
                success: function (res) {
                  if (res.confirm) {
                    wx.openSetting({
                      success: function (res) {
                        if (res.authSetting['scope.writePhotosAlbum']) {
                          that.saveImageToPhotosAlbum();
                        } else {
                          console.log('用户未同意获取用户信息权限-------->success');
                        }
                      },
                      fail: function () {
                        console.log('用户未同意获取用户信息权限-------->fail');
                      }
                    })
                  }
                }
              })
            }
          })
        }
      }
    })
  },

  saveImageToPhotosAlbum: function () {
    var that = this;
    wx.saveImageToPhotosAlbum({
      filePath: that.data.targetSharePath,
      success: function () {
        wx.showModal({
          title: '',
          content: '✌️图片保存成功，\n快去分享到朋友圈吧',
          showCancel: false
        })
        that.hideDialog();
      }
    })
  },

  closeModel: function () {
    this.hideDialog();
  },

  hideDialog: function () {
    this.setData({
      realShow: false,
    })
  }
})
