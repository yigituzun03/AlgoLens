export interface ParseSortingInputResult {
  error?: string
  values: number[]
}

export function parseSortingInput(input: string): ParseSortingInputResult {
  const trimmed = input.trim()

  if (!trimmed) {
    return { values: [], error: 'Enter at least 4 numbers.' }
  }

  const tokens = trimmed.split(/[\s,;]+/).filter(Boolean)

  if (tokens.length < 4 || tokens.length > 40) {
    return {
      values: [],
      error: 'Use between 4 and 40 numbers so the animation stays readable.',
    }
  }

  const values: number[] = []

  for (const token of tokens) {
    if (!/^\d+$/.test(token)) {
      return {
        values: [],
        error: `"${token}" is not a positive integer.`,
      }
    }

    const value = Number(token)

    if (!Number.isSafeInteger(value) || value <= 0 || value > 999) {
      return {
        values: [],
        error: 'Numbers must be positive integers from 1 to 999.',
      }
    }

    values.push(value)
  }

  return { values }
}
