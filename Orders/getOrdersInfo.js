import restClient from '../restClient.js'

export const getOrdersInfo = async (symbol = '') => {
	try {
		const { result } = await restClient.getActiveOrders({
			category: 'spot',
			symbol,
		})
		return result
	} catch (error) {
		console.error('request failed: ', error)
	}
}
