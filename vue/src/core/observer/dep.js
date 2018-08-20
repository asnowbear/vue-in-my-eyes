/* @flow */

import type Watcher from './watcher'
import { remove } from '../util/index'

let uid = 0

/**
 * A dep is an observable that can have multiple
 * directives（指令） subscribing(订阅) to it.
 */
export default class Dep {
  static target: ?Watcher;
  id: number;
  subs: Array<Watcher>; // 存储所有的 watcher

  constructor () {
    this.id = uid++
    this.subs = []
  }

  /**
   * 添加 watcher 对象，建立和 watcher 的关联
   * 来自 watcher.addDep() 方法
   *
   * @param {Watcher} sub
   * @memberof Dep
   */
  addSub (sub: Watcher) {
    this.subs.push(sub)
  }

  // 移除 watcher 对象
  removeSub (sub: Watcher) {
    remove(this.subs, sub)
  }

  // 依赖收集
  depend () {
    if (Dep.target) {
      Dep.target.addDep(this) // 调用 watcher 来添加 dep 对象
    }
  }

  // 发布通告
  notify () {
    // stabilize the subscriber list first
    const subs = this.subs.slice()
    for (let i = 0, l = subs.length; i < l; i++) {
      subs[i].update() // 调用 watcher 对象的 update 的方法
    }
  }
}

// the current target watcher being evaluated(求值，估算).
// this is globally unique because there could be only one
// watcher being evaluated at any time.
Dep.target = null // 代表一个 watcher 实例，全局对象
const targetStack = [] // target的栈对象

export function pushTarget (_target: Watcher) {
  if (Dep.target) {
    targetStack.push(Dep.target)
  }

  Dep.target = _target
}

export function popTarget () {
  Dep.target = targetStack.pop()
}
