// miniprogram/pages/detail/detail.js
const db = wx.cloud.database({
  env: 'onlin-76a31e'
})
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    detail: null,
    swiperHeight: 500,
    current: 0,
    heightTemp: {},
    screenWidth: 750,

    liked: false,
    userInfo: null,
    likedId: '',
    likes: null, // 收藏结果
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.data.likeId = options.id
    this.fetchDetail()
    this.getScreenWidth()
    this.getUserInfo()
  },
  onShareAppMessage () {
    return {
      title: '儿童美术/创意手工/智力开发，开启宝贝艺术之路。',
      path: '/pages/index/index'
    }
  },
  fetchDetail() {
    db.collection('artList').doc(this.data.likeId).get({
      success: res => {
        let data = res.data.data
        data.list.forEach(item => {
          let desc = item.desc.split(/\n/g)
          item.desc = desc
        })
        this.setData({
          detail: data.list
        })
        
        wx.setNavigationBarTitle({
          title: data.tag
        })
        this.checkLikes(null, 'onload')
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '查询失败'
        })
      }
    })
  },
  getScreenWidth() {
    wx.getSystemInfo({
      success: res => {
        if(res)
          this.data.screenWidth = res.screenWidth * 2
      }
    })
  },
  swiperChange(e) {
    this.setData({
      swiperHeight: this.data.heightTemp[e.detail.current],
      current: e.detail.current
    })
  },
  imgLoad(e) {
    let rate = e.detail.width / e.detail.height
    this.data.heightTemp[e.currentTarget.dataset.id] = this.data.screenWidth / rate
    if (e.currentTarget.dataset.id == 0) {
      this.setData({
        swiperHeight: this.data.heightTemp[0]
      })
    }
  },
  preview(e) {
    wx.previewImage({
      urls: [e.currentTarget.dataset.src]
    })
  },

  checkLikes(cb, onload) {
    if (!app.globalData.openid) {
      onload != 'onload' && this.onGetOpenid()
      return
    }

    db.collection('likes').where({
      _openid: app.globalData.openid
    }).get({
      success: res => {
        this.data.likes = res.data
        if (res.data.length) {
          this.setData({
            liked: !!res.data.filter(item => item.likeId == this.data.likeId).length
          })
        }
        cb && cb()
      }
    })
  },
  changeLikes() {
    let likes = this.data.likes.filter(item => item.likeId == this.data.likeId)

    if (likes.length) { // 执行不喜欢
      db.collection('likes').doc(likes[0]._id).remove({
        success: res => {
          this.setData({ liked: false, likes: []})
        }
      })
    } else {  // 执行喜欢
      db.collection('likes').add({
        data: {
          likeId: this.data.likeId
        },
        success: res => {
          let likes = {
            _id: res._id,
            _openid: app.globalData.openid,
            likeId: this.data.likeId
          }
          this.setData({ liked: true, likes: [likes] })
          this.addLikeCount()
        }
      })
    }
  },
  addLikeCount() {
    const _ = db.command
    db.collection('artList').doc(this.data.likeId).update({
      data: {
        data: {
          likeCount: _.inc(1)
        }
      },
      success(res) {
        console.log(res.data)
      }
    })
  },
  likesController() {
    if(this.data.likes) {
      this.changeLikes()
    } else {
      this.checkLikes(this.changeLikes)
    }
  },
  getUserInfo() {
    // 获取用户信息
    if (app.globalData.userInfo) {
      this.setData({ userInfo: app.globalData.userInfo })
      return
    }
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              app.globalData.userInfo = res.userInfo
              this.setData({ userInfo: res.userInfo })
            }
          })
        }
      }
    })
  },
  // button 获取用户信息
  onGetUserInfo(e) {
    if (e.detail.userInfo) {
      app.globalData.userInfo = e.detail.userInfo
      this.setData({ userInfo: e.detail.userInfo })
      this.onGetOpenid()
    }
  },
  onGetOpenid() {
    if (app.globalData.openid) {
      this.likesController()
      return
    }
    //
    let openid;
    try {
      openid = wx.getStorageSync('artOpenId')
    } catch (e) {
      console.log(e)
    }
    if (openid) {
      app.globalData.openid = openid
      this.likesController()
      return
    }
    // 调用云函数
    wx.showLoading({ title: '稍等哈~', })
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        wx.hideLoading()
        wx.setStorage({ // openid存在本地
          key: 'artOpenId',
          data: res.result.openid
        })
        app.globalData.openid = res.result.openid
        this.likesController()
      }
    })
  }
})