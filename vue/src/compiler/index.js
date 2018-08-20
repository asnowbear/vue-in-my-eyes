/* @flow */

import { parse } from './parser/index'
import { optimize } from './optimizer'
import { generate } from './codegen/index'
import { createCompilerCreator } from './create-compiler'

// `createCompilerCreator` allows creating compilers that use alternative
// parser/optimizer/codegen, e.g the SSR optimizing compiler.
// Here we just export a default compiler using the default parts.

// compile 函数中三个核心步骤的介绍，
// compile 之后我们得到了 render 函数 的字符串形式，
// 后面通过 new Function 得到真正的渲染函数
// 运行函数并赋值给 createCompiler ；等同于 create-compiler.js 中的 createCompiler
export const createCompiler = createCompilerCreator(
  /**
   * 定义 baseCompile 函数
   * @param template
   * @param options
   * @returns {{ast: *, render: string, staticRenderFns: Array.<string>}}
   */
  function baseCompile (template: string, options: CompilerOptions): CompiledResult {
  /**
   * 主要功能是将 template字符串解析成 AST。
   * 前面定义了ASTElement的数据结构，
   * parse 函数就是将template里的结构（指令，属性，标签等）转换为AST形式存进ASTElement中，
   * 最后解析生成AST
   * @type {*}
   */
  const ast = parse(template.trim(), options)
  if (options.optimize !== false) {
    /**
     * 主要功能就是标记静态节点，为后面 patch 过程中对比新旧 VNode 树形结构做优化
     */
    optimize(ast, options)
  }

  /**
   * 主要功能就是根据 AST 结构拼接生成 render 函数的字符串
   * @type {CodegenResult}
   */
  const code = generate(ast, options)
  return {
    ast,
    render: code.render,
    staticRenderFns: code.staticRenderFns
  }
}

)
