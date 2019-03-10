type CompareResult = -1 | 0 | 1
type ICompareFunc = (a: any, b: any) => CompareResult

/**
 * 用于比较大小
 */
class Comparator {
    static defaultCompareFunction(a: any, b: any) {
        if (a === b) {
            return 0
        }

        return a < b ? -1 : 1
    }

    compareFunc: ICompareFunc

    constructor(compareFunc: ICompareFunc) {
        this.compareFunc = compareFunc || Comparator.defaultCompareFunction
    }

    equal(a: any, b: any) {
        return this.compareFunc(a, b) === 0
    }

    lessThan(a: any, b: any) {
        return this.compareFunc(a, b) < 0
    }

    greaterThan(a: any, b: any) {
        return this.compareFunc(a, b) > 0
    }

    lessThanOrEqual(a: any, b: any) {
        return this.lessThan(a, b) || this.equal(a, b)
    }

    greaterThanOrEqual(a: any, b: any) {
        return this.greaterThan(a, b) || this.equal(a, b)
    }

    reverse() {
        const compareOriginal = this.compareFunc
        this.compareFunc = (a, b) => compareOriginal(b, a)
    }
}

export { CompareResult, Comparator }
