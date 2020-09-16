
new Vue({
  el: "#app",
  render(createElement) {
    return createElement('div',{
      attrs: {
        id: '#app1'
      }
    }, this.message)
  },
  data(){
    return {
      message: 'hello word!'
    }
  }
})