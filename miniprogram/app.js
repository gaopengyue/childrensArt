//app.js
App({
  onLaunch: function () {
    const env = 'onlin-76a31e'
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        env,
        traceUser: true,
      })
    }

    this.globalData = {}
  }
})
