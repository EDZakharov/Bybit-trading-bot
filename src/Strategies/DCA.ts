/** Sequencing
 * using strategies - long
 *
 * set target profit or minimum profit - %
 * select deals conditions - immediately | rsi | other
 * set volume of start order - number
 * set volume of insurance order - number
 * set maximum number of insurance orders - number
 * select type of insurance orders - market | limit
 * set price deviation - % of the cost of the initial order
 * set safety order volume multiplier - number
 * set safety order step multiplier - number
 * create a grid for calculating the amount of additional funds for each step
 *
 * start market order
 *
 * ______________________________
 * >>>>> It works like this <<<<<
 * ______________________________
 * Let's say you set the minimum return at 1%.
 * Thus: If the price has not reached this level of profitability, and the
 * selected closing condition signals the closure of the transaction, it will
 * not be closed!
 *
 * If the price overcomes the minimum profit level and the condition for
 * closing the transaction is met to close the transaction, it will be closed!
 *
 * If the price exceeds the minimum profit level and then falls below this
 * level again, the transaction will return to the original standby mode.
 * Thus, if the price falls below the minimum yield again and the trade exit
 * condition is met, the trade will not be closed.
 *
 * ________________________________________________
 * >>>>> Calculation of minimum profitability <<<<<
 * ________________________________________________
 * As a percentage of the base order - the bot will calculate the minimum TP
 * level, taking into account only the size of the base order, regardless of
 * how many safety orders are filled.
 * Thus, if the base order size is $100 and the minimum profit is set to 5%
 * then the TP level will produce a profit of $5 regardless of how many safety
 * orders are filled.
 *
 * As a percentage of the final volume - the bot will calculate the minimum TP
 * level taking into account the size of the entire transaction, and not just
 * the size of the base order.
 * Thus, if the Minimum Profit is set to 5%, the base order size is $100, and
 * 3 safety orders are executed for a total of $900, then the total trade size
 * becomes $1000. And in this case the TP level will be set to $50, not $5.
 *
 * */

import { getInstrumentInfo } from '../Orders/getInstrumentInfo.js'
import { getMinQty } from '../Orders/getMinQty.js'

interface IGridSteps {
	calculatedGrid: Array<calculatedGrid>
	setCalculatedStepsToGrid(): void
}

type props = {
	symbol?: string
	priceDeviation: number
	stepsCount?: number
}

interface calculatedGrid extends props {
	orderNumber: number
}

export const DCA = async ({
	symbol,
	stepsCount,
	priceDeviation,
}: props): Promise<void> => {
	const gridSteps: IGridSteps = {
		calculatedGrid: [],
		async setCalculatedStepsToGrid() {
			if (!stepsCount || !symbol) {
				console.error(`bad stepsCount or symbol`)
				return
			}
			try {
				const result = await getInstrumentInfo(symbol)
				console.dir(result?.list)

				for (let i = 1; i <= stepsCount; i++) {
					this.calculatedGrid.push({
						orderNumber: i,
						priceDeviation,
					})
				}

				const instrumentMinQty = await getMinQty(symbol)

				if (!instrumentMinQty) {
					console.error(`request failed: undefined coin - ${symbol}`)
					return
				}

				//TODO
				// const intMinQty = +instrumentMinQty
			} catch (error) {
				console.error(`request failed: ${error}`)
			}
			console.dir(this.calculatedGrid)
		},
	}
	gridSteps.setCalculatedStepsToGrid()
}
