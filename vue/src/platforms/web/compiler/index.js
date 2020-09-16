/* @flow */

import { baseOptions } from './options'
import { createCompiler } from 'compiler/index'

// 先执行创建
/**
 *  运行得到 compile, compileToFunctions
 * return {
 *     compile,
 *     // 集成 to-function.js 中的 compileToFunctions
 *    compileToFunctions: createCompileToFunctionFn(compile)
 *    
 *   }
 *
 * compile            = create-compiler.js // function compile {...}
 * compileToFunctions = to-function.js // function compileToFunctions {...}
 */
const { compile, compileToFunctions } = createCompiler(baseOptions)

// API
export { compile, compileToFunctions }
