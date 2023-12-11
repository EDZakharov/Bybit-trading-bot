import { restClient } from '../restClient'

restClient
	.getAllCoinsBalance({
		accountType: 'UNIFIED',
	})
	.then((response) => {
		console.log(
			response.result.balance.filter((el) => el.coin === 'BTC')[0]
				?.walletBalance
		)
	})
	.catch((error) => {
		console.error(error)
	})
