import type {
  AlgorithmTeaching,
  SortStep,
  SortingAlgorithmId,
  SortingDefinition,
  SortingResult,
} from './types'

interface SortCounters {
  comparisons: number
  swaps: number
  writes: number
}

const sortingTeaching: Record<SortingAlgorithmId, AlgorithmTeaching> = {
  bubble: {
    mentalModel: 'Repeatedly bubble the largest unsorted value to the right.',
    dataStructure: 'Array with adjacent comparisons.',
    useWhen: 'Learning comparisons and swaps; rarely chosen for production.',
    watchFor: 'After each pass, the rightmost unsorted value becomes final.',
    pseudocode: [
      'repeat passes over the array',
      'compare each adjacent pair',
      'swap if the left value is larger',
      'mark the last value of the pass as sorted',
      'stop when all positions are sorted',
    ],
  },
  merge: {
    mentalModel: 'Split the array into tiny sorted runs, then merge them back.',
    dataStructure: 'Array plus temporary left/right runs.',
    useWhen: 'Stable sorting with predictable O(n log n) work.',
    watchFor: 'The expensive part is writing merged runs back into the array.',
    pseudocode: [
      'split the current range in half',
      'sort the left and right halves',
      'compare the front values of both runs',
      'write the smaller value into the target slot',
      'copy any remaining values',
    ],
  },
  quick: {
    mentalModel: 'Pick a pivot, partition smaller values left, then recurse.',
    dataStructure: 'Array plus recursion stack.',
    useWhen: 'Fast average-case sorting when stability is not required.',
    watchFor: 'A poor pivot can make the recursion unbalanced.',
    pseudocode: [
      'choose a pivot',
      'scan the range against the pivot',
      'move smaller values before the pivot',
      'place the pivot in its final position',
      'recurse on both sides',
    ],
  },
  insertion: {
    mentalModel: 'Grow a sorted prefix by inserting one value at a time.',
    dataStructure: 'Array with a sorted left prefix.',
    useWhen: 'Small arrays, nearly sorted arrays, and teaching stable sorting.',
    watchFor: 'Values shift right until the key reaches its correct position.',
    pseudocode: [
      'take the next unsorted key',
      'compare it with the sorted prefix',
      'shift larger values one slot right',
      'insert the key into the gap',
      'continue until the prefix covers the array',
    ],
  },
  selection: {
    mentalModel: 'Select the smallest remaining value and lock it in place.',
    dataStructure: 'Array with a growing sorted prefix.',
    useWhen: 'Teaching minimum selection and fixed swap counts.',
    watchFor: 'Selection sort compares a lot but swaps at most once per pass.',
    pseudocode: [
      'start at the first unsorted position',
      'scan the rest of the array',
      'remember the smallest value found',
      'swap it into the current position',
      'expand the sorted prefix',
    ],
  },
  heap: {
    mentalModel: 'Build a max heap, then repeatedly extract the largest value.',
    dataStructure: 'Binary heap stored inside the same array.',
    useWhen: 'In-place O(n log n) sorting with a strong CS data-structure signal.',
    watchFor: 'Heapify restores the parent >= children rule.',
    pseudocode: [
      'build a max heap',
      'compare parent with its children',
      'swap with the larger child if needed',
      'move the max value to the sorted suffix',
      'heapify the reduced heap',
    ],
  },
}

function sortedIndices(length: number) {
  return Array.from({ length }, (_, index) => index)
}

function pushSortStep(
  steps: SortStep[],
  array: number[],
  counters: SortCounters,
  step: Pick<SortStep, 'active' | 'message' | 'operation'> &
    Partial<Pick<SortStep, 'activeLine' | 'pivot' | 'sorted'>>,
) {
  steps.push({
    array: [...array],
    active: step.active,
    sorted: step.sorted ?? [],
    operation: step.operation,
    message: step.message,
    comparisons: counters.comparisons,
    swaps: counters.swaps,
    writes: counters.writes,
    activeLine: step.activeLine,
    pivot: step.pivot,
  })
}

function buildResult(
  id: SortingAlgorithmId,
  name: string,
  complexity: string,
  space: string,
  array: number[],
  steps: SortStep[],
  counters: SortCounters,
): SortingResult {
  return {
    id,
    name,
    complexity,
    space,
    teaching: sortingTeaching[id],
    steps,
    finalArray: [...array],
    metrics: {
      comparisons: counters.comparisons,
      swaps: counters.swaps,
      writes: counters.writes,
      steps: steps.length,
    },
  }
}

export function bubbleSort(input: number[]): SortingResult {
  const array = [...input]
  const steps: SortStep[] = []
  const counters: SortCounters = { comparisons: 0, swaps: 0, writes: 0 }
  const sorted = new Set<number>()

  pushSortStep(steps, array, counters, {
    active: [],
    activeLine: 0,
    operation: 'initial',
    message: 'Ready to compare adjacent values.',
  })

  for (let pass = 0; pass < array.length; pass += 1) {
    for (let index = 0; index < array.length - pass - 1; index += 1) {
      counters.comparisons += 1
      pushSortStep(steps, array, counters, {
        active: [index, index + 1],
        activeLine: 1,
        sorted: [...sorted],
        operation: 'compare',
        message: `Compare ${array[index]} and ${array[index + 1]}.`,
      })

      if (array[index] > array[index + 1]) {
        ;[array[index], array[index + 1]] = [array[index + 1], array[index]]
        counters.swaps += 1
        pushSortStep(steps, array, counters, {
          active: [index, index + 1],
          activeLine: 2,
          sorted: [...sorted],
          operation: 'swap',
          message: 'Swap because the left value is larger.',
        })
      }
    }

    if (array.length > 0) {
      sorted.add(array.length - pass - 1)
      pushSortStep(steps, array, counters, {
        active: [],
        activeLine: 3,
        sorted: [...sorted],
        operation: 'select',
        message: 'The largest value in this pass is now locked.',
      })
    }
  }

  pushSortStep(steps, array, counters, {
    active: [],
    activeLine: 4,
    sorted: sortedIndices(array.length),
    operation: 'complete',
    message: 'Array sorted.',
  })

  return buildResult('bubble', 'Bubble Sort', 'O(n^2)', 'O(1)', array, steps, counters)
}

export function mergeSort(input: number[]): SortingResult {
  const array = [...input]
  const steps: SortStep[] = []
  const counters: SortCounters = { comparisons: 0, swaps: 0, writes: 0 }

  pushSortStep(steps, array, counters, {
    active: [],
    activeLine: 0,
    operation: 'initial',
    message: 'Ready to divide the array into sorted runs.',
  })

  function merge(left: number, middle: number, right: number) {
    const leftPart = array.slice(left, middle + 1)
    const rightPart = array.slice(middle + 1, right + 1)
    let leftIndex = 0
    let rightIndex = 0
    let target = left

    while (leftIndex < leftPart.length && rightIndex < rightPart.length) {
      counters.comparisons += 1
      pushSortStep(steps, array, counters, {
        active: [left + leftIndex, middle + 1 + rightIndex],
        activeLine: 2,
        operation: 'compare',
        message: `Compare ${leftPart[leftIndex]} and ${rightPart[rightIndex]}.`,
      })

      if (leftPart[leftIndex] <= rightPart[rightIndex]) {
        array[target] = leftPart[leftIndex]
        leftIndex += 1
      } else {
        array[target] = rightPart[rightIndex]
        rightIndex += 1
      }

      counters.writes += 1
      pushSortStep(steps, array, counters, {
        active: [target],
        activeLine: 3,
        operation: 'overwrite',
        message: 'Write the next smallest value back into place.',
      })
      target += 1
    }

    while (leftIndex < leftPart.length) {
      array[target] = leftPart[leftIndex]
      leftIndex += 1
      counters.writes += 1
      pushSortStep(steps, array, counters, {
        active: [target],
        activeLine: 4,
        operation: 'overwrite',
        message: 'Copy the remaining left run.',
      })
      target += 1
    }

    while (rightIndex < rightPart.length) {
      array[target] = rightPart[rightIndex]
      rightIndex += 1
      counters.writes += 1
      pushSortStep(steps, array, counters, {
        active: [target],
        activeLine: 4,
        operation: 'overwrite',
        message: 'Copy the remaining right run.',
      })
      target += 1
    }
  }

  function sortRange(left: number, right: number) {
    if (left >= right) {
      return
    }

    const middle = Math.floor((left + right) / 2)
    sortRange(left, middle)
    sortRange(middle + 1, right)
    merge(left, middle, right)
  }

  sortRange(0, array.length - 1)

  pushSortStep(steps, array, counters, {
    active: [],
    activeLine: 4,
    sorted: sortedIndices(array.length),
    operation: 'complete',
    message: 'Array sorted.',
  })

  return buildResult('merge', 'Merge Sort', 'O(n log n)', 'O(n)', array, steps, counters)
}

export function quickSort(input: number[]): SortingResult {
  const array = [...input]
  const steps: SortStep[] = []
  const counters: SortCounters = { comparisons: 0, swaps: 0, writes: 0 }
  const settled = new Set<number>()

  pushSortStep(steps, array, counters, {
    active: [],
    activeLine: 0,
    operation: 'initial',
    message: 'Ready to partition around pivots.',
  })

  function swap(left: number, right: number) {
    if (left === right) {
      return
    }

    ;[array[left], array[right]] = [array[right], array[left]]
    counters.swaps += 1
  }

  function partition(left: number, right: number) {
    const pivotValue = array[right]
    let storeIndex = left

    pushSortStep(steps, array, counters, {
      active: [right],
      activeLine: 0,
      pivot: right,
      sorted: [...settled],
      operation: 'partition',
      message: `Choose ${pivotValue} as the pivot.`,
    })

    for (let index = left; index < right; index += 1) {
      counters.comparisons += 1
      pushSortStep(steps, array, counters, {
        active: [index, right],
        activeLine: 1,
        pivot: right,
        sorted: [...settled],
        operation: 'compare',
        message: `Compare ${array[index]} with pivot ${pivotValue}.`,
      })

      if (array[index] <= pivotValue) {
        swap(index, storeIndex)
        if (index !== storeIndex) {
          pushSortStep(steps, array, counters, {
            active: [index, storeIndex],
            activeLine: 2,
            pivot: right,
            sorted: [...settled],
            operation: 'swap',
            message: 'Move the smaller value before the pivot.',
          })
        }
        storeIndex += 1
      }
    }

    swap(storeIndex, right)
    if (storeIndex !== right) {
      pushSortStep(steps, array, counters, {
        active: [storeIndex, right],
        activeLine: 3,
        pivot: storeIndex,
        sorted: [...settled],
        operation: 'swap',
        message: 'Place the pivot in its final position.',
      })
    }

    return storeIndex
  }

  function sortRange(left: number, right: number) {
    if (left > right) {
      return
    }

    if (left === right) {
      settled.add(left)
      return
    }

    const pivotIndex = partition(left, right)
    settled.add(pivotIndex)
    sortRange(left, pivotIndex - 1)
    sortRange(pivotIndex + 1, right)
  }

  sortRange(0, array.length - 1)

  pushSortStep(steps, array, counters, {
    active: [],
    activeLine: 4,
    sorted: sortedIndices(array.length),
    operation: 'complete',
    message: 'Array sorted.',
  })

  return buildResult(
    'quick',
    'Quick Sort',
    'O(n log n) average',
    'O(log n)',
    array,
    steps,
    counters,
  )
}

export function insertionSort(input: number[]): SortingResult {
  const array = [...input]
  const steps: SortStep[] = []
  const counters: SortCounters = { comparisons: 0, swaps: 0, writes: 0 }

  pushSortStep(steps, array, counters, {
    active: [],
    activeLine: 0,
    sorted: array.length > 0 ? [0] : [],
    operation: 'initial',
    message: 'Start with the first value as a sorted prefix.',
  })

  for (let index = 1; index < array.length; index += 1) {
    const key = array[index]
    let scan = index - 1

    pushSortStep(steps, array, counters, {
      active: [index],
      activeLine: 0,
      sorted: sortedIndices(index),
      operation: 'select',
      message: `Take ${key} as the key to insert.`,
    })

    while (scan >= 0) {
      counters.comparisons += 1
      pushSortStep(steps, array, counters, {
        active: [scan, scan + 1],
        activeLine: 1,
        sorted: sortedIndices(index),
        operation: 'compare',
        message: `Compare ${array[scan]} with key ${key}.`,
      })

      if (array[scan] <= key) {
        break
      }

      array[scan + 1] = array[scan]
      counters.writes += 1
      pushSortStep(steps, array, counters, {
        active: [scan, scan + 1],
        activeLine: 2,
        sorted: sortedIndices(index),
        operation: 'shift',
        message: 'Shift the larger value one slot to the right.',
      })
      scan -= 1
    }

    array[scan + 1] = key
    counters.writes += 1
    pushSortStep(steps, array, counters, {
      active: [scan + 1],
      activeLine: 3,
      sorted: sortedIndices(index + 1),
      operation: 'insert',
      message: 'Insert the key into the open gap.',
    })
  }

  pushSortStep(steps, array, counters, {
    active: [],
    activeLine: 4,
    sorted: sortedIndices(array.length),
    operation: 'complete',
    message: 'Array sorted.',
  })

  return buildResult('insertion', 'Insertion Sort', 'O(n^2)', 'O(1)', array, steps, counters)
}

export function selectionSort(input: number[]): SortingResult {
  const array = [...input]
  const steps: SortStep[] = []
  const counters: SortCounters = { comparisons: 0, swaps: 0, writes: 0 }
  const sorted = new Set<number>()

  pushSortStep(steps, array, counters, {
    active: [],
    activeLine: 0,
    operation: 'initial',
    message: 'Ready to scan for the smallest remaining value.',
  })

  for (let index = 0; index < array.length; index += 1) {
    let minIndex = index
    pushSortStep(steps, array, counters, {
      active: [index],
      activeLine: 0,
      sorted: [...sorted],
      operation: 'select',
      message: `Position ${index + 1} needs the smallest remaining value.`,
    })

    for (let scan = index + 1; scan < array.length; scan += 1) {
      counters.comparisons += 1
      pushSortStep(steps, array, counters, {
        active: [minIndex, scan],
        activeLine: 1,
        sorted: [...sorted],
        operation: 'compare',
        message: `Compare current minimum ${array[minIndex]} with ${array[scan]}.`,
      })

      if (array[scan] < array[minIndex]) {
        minIndex = scan
        pushSortStep(steps, array, counters, {
          active: [minIndex],
          activeLine: 2,
          sorted: [...sorted],
          operation: 'select',
          message: `${array[minIndex]} becomes the new minimum candidate.`,
        })
      }
    }

    if (minIndex !== index) {
      ;[array[index], array[minIndex]] = [array[minIndex], array[index]]
      counters.swaps += 1
      pushSortStep(steps, array, counters, {
        active: [index, minIndex],
        activeLine: 3,
        sorted: [...sorted],
        operation: 'swap',
        message: 'Swap the minimum into the sorted prefix.',
      })
    }

    sorted.add(index)
  }

  pushSortStep(steps, array, counters, {
    active: [],
    activeLine: 4,
    sorted: sortedIndices(array.length),
    operation: 'complete',
    message: 'Array sorted.',
  })

  return buildResult('selection', 'Selection Sort', 'O(n^2)', 'O(1)', array, steps, counters)
}

export function heapSort(input: number[]): SortingResult {
  const array = [...input]
  const steps: SortStep[] = []
  const counters: SortCounters = { comparisons: 0, swaps: 0, writes: 0 }
  const sorted = new Set<number>()

  pushSortStep(steps, array, counters, {
    active: [],
    activeLine: 0,
    operation: 'initial',
    message: 'Build a max heap inside the array.',
  })

  function swap(left: number, right: number) {
    if (left === right) {
      return
    }

    ;[array[left], array[right]] = [array[right], array[left]]
    counters.swaps += 1
  }

  function heapify(heapSize: number, root: number) {
    let largest = root
    const left = root * 2 + 1
    const right = root * 2 + 2

    if (left < heapSize) {
      counters.comparisons += 1
      pushSortStep(steps, array, counters, {
        active: [root, left],
        activeLine: 1,
        sorted: [...sorted],
        operation: 'compare',
        message: 'Compare the parent with its left child.',
      })

      if (array[left] > array[largest]) {
        largest = left
      }
    }

    if (right < heapSize) {
      counters.comparisons += 1
      pushSortStep(steps, array, counters, {
        active: [largest, right],
        activeLine: 1,
        sorted: [...sorted],
        operation: 'compare',
        message: 'Compare the current largest value with the right child.',
      })

      if (array[right] > array[largest]) {
        largest = right
      }
    }

    if (largest !== root) {
      swap(root, largest)
      pushSortStep(steps, array, counters, {
        active: [root, largest],
        activeLine: 2,
        sorted: [...sorted],
        operation: 'heapify',
        message: 'Swap with the larger child to restore heap order.',
      })
      heapify(heapSize, largest)
    }
  }

  for (let index = Math.floor(array.length / 2) - 1; index >= 0; index -= 1) {
    heapify(array.length, index)
  }

  for (let end = array.length - 1; end > 0; end -= 1) {
    swap(0, end)
    sorted.add(end)
    pushSortStep(steps, array, counters, {
      active: [0, end],
      activeLine: 3,
      sorted: [...sorted],
      operation: 'swap',
      message: 'Move the maximum value to the sorted suffix.',
    })
    heapify(end, 0)
  }

  if (array.length > 0) {
    sorted.add(0)
  }

  pushSortStep(steps, array, counters, {
    active: [],
    activeLine: 4,
    sorted: sortedIndices(array.length),
    operation: 'complete',
    message: 'Array sorted.',
  })

  return buildResult('heap', 'Heap Sort', 'O(n log n)', 'O(1)', array, steps, counters)
}

export const sortingAlgorithms: SortingDefinition[] = [
  {
    id: 'bubble',
    name: 'Bubble Sort',
    summary: 'Simple adjacent swaps with very visible comparisons.',
    complexity: 'O(n^2)',
    space: 'O(1)',
    teaching: sortingTeaching.bubble,
    run: bubbleSort,
  },
  {
    id: 'insertion',
    name: 'Insertion Sort',
    summary: 'Builds a sorted prefix, one inserted key at a time.',
    complexity: 'O(n^2)',
    space: 'O(1)',
    teaching: sortingTeaching.insertion,
    run: insertionSort,
  },
  {
    id: 'selection',
    name: 'Selection Sort',
    summary: 'Selects the smallest remaining value for each position.',
    complexity: 'O(n^2)',
    space: 'O(1)',
    teaching: sortingTeaching.selection,
    run: selectionSort,
  },
  {
    id: 'merge',
    name: 'Merge Sort',
    summary: 'Stable divide-and-conquer sorting with predictable work.',
    complexity: 'O(n log n)',
    space: 'O(n)',
    teaching: sortingTeaching.merge,
    run: mergeSort,
  },
  {
    id: 'quick',
    name: 'Quick Sort',
    summary: 'Partition-based sorting with strong average performance.',
    complexity: 'O(n log n) average',
    space: 'O(log n)',
    teaching: sortingTeaching.quick,
    run: quickSort,
  },
  {
    id: 'heap',
    name: 'Heap Sort',
    summary: 'Uses an in-place binary heap to repeatedly extract the max.',
    complexity: 'O(n log n)',
    space: 'O(1)',
    teaching: sortingTeaching.heap,
    run: heapSort,
  },
]

export function runSortingAlgorithm(
  id: SortingAlgorithmId,
  input: number[],
): SortingResult {
  const algorithm = sortingAlgorithms.find((candidate) => candidate.id === id)

  if (!algorithm) {
    throw new Error(`Unknown sorting algorithm: ${id}`)
  }

  return algorithm.run(input)
}
