import axios, { AxiosPromise } from 'axios'
import { MinHeap } from './heap'
import { IInnerQueueItem, IQueueItem, ICacheItem } from './type'

class ReqQueue {
    private heap: MinHeap<IInnerQueueItem>
    /** 当前请求数量 */
    private reqNum = 0
    /** 缓存 */
    private cache: any = {}
    /** 暂停flag */
    private isPause = false

    constructor(private readonly maxReq: number) {
        this.heap = new MinHeap(this.compareFunc)
    }

    /** 添加请求 */
    addReq<T = any>(config: IQueueItem) {
        // 本次请求唯一id
        const id = Symbol()
        const cacheItem: ICacheItem = {} as any

        // 创建promise
        const pro = new Promise((resolve, reject) => {
            cacheItem.promise = {
                resolve,
                reject,
            }
        }) as AxiosPromise<T>

        // 创建cancel token
        const cancelToken = new axios.CancelToken((cancel) => {
            cacheItem.canceler = cancel
        })

        // 保存缓存
        this.cache[id] = cacheItem

        // 放入队列中
        this.heap.push({
            ...config,
            value: {
                ...config.value,
                cancelToken,
            },
            id,
        })

        // 发请求
        this.sendReq()

        return {
            id,
            pro,
        }
    }

    /** 删除请求 */
    delReq(targetId: symbol) {
        const delResult = this.heap.remove(({ id }) => {
            return id === targetId
        })

        // 不在队列中
        if (delResult.length === 0) {
            // 从缓存中获取
            if (this.cache.hasOwnProperty(targetId)) {
                const cacheItem = this.cache[targetId] as ICacheItem
                // 取消请求
                cacheItem.canceler()
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
        this.sendReq()
    }

    /** 发送请求 */
    private sendReq = async () => {
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

        const { value, id, beforeSend } = this.heap.shift() as IInnerQueueItem
        try {
            const { resolve } = (this.cache[id] as ICacheItem).promise
            this.reqNum++
            if (resolve) {
                beforeSend && beforeSend(value)
                // 发送前钩子
                const res = await axios(value)
                resolve(res)
            } else {
                throw new Error('请求被取消')
            }
        } catch (e) {
            const { reject } = (this.cache[id] as ICacheItem).promise

            reject(e)
        } finally {
            this.reqNum--
            this.clearCacheById(id)

            this.sendReq()
        }
    }

    private clearCacheById(id: symbol) {
        delete this.cache[id]
    }

    private compareFunc(
        { priority: pa = 0 }: IInnerQueueItem,
        { priority: pb = 0 }: IInnerQueueItem
    ) {
        if (pa > pb) {
            return 1
        } else if (pa < pb) {
            return -1
        } else {
            return 0
        }
    }
}

export { ReqQueue, IQueueItem }
