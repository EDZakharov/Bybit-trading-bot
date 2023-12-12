import restClient from '../restClient.js'

export const getBalance = async (coin) => {
	if (coin && coin.length !== 0) {
		try {
			const { result } = await restClient.getCoinBalance({
				coin,
				accountType: 'UNIFIED',
			})
			return result.balance
		} catch (error) {
			console.error('request failed: ', error)
		}
	} else {
		console.error(`request failed: undefined coin`)
		return
	}
}
