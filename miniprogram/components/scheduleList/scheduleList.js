// components/scheduleList/scheduleList.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    queryResult: {
      type: Array,
      value: [],
      observer(newVal, oldVal, changedPath) {
      }
    },
    isLike: {
      type: String,
      value: '',
      observer(newVal, oldVal, changedPath) {
        console.log(newVal)
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    likes(e) {
      
    }
  }
})
