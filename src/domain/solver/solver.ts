import { beamSearchSolve } from './beamSearch'
import { branchAndBoundSolve } from './branchAndBound'
import type { SolveInput, SolveResult } from './types'

export type SolverMode = 'exact' | 'fast'

/**
 * ソルバーのファサード。
 * - exact: 分枝限定法(厳密最適)。区域・候補が少ない場合向け。
 * - fast: ビームサーチ(近似)。大規模ケース向け。
 */
export function solve(input: SolveInput, mode: SolverMode = 'exact'): SolveResult {
  return mode === 'exact' ? branchAndBoundSolve(input) : beamSearchSolve(input)
}

export { beamSearchSolve, branchAndBoundSolve }
