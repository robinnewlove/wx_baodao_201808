const app = getApp()

Page({
    data: {
        logs: [],
        encryptedData:null,
        iv:null,
        sessionId:null,
        openId:null,
        step:null,
        allstep:0,
        friendlist:[],
        userOrderList:[],
        animationData: {},
        maskboxshow:""
    },
    onLoad: function () {
        let that = this;
        wx.login({
              success: function (res) {
                if (res.code) {
                  //发起网络请求
                  wx.request({
                    url: 'https://www.zhenzhezixun.com/login.php',
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
                        //获取微信步数代码
                        wx.getWeRunData({
                            success(res) {
                                console.log(res);
                                that.setData({
                                    encryptedData: res.encryptedData,
                                    iv:res.iv,
                                    session: wx.getStorageSync('sessionId')
                                });
                                that.decodeUserInfo();
                            }
                        })

                        //获取朋友
                        that.getFriendList();

                        //获取排行榜
                        that.getUserOrderList()
                    }
                  })
                } else {
                  console.log('登录失败！' + res.errMsg)
                }
              }
        })

    },
    decodeUserInfo: function () {
        let that = this;

        wx.request({
            url: 'https://www.zhenzhezixun.com/decrypt.php',
            data: {
                encryptedData: that.data.encryptedData,
                iv: that.data.iv,
                sessionKey: wx.getStorageSync('sessionId')
            },
            method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
            // header: {}, // 设置请求的 header
            success: function (res) {
                console.log(res.data);

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
    /*下拉刷新*/
    onPullDownRefresh: function(){
        wx.stopPullDownRefresh()
    },

    //获取用户加油列表
    getFriendList: function () {
        let that = this;

        wx.request({
            url: 'https://www.zhenzhezixun.com/json/friendlist.json',
            data: {
                openId: that.data.openId
            },
            method: 'GET',
            success: function (res) {
                //console.log(res.data)
                that.setData({
                    friendlist: res.data,
                });

            }
        })

    },

    //获取用户排行
    getUserOrderList: function () {
        let that = this;

        wx.request({
            url: 'https://www.zhenzhezixun.com/json/userOrderList.json',
            data: {
                openId: that.data.openId
            },
            method: 'GET',
            success: function (res) {
                //console.log(res.data)
                that.setData({
                    userOrderList: res.data,
                });

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
        if (res.from === 'button') {
            // 来自页面内转发按钮
            console.log(res.target)
        }
        return {
            title: '快来帮我凑步数',
            path: '/page/main/main?id=123',
            imageUrl:'https://www.zhenzhezixun.com/images/share.jpg'
        }
    }
})