/* @flow */

import Dep from './dep'
import VNode from '../vdom/vnode'
import { arrayMethods } from './array'
import {
  def,
  warn,
  hasOwn,
  hasProto,
  isObject,
  isPlainObject,
  isValidArrayIndex,
  isServerRendering
} from '../util/index'

const arrayKeys = Object.getOwnPropertyNames(arrayMethods)

/**
 * By default, when a reactive property is set, the new value is
 * also converted to become reactive. However when passing down props,
 * we don't want to force conversion because the value may be a nested value
 * under a frozen data structure. Converting it would defeat the optimization.
 */
export const observerState = {
  shouldConvert: true
}

/**
 * Observer class that are attached to each observed
 * object. Once attached, the observer converts target
 * object's property keys into getter/setters that
 * collect dependencies and dispatches updates.
 */
export class Observer {
  value: any;
  dep: Dep;
  vmCount: number; // number of vms that has this object as root $data

  constructor (value: any) {
    this.value = value
    this.dep = new Dep()
    this.vmCount = 0
    // 给 value 添加 __ob__ 属性，并赋值为 Observer 实例
    // value.__ob__ = this，就是挂载自己个
    def(value, '__ob__', this)

    // 监控 array
    if (Array.isArray(value)) {
      const augment = hasProto
        ? protoAugment
        : copyAugment
      augment(value, arrayMethods, arrayKeys)

      console.log('Start Array observer >>>>>>>>>')
      // 遍历 array，并监控 array
      this.observeArray(value)
    } else {
      // console.log('Start Object Walk >>>>>>>>>')
      // 为每一个data属性添加拦截
      this.walk(value)
    }
  }

  /**
   * Walk through each property and convert them into
   * getter/setters. This method should only be called when
   * value type is Object.
   */
  walk (obj: Object) {
    const keys = Object.keys(obj)
    for (let i = 0; i < keys.length; i++) {
      defineReactive(obj, keys[i], obj[keys[i]])
    }
  }

  /**
   * Observe a list of Array items.
   */
  observeArray (items: Array<any>) {
    for (let i = 0, l = items.length; i < l; i++) {
      observe(items[i])
    }
  }
}

// helpers

/**
 * Augment an target Object or Array by intercepting
 * the prototype chain using __proto__
 */
function protoAugment (target, src: Object, keys: any) {
  /* eslint-disable no-proto */
  target.__proto__ = src
  /* eslint-enable no-proto */
}

/**
 * Augment an target Object or Array by defining
 * hidden properties.
 */
/* istanbul ignore next */
function copyAugment (target: Object, src: Object, keys: Array<string>) {
  for (let i = 0, l = keys.length; i < l; i++) {
    const key = keys[i]
    def(target, key, src[key])
  }
}

function printObject (object: any): string {
  let result = object

  if (isObject(object)) {
    const keys = Object.keys(object)
    keys.forEach(key => {
      result += '[' + key + ']  = ' + object[key] + ', '
    })
  }

  if (object.length) {
    result = object.join()
  }

  return result
}

/**
 * 类似一个工厂方法
 * 创造 ob 对象，没有则新创建，有则返回缓存
 * Attempt to create an observer instance for a value,
 * returns the new observer if successfully observed,
 * or the existing observer if the value already has one.
 */
export function observe (value: any, asRootData: ?boolean): Observer | void {
  // 数组、对象、VNode对象
  if (!isObject(value) || value instanceof VNode) {
    return
  }

  console.log('observer >>>>>>' + printObject(value))

  // ob: Observer 对象实例
  let ob: Observer | void
  // 在 value 中存在 __ob__, 并且是 Observer 的实例，则将
  // Observer的实例挂载到 __ob__ 对象上
  // 应用层缓存，value 不重复挂载 Observer
  if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
    ob = value.__ob__
  } else if (
    // value 排除 array,
    observerState.shouldConvert &&
    !isServerRendering() &&
    (Array.isArray(value) || isPlainObject(value)) &&
    Object.isExtensible(value) &&
    !value._isVue
  ) {
    // 使用 ob 为 data 中的每个属性添加 get/set
    // 并使用 Dep 桥接 Watcher 和 Observer 之间的关系
    ob = new Observer(value)
  }

  if (asRootData && ob) {
    ob.vmCount++
  }

  // 返回子对象
  return ob
}

/**
 * Define a reactive property on an Object.
 */
export function defineReactive (
  obj: Object,
  key: string,
  val: any,
  customSetter?: ?Function,
  shallow?: boolean
) {
  // 使用闭包特性
  // 为每一个属性项，添加一个观察者
  const dep = new Dep()

  const property = Object.getOwnPropertyDescriptor(obj, key)
  if (property && property.configurable === false) {
    return
  }

  // cater for pre-defined getter/setters
  // 如果 property 上含有 get 和 set方法，则取出来
  // 不污染的作用
  const getter = property && property.get
  const setter = property && property.set

  // 对象的子对象递归进行 observer
  let childOb = !shallow && observe(val)

  // + 号的优先级，比 ？ 要靠前， 这就是为什么不打印 'Observer property >>>>>>'
  console.log('Observer property >>>>>> ' + (key == null ? ' undefined ' : key))

  // 将来应使用Reflect.defineProperty来代替Object的方法
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    // renderd的时候，会调用, 或者调用属性（非渲染）
    get: function reactiveGetter () {
      // 执行 value 已定义的 get 方法
      const value = getter ? getter.call(obj) : val
      console.log('GET >>>>>> ' + key + '   :   ' + value)
      if (Dep.target) {
        // 开始依赖收集(建立 dep 和 watcher 之间的关系)
        dep.depend()
        if (childOb) {
          childOb.dep.depend()
          if (Array.isArray(value)) {
            dependArray(value)
          }
        }
      }
      return value
    },
    // 属性的 set ，会引起 render
    set: function reactiveSetter (newVal) {
      const value = getter ? getter.call(obj) : val
      // 如果是value未变，则不需要走流程
      /* eslint-disable no-self-compare */
      if (newVal === value || (newVal !== newVal && value !== value)) {
        return
      }
      /* eslint-enable no-self-compare */
      if (process.env.NODE_ENV !== 'production' && customSetter) {
        customSetter()
      }

      console.log('SET >>>>>> ' + key + '   :   ' + value)

      // 执行 value 上已定义的 set 方法
      if (setter) {
        setter.call(obj, newVal)
      } else {
        val = newVal
      }

      console.log('Begin to observe new value.' + newVal)

      // observe 新值
      childOb = !shallow && observe(newVal)
      // 发布更新
      dep.notify()
    }
  })
}

/**
 * Set a property on an object. Adds the new property and
 * triggers change notification if the property doesn't
 * already exist.
 */
export function set (target: Array<any> | Object, key: any, val: any): any {
  if (Array.isArray(target) && isValidArrayIndex(key)) {
    target.length = Math.max(target.length, key)
    target.splice(key, 1, val)
    return val
  }
  if (key in target && !(key in Object.prototype)) {
    target[key] = val
    return val
  }
  const ob = (target: any).__ob__
  if (target._isVue || (ob && ob.vmCount)) {
    process.env.NODE_ENV !== 'production' && warn(
      'Avoid adding reactive properties to a Vue instance or its root $data ' +
      'at runtime - declare it upfront in the data option.'
    )
    return val
  }
  if (!ob) {
    target[key] = val
    return val
  }
  defineReactive(ob.value, key, val)
  ob.dep.notify()
  return val
}

/**
 * Delete a property and trigger change if necessary.
 */
export function del (target: Array<any> | Object, key: any) {
  if (Array.isArray(target) && isValidArrayIndex(key)) {
    target.splice(key, 1)
    return
  }
  const ob = (target: any).__ob__
  if (target._isVue || (ob && ob.vmCount)) {
    process.env.NODE_ENV !== 'production' && warn(
      'Avoid deleting properties on a Vue instance or its root $data ' +
      '- just set it to null.'
    )
    return
  }
  if (!hasOwn(target, key)) {
    return
  }
  delete target[key]
  if (!ob) {
    return
  }
  ob.dep.notify()
}

/**
 * Collect dependencies on array elements when the array is touched, since
 * we cannot intercept array element access like property getters.
 */
function dependArray (value: Array<any>) {
  for (let e, i = 0, l = value.length; i < l; i++) {
    e = value[i]
    e && e.__ob__ && e.__ob__.dep.depend()
    if (Array.isArray(e)) {
      dependArray(e)
    }
  }
}
