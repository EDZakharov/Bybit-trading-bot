import restClient from '../restClient.js'

export const getInstrumentInfo = async (symbol) => {
	//symbol = coin -> for example BTCUSDT
	let ok = symbolChecker(symbol)
	if (!ok) {
		console.error(`request failed: undefined coin`)
		return
	}
	try {
		const { result } = await restClient.getInstrumentsInfo({
			category: 'spot',
			symbol,
		})
		return result
	} catch (error) {
		console.error('request failed: ', error)
	}
}
