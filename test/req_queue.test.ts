import { ReqQueue } from '../src/index'

test('can send request', async () => {
    const queue = new ReqQueue(4)

    const { pro } = queue.addReq({
        priority: 2,
        value: {
            method: 'get',
            url: 'https://www.baidu.com/',
        },
    })

    const res = await pro
    expect(res)
})

test('send in order', async () => {
    const queue = new ReqQueue(1)
    const resultArr: string[] = []
    const expectArr = ['baiduPro', 'sohuPro', 'qqPro', 'sinaPro']

    const { pro: baiduPro } = queue.addReq({
        priority: 3,
        value: {
            method: 'get',
            url: 'https://www.baidu.com/',
        },
    })

    const { pro: sinaPro } = queue.addReq({
        priority: 2,
        value: {
            method: 'get',
            url: 'https://www.sina.com.cn/',
        },
    })

    const { pro: sohuPro } = queue.addReq({
        priority: 1,
        value: {
            method: 'get',
            url: 'http://www.sohu.com/',
        },
    })

    const { pro: qqPro } = queue.addReq({
        priority: 1,
        value: {
            method: 'get',
            url: 'https://www.qq.com/',
        },
    })

    baiduPro.then(() => {
        resultArr.push('baiduPro')
    })
    sinaPro.then(() => {
        resultArr.push('sinaPro')
    })
    sohuPro.then(() => {
        resultArr.push('sohuPro')
    })
    qqPro.then(() => {
        resultArr.push('qqPro')
    })

    await Promise.all([baiduPro, sinaPro, sohuPro, qqPro])

    expect(resultArr).toEqual(expectArr)
})
