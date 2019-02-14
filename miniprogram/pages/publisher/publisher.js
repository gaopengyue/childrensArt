// miniprogram/pages/publisher/publisher.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    values: {},
    images: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad (options) {

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
        console.log(res, e)
        let id = e.currentTarget.dataset.id
        let src = res.tempFilePaths[0]
        this.data.images[id] = src
        this.setData({
          images: this.data.images
        })
        console.log()
      },
      fail: e => {
        console.error(e)
      }
    })
  },
  doUpload() {
    wx.showLoading({
      title: '上传中',
    })

    const filePath = res.tempFilePaths[0]

    // 上传图片
    const cloudPath = 'my-image' + filePath.match(/\.[^.]+?$/)[0]
    wx.cloud.uploadFile({
      cloudPath,
      filePath,
      success: res => {
        console.log('[上传文件] 成功：', res)

        app.globalData.fileID = res.fileID
        app.globalData.cloudPath = cloudPath
        app.globalData.imagePath = filePath

        wx.navigateTo({
          url: '../storageConsole/storageConsole'
        })
      },
      fail: e => {
        console.error('[上传文件] 失败：', e)
        wx.showToast({
          icon: 'none',
          title: '上传失败',
        })
      },
      complete: () => {
        wx.hideLoading()
      }
    })
  }
})