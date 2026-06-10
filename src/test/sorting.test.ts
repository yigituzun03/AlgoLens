import { describe, expect, it } from 'vitest'
import { runSortingAlgorithm, sortingAlgorithms } from '../algorithms/sorting'
import type { SortingAlgorithmId } from '../algorithms/types'
import { parseSortingInput } from '../data/input'

const cases = [
  { name: 'normal values', input: [38, 12, 91, 4, 47, 22] },
  { name: 'empty array', input: [] },
  { name: 'duplicates', input: [5, 3, 5, 1, 3, 9] },
  { name: 'already sorted', input: [1, 2, 3, 4, 5] },
]

describe('sorting algorithms', () => {
  it.each(sortingAlgorithms)('sorts with $name', (algorithm) => {
    for (const testCase of cases) {
      const result = runSortingAlgorithm(
        algorithm.id as SortingAlgorithmId,
        testCase.input,
      )
      const expected = [...testCase.input].sort((left, right) => left - right)

      expect(result.finalArray, testCase.name).toEqual(expected)
      expect(result.steps.at(0)?.operation).toBe('initial')
      expect(result.steps.at(-1)?.operation).toBe('complete')
      expect(result.metrics.steps).toBe(result.steps.length)
    }
  })

  it('does not mutate the input array', () => {
    const input = [9, 1, 4, 2]
    const original = [...input]

    runSortingAlgorithm('quick', input)

    expect(input).toEqual(original)
  })

  it('parses custom sorting input', () => {
    expect(parseSortingInput('8, 3 5\n1').values).toEqual([8, 3, 5, 1])
    expect(parseSortingInput('1, 2, nope, 4').error).toContain('positive integer')
    expect(parseSortingInput('1, 2, 3').error).toContain('between 4 and 40')
  })
})
