import axios, { AxiosRequestConfig, AxiosPromise } from 'axios'
import { MinHeap } from './heap'

interface IQueueItem {
    priority?: number
    value: AxiosRequestConfig
}

interface IInnerQueueItem extends IQueueItem {
    id: symbol
}

class ReqQueue {
    private heap: MinHeap<IInnerQueueItem>
    /** 当前请求数量 */
    private reqNum = 0
    private proMap: any = {}

    constructor(private readonly maxReq: number) {
        this.heap = new MinHeap(this.compareFunc)
    }

    /** 添加请求 */
    addReq<T = any>(config: IQueueItem) {
        const id = Symbol()
        // 先创建promise
        const pro = new Promise((resolve, reject) => {
            this.proMap[id] = {
                resolve,
                reject,
            }
        }) as AxiosPromise<T>

        // 放入队列中
        this.heap.push({
            ...config,
            id,
        })

        this.sendReq()

        return {
            id,
            pro,
        }
    }

    /** 删除请求 */
    delReq(targetId: symbol) {
        return this.heap.remove(({ id }) => {
            return id === targetId
        })
    }

    /** 发送请求 */
    private sendReq = async () => {
        if (this.heap.isEmpty()) {
            return
        }

        if (this.reqNum >= this.maxReq) {
            return
        }

        const { value, id } = this.heap.shift() as IInnerQueueItem
        const { resolve, reject } = this.proMap[id]
        try {
            this.reqNum++
            const res = await axios(value)

            resolve(res)
        } catch (e) {
            reject(e)
        } finally {
            this.reqNum--
            this.sendReq()
        }
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
