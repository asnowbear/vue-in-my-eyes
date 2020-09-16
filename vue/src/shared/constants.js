// 服务端渲染常量标识
export const SSR_ATTR = 'data-server-rendered'

// 直接绑到 Vue 上的静态方法
export const ASSET_TYPES = [
  'component', // Vue.component
  'directive',
  'filter'
]

// 生命周期中的钩子函数列表
export const LIFECYCLE_HOOKS = [
  'beforeCreate',
  'created',
  'beforeMount',
  'mounted',
  'beforeUpdate',
  'updated',
  'beforeDestroy',
  'destroyed',
  'activated',
  'deactivated',
  'errorCaptured'
]
