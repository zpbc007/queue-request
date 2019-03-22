interface IQueueConfig {
    // 优先级
    priority?: number
    // 执行前回调 测试用
    before?: () => void
    // 取消时回调
    onCancel?: () => void
}

interface IInnerQueueConfig<T = any> extends IQueueConfig {
    // 唯一id
    id: symbol
    // 异步函数
    func: () => Promise<T>
}

interface ICacheItem {
    // 请求promise 引用
    promise: {
        resolve?: (arg: any) => void
        reject: (arg: any) => void
    }
    canceler?: () => void
}

export { IQueueConfig, IInnerQueueConfig, ICacheItem }
