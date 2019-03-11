import axios, { AxiosRequestConfig } from 'axios'
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
        this.heap = new MinHeap(this.compareFunc, this.sendReq)
    }

    /** 添加请求 */
    addReq(config: IQueueItem) {
        const id = Symbol()
        this.heap.push({
            ...config,
            id,
        })

        return {
            id,
            pro: new Promise((resolve, reject) => {
                this.proMap[id] = {
                    resolve,
                    reject,
                }
            }),
        }
    }

    /** 删除请求 */
    delReq(targetId: symbol) {
        return this.heap.remove(({ id }) => {
            return id === targetId
        })
    }

    /** 发送请求 */
    private async sendReq() {
        if (this.heap.isEmpty()) {
            return
        }

        if (this.reqNum >= this.maxReq) {
            return
        }

        const { value, id } = this.heap.shift() as IInnerQueueItem
        const { resolve, reject } = this.proMap[id]
        try {
            const res = await axios(value)

            resolve(res)
        } catch (e) {
            reject(e)
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
