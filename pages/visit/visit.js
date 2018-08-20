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
    onLoad: function (e) {

        let that = this;

        that.setData({
            openId: e.openId,
        });




        that.getFriendList();

        that.postFriendStep();
    },
    decodeUserInfo: function () {
        let that = this;

        wx.request({
            url: 'https://werun.renlai.fun/wechat/decrypy',
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
            url: 'https://werun.renlai.fun/wechat/wx/get_help_werun',
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

    getFriendAll:function () {
        let that = this;

        wx.request({
            url: 'https://werun.renlai.fun/wechat/wx/post_help_werun',
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
    //助力

    postFriendStep:function () {
        let that = this;

        wx.request({
            url: 'https://werun.renlai.fun/wechat/wx/post_help_werun',
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

    //分享

})