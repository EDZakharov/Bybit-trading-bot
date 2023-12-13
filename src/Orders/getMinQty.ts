import { getInstrumentInfo } from './getInstrumentInfo.js'

export const getMinQty = async (
	symbol: string
): Promise<string | undefined> => {
	const instrumentInfo = await getInstrumentInfo(symbol)
	return instrumentInfo && instrumentInfo.list[0]?.lotSizeFilter.minOrderQty
}
