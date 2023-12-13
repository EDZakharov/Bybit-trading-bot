// import { cancelOrder } from './Orders/cancelOrder.ts'
import { DCA } from './Strategies/DCA.js'
// const test = await getBalance('KAS')
//TESTS
// placeOrder('Buy', 'TRXUSDT', '30', '0.05')
// placeOrder('Buy', 'KASUSDT', '50', '0.05')

// import { getTickers } from './Market/getTickers.ts'

// import { getActiveOrders } from './Orders/getActiveOrders.ts'
// getActiveOrders('KASUSDT')
// cancelOrder('KASUSDT', '1574820974971592448')

// const response = await getTickers('KASUSDT')
// placeOrder(
// 	'Buy',
// 	'KASUSDT',
// 	'30',
// 	`${response && +response.list[0].lastPrice - 0.02}`
// )

DCA({
	symbol: 'KASUSDT',
	stepsCount: 5,
	priceDeviation: 0.4,
})
