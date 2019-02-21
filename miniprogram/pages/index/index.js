// miniprogram/pages/index/index.js
const app = getApp()
const db = wx.cloud.database()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    current: 0,
    queryResult: null,
    likes: null,
    likeList: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    db.collection('artList').limit(100).get({
      success: res => {
        this.setData({
          queryResult: res.data
        })
        wx.getStorage({
          key: 'artOpenId',
          success: res => {
            if (res.data) {
              app.globalData.openid = res.data
              this.fetchLikes()
            }
          }
        })
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '查询失败'
        })
      }
    })
    
  },
  onShow() {
    if (app.globalData.openid && this.data.queryResult) {
      this.fetchLikes()
    }
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  swiperChange(e) {
    this.setData({
      current: e.detail.current
    })
  },
  tapNav(e) {
    this.setData({
      current: e.target.dataset.current
    })
  },
  fetchLikes() {
    db.collection('likes').where({
      _openid: app.globalData.openid
    }).get({
      success: res => {
        this.data.likes = res.data
        this.data.queryResult.forEach(el => {
          el.like = false
        })
        this.data.likes.forEach(item => {
          this.data.queryResult.forEach(el => {
            if (item.likeId == el._id) {
              el.like = item.likeId == el._id
            }
          })
        })
        let likeList = this.data.queryResult.filter(item => item.like)
        this.setData({ queryResult: this.data.queryResult, likeList })
      }
    })
  }
})