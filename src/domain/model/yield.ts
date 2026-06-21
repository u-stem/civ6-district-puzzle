/** イールド種別。隣接ボーナスは主に science/culture/faith/gold/production。 */
export type YieldType =
  | 'food'
  | 'production'
  | 'gold'
  | 'science'
  | 'culture'
  | 'faith'
  | 'housing'
  | 'amenities'

export const YIELD_TYPES: readonly YieldType[] = [
  'food',
  'production',
  'gold',
  'science',
  'culture',
  'faith',
  'housing',
  'amenities',
]

/** 区域 1 つが得る各イールドのボーナス量(floor 済みの整数)。 */
export type YieldBonus = Readonly<Partial<Record<YieldType, number>>>

/** 空の YieldBonus に b を加算した新しい YieldBonus を返す。 */
export function addYield(acc: YieldBonus, type: YieldType, amount: number): YieldBonus {
  const current = acc[type] ?? 0
  return { ...acc, [type]: current + amount }
}
