import { AxiosRequestConfig, Canceler } from 'axios'

interface IQueueItem {
    // 优先级
    priority?: number
    // 发送前回调 测试用
    beforeSend?: (config: AxiosRequestConfig) => void
    // axios 配置
    value: AxiosRequestConfig
}

interface IInnerQueueItem extends IQueueItem {
    id: symbol
}

interface ICacheItem {
    // 请求promise 引用
    promise: {
        resolve?: (arg: any) => void
        reject: (arg: any) => void
    }
    canceler: Canceler
}

export { IQueueItem, IInnerQueueItem, ICacheItem }
