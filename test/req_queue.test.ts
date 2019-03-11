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
    const url = 'https://www.baidu.com/'
    const queue = new ReqQueue(2)
    const resultArr: string[] = []
    const expectArr = ['baiduPro3', 'baiduPro2', 'baiduPro1', 'baiduPro11', 'baiduPro4']

    const { pro: baiduPro3 } = queue.addReq({
        priority: 3,
        beforeSend: () => {
            resultArr.push('baiduPro3')
        },
        value: {
            method: 'get',
            url,
        },
    })

    const { pro: baiduPro2 } = queue.addReq({
        priority: 2,
        beforeSend: () => {
            resultArr.push('baiduPro2')
        },
        value: {
            method: 'get',
            url,
        },
    })

    const { pro: baiduPro4 } = queue.addReq({
        priority: 4,
        beforeSend: () => {
            resultArr.push('baiduPro4')
        },
        value: {
            method: 'get',
            url,
        },
    })

    const { pro: baiduPro1 } = queue.addReq({
        priority: 1,
        beforeSend: () => {
            resultArr.push('baiduPro1')
        },
        value: {
            method: 'get',
            url,
        },
    })

    const { pro: baiduPro11 } = queue.addReq({
        priority: 1,
        beforeSend: () => {
            resultArr.push('baiduPro11')
        },
        value: {
            method: 'get',
            url,
        },
    })

    await Promise.all([baiduPro3, baiduPro2, baiduPro4, baiduPro1, baiduPro11])

    expect(resultArr).toEqual(expectArr)
})
