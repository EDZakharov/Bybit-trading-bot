import { symbolChecker } from '../Utils/symbolChecker.ts'
import restClient from '../restClient.ts'
import { getInstrumentInfo } from './getInstrumentInfo.ts'

type sides = 'Buy' | 'Sell'

export const placeOrder = async (
	side: sides,
	symbol: string,
	qty: string,
	price: string
) => {
	let ok = symbolChecker(symbol)
	if (!ok) {
		console.error(`request failed: undefined coin`)
		return
	}

	try {
		const instrumentInfo = await getInstrumentInfo(symbol)
		console.log(instrumentInfo?.list[0])

		const instrumentMinQty =
			instrumentInfo && instrumentInfo.list[0]?.lotSizeFilter.minOrderQty
		if (instrumentMinQty && instrumentMinQty <= qty) {
			const buyOrderResult = await restClient.submitOrder({
				category: 'spot',
				orderType: 'Limit',
				side,
				symbol,
				qty,
				price,
			})
			console.log(buyOrderResult)
		} else {
			!instrumentMinQty
				? console.error(`request failed: undefined coin`)
				: console.error(
						`request failed: you sent ${qty} qty, you should send >= ${instrumentMinQty} qty for success`
				  )
		}
	} catch (error) {
		console.error('request failed: ', error)
	}
}
