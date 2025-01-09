import sdk from 'state/sdk'

export const queryTokenInfo = async (
	address: string
) => {
	return (await sdk.wallet.getTokenInfo([address]))[0]
}

