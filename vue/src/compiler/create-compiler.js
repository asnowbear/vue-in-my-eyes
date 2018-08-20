/* @flow */

import { extend } from 'shared/util'
import { detectErrors } from './error-detector'
import { createCompileToFunctionFn } from './to-function'

export function createCompilerCreator (baseCompile: Function): Function {
  /**
   * 创建一个 compiler 并返回
   * Object {
   *    compile ：compile，
   *    compileToFunctions： compileToFunctions
   *  }
   */
  return function createCompiler (baseOptions: CompilerOptions) {

    /**
     * 定义 compile 函数
     * 调用 compile 方法拿到 render 函数 的字符串形式
     * @param template
     * @param options
     * @returns {*}
     */
    function compile (template: string, options?: CompilerOptions): CompiledResult {
      const finalOptions = Object.create(baseOptions)
      const errors = []
      const tips = []
      finalOptions.warn = (msg, tip) => {
        (tip ? tips : errors).push(msg)
      }

      if (options) {
        // merge custom modules
        if (options.modules) {
          finalOptions.modules =
            (baseOptions.modules || []).concat(options.modules)
        }
        // merge custom directives
        if (options.directives) {
          finalOptions.directives = extend(
            Object.create(baseOptions.directives || null),
            options.directives
          )
        }
        // copy other options
        for (const key in options) {
          if (key !== 'modules' && key !== 'directives') {
            finalOptions[key] = options[key]
          }
        }
      }

      // baseCompile 在 compiler/index.js 下定义
      // 转换成 AST 形式
      const compiled = baseCompile(template, finalOptions)
      if (process.env.NODE_ENV !== 'production') {
        errors.push.apply(errors, detectErrors(compiled.ast))
      }
      compiled.errors = errors
      compiled.tips = tips
      return compiled
    }

    // 返回 compile 和 createCompileToFunctionFn
    return {
      compile,// template的 AST 字符串形式
      // 集成 to-function.js 中的 compileToFunctions，编译成render的function对象
      // 这个是实际执行者
      compileToFunctions: createCompileToFunctionFn(compile)
    }
  }
}
