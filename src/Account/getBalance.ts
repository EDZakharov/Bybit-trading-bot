import restClient from '../restClient.ts'
import { symbolChecker } from '../Utils/symbolChecker.ts'

interface IBalance {
	coin: string
	walletBalance: string
	transferBalance: string
	bonus: string
}
export const getBalance = async (
	coin: string
): Promise<IBalance | undefined> => {
	let ok = symbolChecker(coin)
	if (!ok) {
		console.error(`request failed: undefined coin`)
		return
	}
	try {
		const { result } = await restClient.getCoinBalance({
			coin,
			accountType: 'UNIFIED',
		})
		return result.balance
	} catch (error) {
		console.error('request failed: ', error)
	}
}
