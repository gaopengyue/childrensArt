// miniprogram/pages/detail/detail.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    swiperHeight: 500,
    current: 0,
    heightTemp: {},
    screenWidth: 750

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getScreenWidth()
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage () {
    return {
      title: '转发标题',
      path: '/pages/detail/detail'
    }
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
      swiperHeight: this.data.heightTemp[e.detail.current]
    })
    console.log(this.data.swiperHeight)
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
  likes(e) {
    
  }
})