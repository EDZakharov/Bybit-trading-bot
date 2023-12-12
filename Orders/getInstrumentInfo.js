import restClient from '../restClient.js'

export const getInstrumentInfo = async (symbol) => {
	//symbol = coin -> for example BTCUSDT
	if (symbol && symbol.length !== 0) {
		try {
			const { result } = await restClient.getInstrumentsInfo({
				category: 'spot',
				symbol,
			})
			return result
		} catch (error) {
			console.error('request failed: ', error)
		}
	} else {
		console.error(`request failed: undefined coin`)
		return
	}
}
