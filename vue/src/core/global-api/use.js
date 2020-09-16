/* @flow */

import { toArray } from '../util/index'

export function initUse (Vue: GlobalAPI) {
  // 提供为Vue全局挂载插件的能力
  Vue.use = function (plugin: Function | Object) {
    const installedPlugins = (this._installedPlugins || (this._installedPlugins = []))
    // indexOf可以判断对象是否在Array中
    if (installedPlugins.indexOf(plugin) > -1) {
      return this
    }

    // additional parameters
    // 从第一个位置截取后面的数组
    const args = toArray(arguments, 1)
    args.unshift(this) // 添加this(Vue实例对象)到第一个位置

    // 1、apply,call,bind皆为改变this指向的作用
    // 2、apply指向调用方，所以第一个传plugin，原本指向intall fun对象;
    // 第二个不传,因为调用方位plugin
    if (typeof plugin.install === 'function') {
      plugin.install.apply(plugin, args) 
    } else if (typeof plugin === 'function') {
      plugin.apply(null, args)
    }
    installedPlugins.push(plugin)
    return this
  }
}
