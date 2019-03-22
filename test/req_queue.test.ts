import { AsyncQueue } from '../src/index'
import { reflect } from '../src/utils/promise'

describe('test req_queue', () => {
    const asyncFunc = (time = Math.random() * 500) => {
        return new Promise((resolve) => {
            setTimeout(() => resolve('finish'), time)
        })
    }

    it('should exec func', async () => {
        const queue = new AsyncQueue(4)

        const { pro } = queue.add(asyncFunc, {
            priority: 2,
        })

        const res = await pro
        expect(res)
    })

    it('should exec func in order', async () => {
        const queue = new AsyncQueue(2)
        const resultArr: string[] = []
        const expectArr = ['pro3', 'pro2', 'pro1', 'pro11', 'pro4']

        const { pro: pro3 } = queue.add(asyncFunc, {
            priority: 3,
            before: () => {
                resultArr.push('pro3')
            },
        })

        const { pro: pro2 } = queue.add(asyncFunc, {
            priority: 2,
            before: () => {
                resultArr.push('pro2')
            },
        })

        const { pro: pro4 } = queue.add(asyncFunc, {
            priority: 4,
            before: () => {
                resultArr.push('pro4')
            },
        })

        const { pro: pro1 } = queue.add(asyncFunc, {
            priority: 1,
            before: () => {
                resultArr.push('pro1')
            },
        })

        const { pro: pro11 } = queue.add(asyncFunc, {
            priority: 1,
            before: () => {
                resultArr.push('pro11')
            },
        })

        await Promise.all([pro3, pro2, pro4, pro1, pro11])

        expect(resultArr).toEqual(expectArr)
    })

    it('should cancel req', async () => {
        const queue = new AsyncQueue(2)
        const resolveArr: string[] = []
        const rejectArr: string[] = []
        const sendArr: string[] = []
        const { pro: pro3, id: id3 } = queue.add(asyncFunc, {
            priority: 3,
            before: () => {
                sendArr.push('pro3')
            },
        })

        const { pro: pro2 } = queue.add(asyncFunc, {
            priority: 2,
            before: () => {
                sendArr.push('pro2')
            },
        })

        const { pro: pro4, id: id4 } = queue.add(asyncFunc, {
            priority: 4,
            before: () => {
                sendArr.push('pro4')
            },
        })

        const { pro: pro5 } = queue.add(asyncFunc, {
            priority: 5,
            before: () => {
                sendArr.push('pro5')
            },
        })

        const { pro: pro1 } = queue.add(asyncFunc, {
            priority: 1,
            before: () => {
                sendArr.push('pro1')
            },
        })

        const { pro: pro11, id: id11 } = queue.add(asyncFunc, {
            priority: 1,
            before: () => {
                sendArr.push('pro11')
            },
        })

        queue.del(id3)
        queue.del(id4)
        queue.del(id11)

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
        pro5.then(() => {
            resolveArr.push('pro5')
        }).catch(() => {
            rejectArr.push('pro5')
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
            await Promise.all([pro3, pro2, pro4, pro1, pro11, pro5].map(reflect))
        } finally {
            // 返回顺序不可测
            expect(resolveArr.sort()).toEqual(['pro2', 'pro5', 'pro1'].sort())
            expect(rejectArr).toEqual(['pro4', 'pro11', 'pro3'])
            expect(sendArr).toEqual(['pro3', 'pro2', 'pro1', 'pro5'])
        }
    })

    it('should pause queue', async () => {
        const queue = new AsyncQueue(2)
        const sendArr: string[] = []

        const { pro: pro1 } = queue.add(asyncFunc, {
            priority: 1,
            before: () => {
                sendArr.push('pro1')
            },
        })
        const { pro: pro2 } = queue.add(asyncFunc, {
            priority: 1,
            before: () => {
                sendArr.push('pro2')
            },
        })
        const { pro: pro3 } = queue.add(asyncFunc, {
            priority: 1,
            before: () => {
                sendArr.push('pro3')
            },
        })

        queue.pause()
        queue.resume()
        await Promise.all([pro1, pro2, pro3])
        expect(sendArr).toEqual(['pro1', 'pro2', 'pro3'])
    })
})
