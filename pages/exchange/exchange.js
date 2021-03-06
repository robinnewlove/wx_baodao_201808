Page({
    data: {
        openId:null,
        coupon30:0,
        coupon100:0,
        coupon780:0,
        qcodeImg:null,
        qcode:null,
        tipshow:false,
        postPrizeinfo:false,
        coupontip30:false,
        coupontip100:false,
        coupontip780:false,
        fullName:"",
        telePhone:"",
        address:"",
        submitbtn:true

    },
    onLoad: function (e) {
        let that = this;

        console.log(e.openId)

         that.setData({
             openId: e.openId,
         });

         that.getCardlist()
    },

    //获取券信息  传openid
    getCardlist: function () {
        let that = this;
        wx.request({
            url: 'https://werun.renlai.fun/wechat/wx/get_user_coupon',
            data: {
                openId: that.data.openId
            },
            method: 'GET',
            success: function (res) {
                if(res.data.errcode == 0){
                    that.setData({
                        coupon30: res.data.data.coupon30,
                        coupon100: res.data.data.coupon100,
                        coupon780: res.data.data.coupon780
                    });
                }else{
                    console.log("get_user_coupon接口异常")
                }
            }
        })

    },

    //获取条形码  需要传openid  券类型
    getQcode:function (opt) {
        console.log(opt.currentTarget.dataset.qtype)
        let that = this;
        wx.request({
            url: 'https://werun.renlai.fun/wechat/wx/get_17qrcode',
            data: {
                openId: that.data.openId,
                qType:opt.currentTarget.dataset.qtype
            },
            method: 'GET',
            success: function (res) {
                if(res.data.errcode == 0){
                    that.setData({
                        qcode: res.data.data.code,
                        qcodeImg: res.data.data.base64,
                        tipshow:true
                    });
                }else{
                   console.log(res.data.errmsg)
                }
            }
        })
    },

    //获取券列表  需要传openid 券类型
    getCoupon:function (opt) {
        let that = this;
        wx.showModal({
            content:"是否兑换"+opt.currentTarget.dataset.qtypename+"元New Balance抵扣券",
            success:function (res) {
                if (res.confirm) {
                    console.log(opt.currentTarget.dataset.qtype);
                    wx.request({
                        url: 'https://werun.renlai.fun/wechat/wx/post_user_coupon',
                        data: {
                            openId: that.data.openId,
                            qType:opt.currentTarget.dataset.qtype
                        },
                        method: 'POST',
                        success: function (res) {
                            if(res.data.errcode == 0){
                                wx.showModal({
                                    showCancel:false,
                                    content: "恭喜你成功抢到"+opt.currentTarget.dataset.qtypename+"元New Balance抵扣券，赶快去门店使用吧"
                                });
                                that.getCardlist();
                            }else{
                                //console.log("post_user_coupon接口异常")
                                wx.showModal({
                                    showCancel:false,
                                    content: res.data.errmsg
                                });
                            }
                        }
                    })
                }else if (res.cancel) {
                    console.log('用户点击取消')
                }

            }
        })


    },

    //秒杀接口
    postKill:function () {
        let that = this;
        wx.request({
            url: 'https://werun.renlai.fun/wechat/wx/post_sec_kill',
            data: {
                openId: that.data.openId
            },
            method: 'POST',
            success: function (res) {
                if(res.data.errcode == 0){

                    that.openPrizeinfo();
                    that.getCardlist();
                }else{
                    //console.log(res.data.errmsg)
                    wx.showModal({
                        showCancel:false,
                        content: res.data.errmsg
                    });
                }
            }
        })
    },

    openPrizeinfo:function () {
        let that = this;
        // that.setData({
        //     postPrizeinfo:true
        // });
        console.log("这里是查看事件：")
        wx.request({
            url: 'https://werun.renlai.fun/wechat/wx/get_lottery_is_userinfo',
            data: {
                openId: that.data.openId
                //openId:"ongkJ0fIMtsJhLQevL6vYZHMy41k"
            },
            method: 'GET',
            success: function (res) {
                console.log("11111111"+res.data.errcode)
                if(res.data.errcode == 0){
                      if(res.data.data.lottery == 1){
                          that.setData({
                              fullName:res.data.data.fullName,
                              telePhone:res.data.data.telePhone,
                              address:res.data.data.address,
                              submitbtn:false
                          });

                      }
                      that.setData({
                          postPrizeinfo:true
                      });
                    //sssthat.openPrizeinfo();
                }else{
                    //console.log(res.data.errmsg)
                    wx.showModal({
                        showCancel:false,
                        content: res.data.errmsg
                    });
                }
            }
        })
    },


    //关闭核销码层
    tipboxclose:function(){
        let that = this;
        that.setData({
            tipshow:false,
            postPrizeinfo:false,
            coupontip30:false,
            coupontip100:false,
            coupontip780:false

        });
    },

    // //关闭填写信息
    // tipboxclose1:function(){
    //     let that = this;
    //     that.setData({
    //         postPrizeinfo:false
    //     });
    // },



    formSubmit: function(e) {
        //console.log('form发生了submit事件，携带数据为：', e.detail.value)

        let that = this;
        wx.request({
            url: 'https://werun.renlai.fun/wechat/wx/post_lottery_userinfo',
            data: {
                openId: that.data.openId,
                fullName:e.detail.value.fullName,
                telePhone:e.detail.value.telePhone,
                address:e.detail.value.address
            },
            method: 'POST',
            success: function (res) {
                if(res.data.errcode == 0){
                    wx.showModal({
                        content:"提交成功",
                        showCancel:false,
                        success:function () {
                            that.setData({
                                postPrizeinfo:false
                            });
                        }
                    })
                }else{
                    wx.showModal({
                        content:res.data.errmsg,
                        showCancel:false
                    })
                }
            }
        })
    },
    
    showCoupontip:function (opt) {
        let that = this;
        console.log(opt.currentTarget.dataset.qtype)
        if(opt.currentTarget.dataset.qtype == "coupon30"){
            that.setData({
                coupontip30:true
            });
        }else if(opt.currentTarget.dataset.qtype == "coupon100"){
            that.setData({
                coupontip100:true
            });
        }else if(opt.currentTarget.dataset.qtype == "coupon780"){
            that.setData({
                coupontip780:true
            });
        }

    }





})