import { OrderResultV5 } from 'bybit-api'
import { symbolChecker } from '../Utils/symbolChecker.ts'
import restClient from '../restClient.ts'
import { getActiveOrders } from './getActiveOrders.ts'

export const cancelOrder = async (
	symbol: string,
	orderId: string
): Promise<OrderResultV5 | undefined> => {
	if (!symbolChecker(symbol) || symbol.length === 0) {
		console.error(`request failed: undefined coin ${symbol}`)
		return
	}

	if (orderId.length === 0) {
		console.error('request failed: wrong orderId length')
		return
	}

	try {
		const activeOrders = await getActiveOrders(symbol)
		const activeOrderId = activeOrders?.list.find(
			(order) => order.orderId === orderId
		)

		if (!activeOrderId) {
			console.error(`request failed: order with id ${orderId} not found`)
			return
		}

		const { result } = await restClient.cancelOrder({
			category: 'spot',
			symbol,
			orderId,
		})
		console.log(result)
	} catch (error) {
		console.error('request failed: something went wrong')
	}
}
