import { symbolChecker } from '../Utils/symbolChecker.js'
import restClient from '../restClient.js'
import { cancelOrder } from './cancelOrder.js'
import { getMinQty } from './getMinQty.js'

type sides = 'Buy' | 'Sell'

export const placeOrder = async (
	side: sides,
	symbol: string,
	qty: string,
	price: string
) => {
	if (!symbolChecker(symbol)) {
		console.error(`request failed: undefined coin - ${symbol}`)
		return
	}

	try {
		const instrumentMinQty = await getMinQty(symbol)
		if (instrumentMinQty && +instrumentMinQty <= +qty) {
			// place order
			const data = await restClient.submitOrder({
				category: 'spot',
				orderType: 'Limit',
				side,
				symbol,
				qty,
				price,
			})
			console.dir(data)
			// cancel order
			await cancelOrder(symbol, data.result.orderId)
		} else {
			!instrumentMinQty
				? console.error(`request failed: undefined coin - ${symbol}`)
				: console.error(
						`request failed: you sent ${qty} qty, you should send >= ${instrumentMinQty} qty for success`
				  )
		}
	} catch (error) {
		console.error('request failed: ', error)
	}
}
