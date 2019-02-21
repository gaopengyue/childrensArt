// miniprogram/pages/detail/detail.js
const db = wx.cloud.database()
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    swiperHeight: 500,
    current: 0,
    heightTemp: {},
    screenWidth: 750,
    liked: false,
    userInfo: null,
    id: '',
    detail: null,
    likes: [], // 收藏结果
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.id = options.id
    this.fetchDetail()
    this.getScreenWidth()
    this.getUserInfo()
  },
  onShareAppMessage () {
    return {
      title: '转发标题',
      path: '/pages/detail/detail'
    }
  },
  fetchDetail() {
    db.collection('artList').doc(this.id).get({
      success: res => {
        this.setData({
          detail: res.data.data.list,
        })
        wx.setNavigationBarTitle({
          title: res.data.data.tag
        })
        this.checkLikes()
        console.log(res.data, 222)
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
  },
  preview(e) {
    wx.previewImage({
      urls: [e.currentTarget.dataset.src]
    })
  },

  checkLikes(cb) {
    db.collection('likes').where({
      _openid: app.globalData.openid
    }).get({
      success: res => {
        console.log(res, '查询likes')
        this.data.likes = res.data
        cb && cb()
      }
    })
  },
  changeLikes() {
    let likes = this.data.likes.filter(item => item.likeId == this.data.id)
    if (likes.length) { // 执行不喜欢
      console.log('执行不喜欢')
      db.collection('likes').doc(likes[0]._id).remove({
        success: res => {
          console.log(res.data, '已经不喜欢')
          this.setData({ liked: false})
        }
      })
    } else {  // 执行喜欢
      console.log('执行喜欢')
      db.collection('likes').add({
        data: {
          likeId: this.data.id
        },
        success: res => {
          console.log(res.data, '已经喜欢')
          this.setData({ liked: true })
        }
      })
    }

  },
  getUserInfo() {
    // 获取用户信息
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
      this.changeLikes()
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
      this.changeLikes()
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
        this.changeLikes()
      }
    })
  }
})