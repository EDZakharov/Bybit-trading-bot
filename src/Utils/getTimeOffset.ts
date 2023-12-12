import axios from 'axios'

export async function getTimeOffset(url: string) {
	const start = Date.now()
	const { data } = await axios({
		method: 'get',
		url,
	})
	const end = Date.now()
	return Math.ceil(data.result.timeSecond * 1000 - end + (end - start) / 2)
}
