import { MinHeap } from '../src/heap'
import { CompareResult } from '../src/utils/comparator'

interface IHeapItem {
    priority: number
    value: string
    id: number
}

describe('test heap', () => {
    let compareFun: (a: IHeapItem, b: IHeapItem) => CompareResult

    beforeAll(() => {
        compareFun = ({ priority: pa }, { priority: pb }) => {
            if (pa > pb) {
                return 1
            } else if (pa < pb) {
                return -1
            } else {
                return 0
            }
        }
    })

    it('should remove item', () => {
        const heap = new MinHeap<IHeapItem>(compareFun)

        heap.push({
            priority: 3,
            value: '3',
            id: 3,
        })
        heap.push({
            priority: 2,
            value: '2',
            id: 2,
        })
        heap.push({
            priority: 4,
            value: '4',
            id: 4,
        })
        heap.push({
            priority: 1,
            value: '1',
            id: 1,
        })
        heap.push({
            priority: 1,
            value: '11',
            id: 11,
        })

        heap.remove(({ id }) => {
            return id === 2
        })
        heap.remove(({ id }) => {
            return id === 4
        })
        heap.remove(({ id }) => {
            return id === 11
        })

        const resultArr = [heap.shift() as IHeapItem, heap.shift() as IHeapItem].map(
            ({ priority }) => priority
        )

        expect(resultArr).toEqual([1, 3])
        expect(heap.isEmpty()).toEqual(true)
    })
})
