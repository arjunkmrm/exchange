import sdk from 'state/sdk'

export const queryTokenInfo = (
	address: string
) => {
	return sdk.wallet.getTokenInfo([address])
}

