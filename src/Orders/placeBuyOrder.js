import restClient from '../restClient.js'
import { symbolChecker } from '../Utils/symbolChecker.js'

export const placeOrder = async (side, symbol, qty = 0, price = 0) => {
	let ok = symbolChecker(symbol)
	if (!ok) {
		console.error(`request failed: undefined coin`)
		return
	}
	try {
		const buyOrderResult = await restClient.submitOrder({
			category: 'spot',
			orderType: 'Limit',
			side,
			symbol,
			qty,
			price,
		})
		console.log('buyOrderResult :', buyOrderResult)
	} catch (error) {
		console.error('request failed: ', error)
	}
}
