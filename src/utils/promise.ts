const reflect = async (p: Promise<any>) => {
    try {
        const v = await p
        return {
            v,
            status: 'fulfilled',
        }
    } catch (e) {
        return {
            e,
            status: 'rejected',
        }
    }
}

export { reflect }
