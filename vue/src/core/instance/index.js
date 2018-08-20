import { initMixin } from './init'
import { stateMixin } from './state'
import { renderMixin } from './render'
import { eventsMixin } from './events'
import { lifecycleMixin } from './lifecycle'
import { warn } from '../util/index'

// VUE 渲染流程
// 1、new Vue，执行初始化
// 2、挂载$mount方法，通过自定义Render方法、template、el等生成Render函数
// 3、通过Watcher监听数据的变化
// 4、当数据发生变化时，Render函数执行生成VNode对象
// 5、通过patch方法，对比新旧VNode对象，通过DOM Diff算法，添加、修改、删除真正的DOM元素

/**
 * 定义 Vue ，并未 Vue 添加必要方法
 * @param options 传入的 opts 条目
 * @constructor
 */
function Vue (options) {
  if (process.env.NODE_ENV !== 'production' &&
    !(this instanceof Vue)
  ) {
    warn('Vue is a constructor and should be called with the `new` keyword')
  }
  this._init(options)
}

// 最先执行的一批初始化代码处
initMixin(Vue)// 为 Vue 添加 _init
stateMixin(Vue)
eventsMixin(Vue) // 为 Vue 添加事件注册、注销、发布功能
lifecycleMixin(Vue) // 为 Vue 添加 _update、_destroy 等重点方法
// 渲染的核心方法，用来生成render函数和vNode
renderMixin(Vue)// 为 Vue 添加 _render 方法

export default Vue
