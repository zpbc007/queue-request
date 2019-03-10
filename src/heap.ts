import { Comparator, CompareResult } from '@utils/comparator'

type ICompare<T> = (a: T, b: T) => CompareResult

/** 最小堆 */
class MinHeap<T = any> {
    private compare: Comparator
    private heapContainer: T[] = []

    constructor(compareFun: ICompare<T>) {
        this.compare = new Comparator(compareFun)
    }

    isEmpty() {
        return this.heapContainer.length === 0
    }

    /**
     * 插入
     */
    push(item: T) {
        this.heapContainer.push(item)
        this.upAdjust()
        return this
    }

    /**
     * 删除堆顶元素
     */
    shift() {
        if (this.heapContainer.length === 0) {
            return null
        }

        if (this.heapContainer.length === 1) {
            return this.heapContainer.pop()
        }

        const result = this.heapContainer[0]

        // 将最后面的元素放入头结点
        this.heapContainer[0] = this.heapContainer.pop() as T
        this.downAdjust()
        return result
    }

    /**
     * 删除指定元素
     */
    remove(item: T) {
        const index = this.heapContainer.indexOf(item)

        if (index === -1) {
            return
        }

        this.heapContainer[index] = this.heapContainer.pop() as T
        const parent = this.parent(index)
        const leftChild = this.leftChild(index)
        if (
            leftChild !== null && // 有子节点
            (!parent || this.compare.lessThan(parent, this.heapContainer[index])) // 没有父节点 或者父节点小于后来的节点
        ) {
            this.downAdjust(index)
        } else {
            this.upAdjust(index)
        }
    }

    private getLeftChildIndex(parentIndex: number) {
        return 2 * parentIndex + 1
    }

    private getRightChildIndex(parentIndex: number) {
        return 2 * parentIndex + 2
    }

    private getParentIndex(childIndex: number) {
        return Math.floor((childIndex - 1) / 2)
    }

    private leftChild(parentIndex: number) {
        return this.heapContainer[this.getLeftChildIndex(parentIndex)]
    }

    private rightChild(parentIndex: number) {
        return this.heapContainer[this.getRightChildIndex(parentIndex)]
    }

    private parent(childIndex: number) {
        return this.heapContainer[this.getParentIndex(childIndex)]
    }

    /**
     * 上浮操作
     * @param childIndex 操作开始位置 默认是最后一个元素
     */
    private upAdjust(childIndex = this.heapContainer.length - 1) {
        // 节点值
        const temp = this.heapContainer[childIndex]
        let parentIndex = this.getParentIndex(childIndex)

        while (
            parentIndex >= 0 && // 未到定点
            this.compare.lessThan(this.heapContainer[childIndex], this.parent(parentIndex)) // 小于父级节点
        ) {
            // 单向赋值
            this.heapContainer[childIndex] = this.heapContainer[parentIndex]
            childIndex = parentIndex
            parentIndex = this.getParentIndex(parentIndex)
        }
        this.heapContainer[childIndex] = temp
    }

    /**
     * 下沉操作
     * @param parentIndex 操作开始位置 默认顶部
     */
    private downAdjust(parentIndex = 0) {
        const temp = this.heapContainer[parentIndex]
        const length = this.heapContainer.length
        let childIndex: number = this.getLeftChildIndex(parentIndex)

        while (childIndex < length) {
            if (
                childIndex + 1 < length && // 有右侧节点
                this.compare.lessThan(this.rightChild(parentIndex), this.leftChild(parentIndex)) // 右侧小于左侧
            ) {
                // 将小的那个换上去
                childIndex++
            }

            if (
                this.compare.lessThan(
                    this.heapContainer[parentIndex],
                    this.heapContainer[childIndex]
                )
            ) {
                // 父级节点小于子节点
                break
            }

            // 单向赋值
            this.heapContainer[parentIndex] = this.heapContainer[childIndex]
            parentIndex = childIndex
            childIndex = this.getLeftChildIndex(parentIndex)
        }

        this.heapContainer[parentIndex] = temp
    }
}

export { MinHeap }
