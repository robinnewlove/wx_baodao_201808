const app = getApp()
const avatarStrokeWidth = 2;
const stringUtil = require('../../utils/stringUtil.js');

Page({
    data: {
        logs: [],
        encryptedData:null,
        iv:null,
        sessionId:null,
        openId:null,
        step:0,
        allstep:0,
        friendlist:[],
        userOrderList:[],
        animationData: {},
        maskboxshow:"",
        userInfo:"",
        path:"",
        showimgbox:false,

        //画布相关字段
        canvasHeight:"0",
        canvasWidth:"0",
        avatar:'',
        bgImage: ['https://werun.renlai.fun/static/images/sharepage-1.jpg','https://werun.renlai.fun/static/images/sharepage-2.jpg','https://werun.renlai.fun/static/images/sharepage-3.jpg','https://werun.renlai.fun/static/images/sharepage-4.jpg','https://werun.renlai.fun/static/images/sharepage-5.jpg'],
        qurl:"",
        imgload:0,
        bgImagePath:"",
        avatarPath:"",
        qurlPath:"",
        targetSharePath: null,
        avatarWidth:'0',
        avatarLeft:"",
        avatarTop:"",
        nickName:"亲爱的用户",
        nickNameTop:"",
        nickNameLeft:"",
        qcodeTop:"",
        qcodeWidth:0,
        isfriendlist:false
    },
    onLoad: function () {

        wx.canIUse('wx.showShareMenu');

        let that = this;
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
                        //console.log("获取openid"+res.data.openid);
                        //console.log(res.data.session_key);
                        var sessionId = res.data.session_key;
                        that.setData({
                            sessionId: sessionId,
                            openId: res.data.openid
                        });
                        wx.setStorageSync('sessionId', sessionId);
                      //console.log(res.data)
                        //获取微信步数代码
                        wx.getWeRunData({
                            success(res) {
                                console.log(res.encryptedData);
                                that.setData({
                                    encryptedData: res.encryptedData,
                                    iv:res.iv,
                                    session: wx.getStorageSync('sessionId')
                                });
                                that.decodeUserInfo();
                            }
                        });
                        wx.getSetting({
                                success: function (res) {
                                    //console.log(res.authSetting['scope.userInfo']);
                                    if (res.authSetting['scope.userInfo']) {
                                        // 已经授权，可以直接调用 getUserInfo 获取头像昵称
                                        wx.getUserInfo({
                                            success: function (res) {
                                                console.log("获取用户信息成功");
                                                console.log(res.userInfo)

                                                that.setData({
                                                    userInfo:res.userInfo,
                                                    nickName:res.userInfo.nickName
                                                });
                                                that.postUserInfo();
                                            }
                                        })
                                    }
                                }
                            });

                        //获取朋友
                        that.getFriendList();

                        //获取排行榜
                        that.getUserOrderList();

                        //获取用户总步数
                        that.getUserInfo();



                        that.getUserqrcode();

                        // that.shareMoments();
                        //console.log(that.data.userInfo)
                    }
                  })
                } else {
                  console.log('登录失败！' + res.errMsg)
                }
              }
        }),
        wx.getSystemInfo({
                success: function (res) {
                    //console.log(res.windowWidth)
                    //根据图片算图片矩形的宽高
                    var scaleNum = res.windowWidth*0.7/750;
                    that.setData({
                        canvasWidth:res.windowWidth*0.7,
                        canvasHeight:scaleNum*1334,
                        avatarWidth:scaleNum*173,
                        avatarTop:scaleNum*113,
                        avatarLeft:scaleNum*61,
                        nickNameTop:scaleNum*172,
                        nickNameLeft:scaleNum*292,
                        qcodeTop:scaleNum*1016,
                        qcodeWidth:scaleNum*250*0.8
                    })


                    //console.log("qcodeWidth:"+that.data.qcodeWidth)
                },
            }),
        wx.showShareMenu({
            withShareTicket: true
        });

    },
    decodeUserInfo: function () {
        let that = this;
        //console.log(that.data.encryptedData);
        wx.request({
            url: 'https://werun.renlai.fun/wechat/wx/post_user_werun',
            data: {
                openId:that.data.openId,
                encryptedData: that.data.encryptedData,
                iv: that.data.iv,
                sessionKey: wx.getStorageSync('sessionId')
            },
            method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
            // header: {}, // 设置请求的 header
            success: function (res) {

                //console.log("三三三三三三三三三三三三三三三三三三三三三三三三")
                //console.log(res.data.stepInfoList);

                let todayStep = res.data.stepInfoList.pop();
                that.setData({
                    allstep: todayStep.step
                    //allstep: 15000
                 });
                 //console.log(that.data.step);
                // 以下两个是测试数据
                let totalItems = 100;
                let rightItems = Math.round(that.data.allstep/100);
                that.showScoreAnimation(rightItems, totalItems);
            }
        })

    },

    showScoreAnimation: function (rightItems, totalItems) {
        /*
         cxt_arc.arc(x, y, r, sAngle, eAngle, counterclockwise);
         x	                    Number	  圆的x坐标
         y	                    Number	  圆的y坐标
         r	                    Number	  圆的半径
         sAngle	            Number	  起始弧度，单位弧度（在3点钟方向）
         eAngle	            Number	  终止弧度
         counterclockwise	    Boolean	  可选。指定弧度的方向是逆时针还是顺时针。默认是false，即顺时针。
         */
        let that = this;
        let copyRightItems = 0;
        if(rightItems <= 1){
            rightItems = 2;
        }else if(rightItems > 100){
            rightItems = 100;
        }
        that.setData({
            timer: setInterval(function () {
                if (copyRightItems == rightItems) {
                    clearInterval(that.data.timer)
                } else {
                    // 页面渲染完成
                    // 这部分是灰色底层
                    let cxt_arc = wx.createCanvasContext('canvasArc');//创建并返回绘图上下文context对象。

                    cxt_arc.setLineWidth(6);//绘线的宽度
                    cxt_arc.setStrokeStyle('#d2d2d2');//绘线的颜色
                    cxt_arc.setLineCap('round');//线条端点样式
                    cxt_arc.beginPath();//开始一个新的路径
                    cxt_arc.arc(60, 60, 50, 0, 2 * Math.PI, false);//设置一个原点(53,53)，半径为50的圆的路径到当前路径
                    cxt_arc.stroke();//对当前路径进行描边
                    //这部分是蓝色部分
                    cxt_arc.setLineWidth(6);
                    var gradient = cxt_arc.createLinearGradient(200, 100, 100, 200);
                    gradient.addColorStop("0", "#aeff06");
                    gradient.addColorStop("1.0", "#fff60b");
                    cxt_arc.setStrokeStyle(gradient);
                    cxt_arc.setLineCap('round')
                    cxt_arc.beginPath();//开始一个新的路径
                    cxt_arc.arc(60, 60, 50, -Math.PI * 1 / 2, 2 * Math.PI * (copyRightItems / totalItems) - Math.PI * 1 / 2, false);
                    cxt_arc.stroke();//对当前路径进行描边

                    cxt_arc.fillStyle = "#fff60b";
                    cxt_arc.setStrokeStyle("#ffffff");
                    cxt_arc.setLineWidth(3);
                    cxt_arc.beginPath();
                    cxt_arc.translate(60,60);
                    cxt_arc.arc(0, -50, 8, 0, 2*Math.PI, true);
                    var angleInRadians = (copyRightItems / totalItems)*360* Math.PI / 180;
                    cxt_arc.rotate(angleInRadians);
                    cxt_arc.closePath();
                    cxt_arc.stroke();
                    cxt_arc.fill();
                    cxt_arc.draw();
                }
                copyRightItems++;
            }, 20)
        })
    },

    //获取用户加油列表
    getFriendList: function () {
        let that = this;

        wx.request({
            url: 'https://werun.renlai.fun/wechat/wx/get_help_werun',
            data: {
                openId: that.data.openId
            },
            method: 'GET',
            success: function (res) {
                //console.log(res.data.data.userlist);
                if(res.data.data != null){
                    that.setData({
                        friendlist: res.data.data.userlist,
                        isfriendlist:false
                    })
                }else{
                    that.setData({
                        isfriendlist:true
                    });
                }

            }
        })

    },

    //获取用户排行
    getUserOrderList: function () {
        let that = this;

        wx.request({
            url: 'https://werun.renlai.fun/wechat/wx/get_werun_list',
            data: {
                //openId: that.data.openId
            },
            method: 'GET',
            success: function (res) {
                //console.log(res.data)

                if(res.data.errcode == "0"){
                    that.setData({
                        userOrderList: res.data.data,
                    });
                }
                else{
                    console.log("排行榜数据异常")
                }
            }
        })

    },
    
    getUserInfo:function () {
        let that = this;
        wx.request({
            url: 'https://werun.renlai.fun/wechat/wx/get_user_werun',
            data: {
                openId: that.data.openId
            },
            method: 'GET',
            success: function (res) {
                //console.log(res.data)

                if(res.data.errcode == "0"){
                    // console.log("===============================")
                    // console.log(res.data.data.avatarUrl)
                    var _step
                    if(res.data.data.step != 0){
                        _step = res.data.data.step;
                    }else{
                        _step = that.data.allstep;
                    }
                    that.setData({
                        step: _step,
                        avatar: res.data.data.avatarUrl
                    });
                    console.log(that.data.avatar)

                }
                else{
                    console.log("用户步数据异常")
                }
            }
        })
    },

    postUserInfo:function () {
        let that = this;
        console.log("=====================================")
        console.log(that.data.openId)
        wx.request({
            url: 'https://werun.renlai.fun/wechat/wx/post_userinfo',
            data: {
                openId: that.data.openId,
                nickName:that.data.userInfo.nickName,
                avatarUrl:that.data.userInfo.avatarUrl,
                gender:that.data.userInfo.gender,
                city:that.data.userInfo.city,
                province:that.data.userInfo.province,
                country:that.data.userInfo.country,
                language:that.data.userInfo.language
            },
            method: 'POST',
            success: function (res) {
                //console.log(res.data)

                if(res.data.errcode == "0"){
                    //console.log(res.data.data.step)
                    //console.log("写入用户信息成功")
                }
                else{
                    //console.log("写入用户信息失败")
                }
            }
        })
    },

    //显示分享层
    showshare:function(){


        var animation = wx.createAnimation({
            duration: 500,
            timingFunction: 'ease',
        })

        this.animation = animation

        animation.bottom(0).step();

        this.setData({
            animationData:animation.export(),
            maskboxshow:"show"

        })
    },
    //隐藏分享层
    hideshare:function(){


        var animation = wx.createAnimation({
            duration: 500,
            timingFunction: 'ease',
        })

        this.animation = animation

        animation.bottom("-450rpx").step();

        this.setData({
            animationData:animation.export(),
            maskboxshow:""

        })
    },

    //分享
    onShareAppMessage: function (res) {
        let that = this;
        if (res.from === 'button') {
            // 来自页面内转发按钮
            //console.log(res.target)
        }
        return {
            title: '快来帮我凑步数',
            path: '/pages/visit/visit?openId='+that.data.openId,
            imageUrl:'https://werun.renlai.fun/static/images/share.jpg'

        }
    },
    
    shereImgshow:function () {
        let that = this;
        that.hideshare();
        that.setData({
            showimgbox:true
        });

        that.shareMoments();
    },

    //或许用户小程序码
    getUserqrcode:function () {
        let that = this;

        wx.request({
            url: 'https://werun.renlai.fun/wechat/wx/get_user_qrcode',
            data: {
                openId: that.data.openId,
            },
            method: 'GET',
            success: function (res) {
                //console.log(res.data)
                if(res.data.errcode == "0"){
                    console.log(res.data.data.qrcode)
                    that.setData({
                        qurl:res.data.data.qrcode
                    })


                }

            }
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

    shareMoments: function () {
        var that = this;
        //没有分享图先用 canvas 生成，否则直接预览
        // if (that.data.targetSharePath) {
        //     that.setData({
        //         realShow: false
        //     })
        // } else {
            that.showLoading();
           that.downloadAvatar();
        //}
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

    /**
     * 改变字体样式
     */
    setFontStyle: function (ctx, fontWeight) {
        if (wx.canIUse('canvasContext.font')) {
            ctx.font = 'normal ' + fontWeight + ' ' + '14px' + ' sans-serif';
        }
    },

    //下载资源
    downloadAvatar: function () {
        var that = this;
        that.setData({
            imgload:0
        });
        const downloadTask1 = wx.downloadFile({
            url: that.data.avatar,
            success: function (res) {
                that.setData({
                    avatarPath: res.tempFilePath
                })
            },
            fail: function () {
                that.showErrorModel();
            }
        });


        downloadTask1.onProgressUpdate((res) => {
            console.log(res.progress)
            if(res.progress == 100){
                console.log('头像下载完成');
                that.setData({
                    imgload:that.data.imgload+1
                })
                if(that.data.imgload == 3){
                    console.log('执行画画3');
                    that.drawImage();
                }
            }
        })

        var bgImageitem = that.data.bgImage[Math.floor(Math.random()*that.data.bgImage.length)];

        wx.downloadFile({
            url: bgImageitem,
            success: function (res) {
                that.setData({
                    bgImagePath: res.tempFilePath,
                    imgload:that.data.imgload+1
                })
                console.log(that.data.imgload);
                if(that.data.imgload == 3){
                    console.log('执行画画2');
                    that.drawImage();
                }

            },
            fail: function () {
                that.showErrorModel();
            }
        });
        const downloadTask = wx.downloadFile({
            url: that.data.qurl,
            success: function (res) {
                that.setData({
                    qurlPath: res.tempFilePath,
                })
            },
            fail: function () {
                that.showErrorModel();
            }
        })
        downloadTask.onProgressUpdate((res) => {
            console.log(res.progress)
            if(res.progress == 100){
                console.log('二维码下载完成');
                that.setData({
                    imgload:that.data.imgload+1
                })
                if(that.data.imgload == 3){
                    console.log('执行画画3');
                    console.log(that.data.qurlPath);
                    that.drawImage();
                }
            }
        })

    },

    drawImage: function () {
        console.log('开始画画');
        var that = this;
        const ctx = wx.createCanvasContext('myCanvas', this);






        var bgPath = that.data.bgImagePath;
        ctx.setFillStyle("#000000");
        ctx.fillRect(0, 0, that.data.canvasWidth, that.data.canvasHeight);

        //绘制背景图片
        ctx.drawImage(bgPath, 0, 0, that.data.canvasWidth, that.data.canvasHeight);

        //绘制头像
        ctx.arc(that.data.avatarWidth/2+avatarStrokeWidth+that.data.avatarLeft, that.data.avatarWidth/2+avatarStrokeWidth+that.data.avatarTop, that.data.avatarWidth/2+avatarStrokeWidth, 0, 2 * Math.PI);
        ctx.setFillStyle('#FFFFFF');
        ctx.fill();

        //头像裁剪
        ctx.save();
        ctx.beginPath();
        ctx.arc(that.data.avatarWidth/2+avatarStrokeWidth+that.data.avatarLeft, that.data.avatarWidth/2+avatarStrokeWidth+that.data.avatarTop, that.data.avatarWidth/2, 0, 2 * Math.PI);
        // ctx.setFillStyle("#EEEEEE");
        // ctx.fill();
        ctx.setStrokeStyle("#FFFFFF");
        ctx.stroke();
        ctx.clip();

        var avatarWidth = that.data.avatarWidth;//头像半径


        ctx.drawImage(that.data.avatarPath,that.data.avatarLeft+avatarStrokeWidth,that.data.avatarTop+avatarStrokeWidth, avatarWidth, avatarWidth);
        ctx.restore();

        //用户名
        that.setFontStyle(ctx, 'bold');
        ctx.setFillStyle("#FFFFFF");
        ctx.setFontSize(20);
        ctx.setTextAlign('left');
        ctx.setTextBaseline('top');
        ctx.fillText(stringUtil.substringStr(that.data.nickName),that.data.nickNameLeft,that.data.nickNameTop);

        //


        ctx.save();
        ctx.beginPath();
        ctx.arc(that.data.qcodeWidth/2+that.data.avatarLeft*1.1, that.data.qcodeWidth/2+that.data.qcodeTop, that.data.qcodeWidth/2*1.1, 0, 2 * Math.PI);
        ctx.setFillStyle("#FFFFFF");
        ctx.fill();
        ctx.clip();





        ctx.drawImage(that.data.qurlPath,that.data.avatarLeft+avatarStrokeWidth,that.data.qcodeTop, that.data.qcodeWidth,that.data.qcodeWidth);

        //绘制到 canvas 上
        ctx.draw(false, function () {
            console.log('callback--------------->');
            that.saveCanvasImage();
        });
    },

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

    closesaveImage:function () {
        let that = this;
        that.setData({
            showimgbox:false
        })
    }
})