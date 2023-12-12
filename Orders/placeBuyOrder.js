import restClient from '../restClient.js'

export const placeBuyOrder = async (qty = 0, price = 0) => {
	try {
		const buyOrderResult = await restClient.submitOrder({
			category: 'spot',
			symbol: 'KASUSDT',
			orderType: 'Limit',
			side: 'Buy',
			qty,
			price,
		})
		console.log('buyOrderResult :', buyOrderResult)
	} catch (error) {
		console.error('request failed: ', error)
	}
}
