import { ReqQueue } from '../src/index'
import { reflect } from '../src/utils/promise'

const url = 'https://www.baidu.com/'
describe('test req_queue', () => {
    it('should send request', async () => {
        const queue = new ReqQueue(4)

        const { pro } = queue.addReq({
            priority: 2,
            value: {
                method: 'get',
                url,
            },
        })

        const res = await pro
        expect(res)
    })

    it('should send req in order', async () => {
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

    it('should cancel req', async () => {
        const queue = new ReqQueue(1)
        const resolveArr: string[] = []
        const rejectArr: string[] = []
        const sendArr: string[] = []
        const { pro: pro3, id: id3 } = queue.addReq({
            priority: 3,
            beforeSend: () => {
                sendArr.push('pro3')
            },
            value: {
                method: 'get',
                url,
                params: { id: 3 },
            },
        })

        const { pro: pro2 } = queue.addReq({
            priority: 2,
            beforeSend: () => {
                sendArr.push('pro2')
            },
            value: {
                method: 'get',
                url,
                params: { id: 2 },
            },
        })

        const { pro: pro4, id: id4 } = queue.addReq({
            priority: 4,
            beforeSend: () => {
                sendArr.push('pro4')
            },
            value: {
                method: 'get',
                url,
                params: { id: 4 },
            },
        })

        const { pro: pro1 } = queue.addReq({
            priority: 1,
            beforeSend: () => {
                sendArr.push('pro1')
            },
            value: {
                method: 'get',
                url,
                params: { id: 1 },
            },
        })

        const { pro: pro11, id: id11 } = queue.addReq({
            priority: 1,
            beforeSend: () => {
                sendArr.push('pro11')
            },
            value: {
                method: 'get',
                url,
                params: { id: 11 },
            },
        })

        queue.delReq(id3)
        queue.delReq(id4)
        queue.delReq(id11)

        pro3.then(() => {
            resolveArr.push('pro3')
        }).catch(() => {
            rejectArr.push('pro3')
        })
        pro2.then(() => {
            resolveArr.push('pro2')
        }).catch(() => {
            rejectArr.push('pro2')
        })
        pro4.then(() => {
            resolveArr.push('pro4')
        }).catch(() => {
            rejectArr.push('pro4')
        })
        pro1.then(() => {
            resolveArr.push('pro1')
        }).catch(() => {
            rejectArr.push('pro1')
        })
        pro11
            .then(() => {
                resolveArr.push('pro11')
            })
            .catch(() => {
                rejectArr.push('pro11')
            })

        try {
            await Promise.all([pro3, pro2, pro4, pro1, pro11].map(reflect))
        } finally {
            expect(resolveArr).toEqual(['pro1', 'pro2'])
            expect(rejectArr).toEqual(['pro4', 'pro11', 'pro3'])
            expect(sendArr).toEqual(['pro3', 'pro1', 'pro2'])
        }
    })
})
