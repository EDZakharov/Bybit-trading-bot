import { TickerSpotV5 } from 'bybit-api/lib/types/response/v5-market.js'
import { CategoryListV5 } from 'bybit-api/lib/types/v5-shared.js'
import restClient from '../restClient.js'

export const getTickers = async (
	symbol: string
): Promise<CategoryListV5<TickerSpotV5[], 'spot'> | undefined> => {
	try {
		const { result } = await restClient.getTickers({
			category: 'spot',
			symbol,
		})
		if (!result.list) {
			console.error(`request failed: undefined coin - ${symbol}`)
			return
		}
		console.dir(result)
		return result
	} catch (error) {
		console.error('request failed: something went wrong')
		return
	}
}
