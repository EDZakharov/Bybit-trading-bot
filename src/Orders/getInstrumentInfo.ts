import { symbolChecker } from '../Utils/symbolChecker.ts'
import restClient from '../restClient.ts'

export const getInstrumentInfo = async (symbol: string) => {
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
