// miniprogram/pages/publisher/publisher.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    values: {},
    images: {},
    tagArray: ['手工', '绘画', '折纸', '游戏'],
    index: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad (options) {

  },
  // 选择标签
  selectTag(e) {
    this.setData({
      index: e.detail.value
    })
  },
  descInput(e) {
    let id = e.target.dataset.id
    let val = e.detail.value
    this.data.values[id] = val
  },
  // 上传图片
  preUpload (e) {
    // 选择图片
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: res => {
        let id = e.currentTarget.dataset.id
        let src = res.tempFilePaths[0]
        this.data.images[id] = src
        this.setData({
          images: this.data.images
        })
      },
      fail: e => {
        console.error(e)
      }
    })
  },
  // 上传图片
  doUpload(filePath) {
    console.log(filePath, 999)
    return wx.cloud.uploadFile({
      cloudPath: new Date().getTime() + filePath.match(/\.[^.]+?$/)[0],
      filePath
    })
  },
  submit() {
    
     
    let tasks = []
    let imgKey = Object.keys(this.data.images)
    if (!imgKey.length) {
      console.log(1000000000000000)
      return
    }
    wx.showLoading({
      title: '上传中',
    })
    imgKey.forEach(item => {
      tasks.push(this.doUpload(this.data.images[item]))
    })
    Promise.all(tasks).then(res => {
      console.log(res, '上传成功')
      res.length && res.forEach((item, index) => {
        let i = index + 1 + ''
        this.data.images[i] = item.fileID
      })
      this.formatData()
      wx.hideLoading()
    }).catch(err => {
      console.log(err)
      wx.hideLoading()
    })
  },
  formatData() {
    let imgKey = Object.keys(this.data.images)
    let res = {
      tag: this.data.tagArray[this.data.index],
      list: []
    }
    imgKey.forEach((key, index) => {
      let i = index + 1 + ''
      res.list.push({
        image: this.data.images[i],
        desc: this.data.values[i]
      })
    })
    console.log(res, 'res')
    this.saveDB(res)
  },
  saveDB(data) {
    const db = wx.cloud.database()
    db.collection('artList').add({
      data: {
        data,
        // userInfo: app.globalData.userInfo
      },
      success: res => {
        wx.showToast({ title: '发布成功' })
        setTimeout(() => {
          wx.redirectTo({
            url: '/pages/index/index'
          })
        }, 1000)
      },
      fail: err => {
        console.log(err)
        wx.showToast({
          icon: 'none',
          title: '发布失败'
        })
      }
    })
  }
})