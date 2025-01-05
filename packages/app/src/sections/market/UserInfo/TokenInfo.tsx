import React, { memo } from 'react'
import { useAppSelector } from 'state/hooks'
import { selectCurrentMarketInfo } from 'state/exchange/selectors'
import { TokenInfo } from 'sections/asset/TokenInfo'
import { selectNetwork } from 'state/app/selectors'

const TokenInfoTab: React.FC = memo(() => {
	const pairInfo = useAppSelector(selectCurrentMarketInfo)
	const networkId = useAppSelector(selectNetwork)

	return (
		<TokenInfo
			name={pairInfo?.tokenX.name ?? ''}
			symbol={pairInfo?.tokenX.symbol ?? ''}
			logo={pairInfo?.tokenX.logo ?? ''}
			address={pairInfo?.marketAddress ?? ''}
			description = {pairInfo?.tokenX.description ?? ''}
			networkId={networkId}
			website = {pairInfo?.tokenX.url ?? ''}
		/>
	)
})

export default TokenInfoTab
