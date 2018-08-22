const app = getApp()

Page({
    data: {
        logs: [],
        encryptedData:null,
        iv:null,
        sessionId:null,
        openId:null,
        visitopenid:null,
        step:0,
        allstep:0,
        friendlist:[],
        userOrderList:[],
        animationData: {},
        maskboxshow:"",
        nickName:"",
        avatarUrl:"",
        useropenId:"",
        canIUse: wx.canIUse('button.open-type.getUserInfo')
    },
    onLoad: function (e) {

        let that = this;

        that.setData({
            openId: e.openId,
        });

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
                            that.setData({
                                visitopenid: res.data.openid
                            });
                            //console.log(that.data.userInfo)
                        }
                    })
                } else {
                    console.log('登录失败！' + res.errMsg)
                }
            }
        }),


        //获取朋友
        that.getFriendList();

        //that.postFriendStep();

        //获取用户总步数
        that.getUserInfo();
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
                that.setData({
                    friendlist:res.data.data.userlist,
                    allstep:res.data.data.total
                });

                let totalItems = 100;
                let rightItems = Math.round(that.data.allstep/100);
                that.showScoreAnimation(rightItems, totalItems);

            }
        })

    },

    //获取用户总步数
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
                    //console.log(res.data.data.step)
                    that.setData({
                        step: res.data.data.step,
                        nickName: res.data.data.name,
                        avatarUrl: res.data.data.avatarUrl
                    });
                }
                else{
                    console.log("用户步数据异常")
                }
            }
        })
    },





    bindGetUserInfo: function(e) {
        console.log(e.detail.userInfo)
        let that = this;
        wx.request({
            url: 'https://werun.renlai.fun/wechat/wx/post_help_werun',
            data: {
                openId: that.data.visitopenid,
                fromOpenId:that.data.openId,
                name:that.data.nickName,
                avatarUrl:that.data.avatarUrl
    },
            method: 'POST',
            success: function (res) {
                console.log(res.data)
                if(res.data.errcode == "0"){
                    that.getFriendList();
                    that.getUserInfo();
                }else{

                }
            }
        })
    }

})