import { MinHeap } from './heap'
import { IInnerQueueConfig, IQueueConfig, ICacheItem } from './type'

class AsyncQueue {
    private heap: MinHeap<IInnerQueueConfig>
    /** 当前执行数量 */
    private reqNum = 0
    /** 缓存 */
    private cache: any = {}
    /** 暂停flag */
    private isPause = false

    constructor(private readonly maxReq: number) {
        this.heap = new MinHeap(this.compareFunc)
    }

    /** 添加 */
    add<T>(func: () => Promise<T>, { onCancel, ...config }: IQueueConfig = {}) {
        // 唯一id
        const id = Symbol()
        const cacheItem: ICacheItem = {
            canceler: onCancel,
        } as any

        // 创建promise
        const pro = new Promise((resolve, reject) => {
            cacheItem.promise = {
                resolve,
                reject,
            }
        })

        // 保存缓存
        this.cache[id] = cacheItem

        // 放入队列中
        this.heap.push({
            ...config,
            id,
            func,
        })

        // 发请求
        this.exec()

        return {
            id,
            pro,
        }
    }

    /** 删除请求 */
    del(targetId: symbol) {
        const delResult = this.heap.remove(({ id }) => {
            return id === targetId
        })

        // 不在队列中
        if (delResult.length === 0) {
            // 从缓存中获取
            if (this.cache.hasOwnProperty(targetId)) {
                const cacheItem = this.cache[targetId] as ICacheItem
                cacheItem.canceler && cacheItem.canceler()
                // resolve 置空
                delete cacheItem.promise.resolve
            } else {
                console.warn(`该请求不存在 或者请求已经发送完毕`)
            }
        } else {
            const cacheItem = this.cache[targetId] as ICacheItem
            cacheItem.promise.reject('cancel request')
            // 清空缓存
            this.clearCacheById(targetId)
        }
    }

    /** 暂停队列 */
    pause() {
        if (this.isPause) {
            console.warn(`queue in pause state, can not pause`)
            return
        }

        this.isPause = true
    }

    /** 恢复队列 */
    resume() {
        if (!this.isPause) {
            console.warn(`queue is in start state, can not resume`)
            return
        }

        this.isPause = false
        this.exec()
    }

    /** 发送请求 */
    private exec = async () => {
        // 队列处于暂停状态
        if (this.isPause) {
            return
        }

        // 队列为空
        if (this.heap.isEmpty()) {
            return
        }

        // 当前发送请求已经到达最大值
        if (this.reqNum >= this.maxReq) {
            return
        }

        const { id, before, func } = this.heap.shift() as IInnerQueueConfig
        try {
            this.reqNum++
            this.getResolve(id)
            // 发送前钩子
            before && before()
            const res = await func()
            this.getResolve(id)(res)
        } catch (e) {
            const { reject } = (this.cache[id] as ICacheItem).promise

            reject(e)
        } finally {
            this.reqNum--
            this.clearCacheById(id)

            this.exec()
        }
    }

    private clearCacheById(id: symbol) {
        delete this.cache[id]
    }

    private compareFunc(
        { priority: pa = 0 }: IInnerQueueConfig,
        { priority: pb = 0 }: IInnerQueueConfig
    ) {
        if (pa > pb) {
            return 1
        } else if (pa < pb) {
            return -1
        } else {
            return 0
        }
    }

    private getResolve(id: symbol) {
        const { resolve } = (this.cache[id] as ICacheItem).promise
        if (!resolve) {
            throw new Error('请求被取消')
        }

        return resolve
    }
}

export { AsyncQueue }
