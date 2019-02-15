// miniprogram/pages/index/index.js
const app = getApp()
const db = wx.cloud.database()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    current: 0,
    queryResult: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    db.collection('artList').limit(20).get({
      success: res => {
        this.setData({
          queryResult: res.data,
        })
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

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

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
    console.log(e)
    this.setData({
      current: e.target.dataset.current
    })
  }
})