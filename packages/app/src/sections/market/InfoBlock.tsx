import React, { memo, useMemo } from 'react'
import styled from 'styled-components'
import { FlexDivRow } from 'components/layout/flex'
import { useAppSelector } from 'state/hooks'
import { selectCurrentMarketInfo, selectOrderDirection, selectOrderPrice, selectOrderType } from 'state/exchange/selectors'
import { selectBalanceInBank } from 'state/wallet/selectors'
import { OrderDirection } from '@bitly/sdk/types'
import { InfoBoxRow } from 'components/InfoBox'
import { formatCurrency } from 'utils/prices'

type MarginInputProps = {
	isMobile?: boolean
}

const InfoBlock: React.FC<MarginInputProps> = memo(({ isMobile }) => {
	const marketInfo = useAppSelector(selectCurrentMarketInfo)
	const balances = useAppSelector(selectBalanceInBank)
	const orderDirection = useAppSelector(selectOrderDirection)
	const orderPrice = Number(useAppSelector(selectOrderPrice))
	const orderType = useAppSelector(selectOrderType)

	const originTokenbalances = useMemo(() => {
		if (orderDirection == OrderDirection.buy) {
			return balances[marketInfo?.tokenY.address ?? ''] ?? 0
		} else {
			return balances[marketInfo?.tokenX.address ?? ''] ?? 0
		}
	}, [balances, marketInfo, orderDirection])

	const originTokenSymbol = useMemo(() => {
		if (orderDirection == OrderDirection.buy) {
			return marketInfo?.tokenY.symbol ?? ''
		} else {
			return marketInfo?.tokenX.symbol ?? ''
		}
	}, [marketInfo, orderDirection])

	const targetTokenSymbol = useMemo(() => {
		if (orderDirection == OrderDirection.buy) {
			return marketInfo?.tokenX.symbol ?? ''
		} else {
			return marketInfo?.tokenY.symbol ?? ''
		}
	}, [marketInfo, orderDirection])

	const maxSize = useMemo(() => {
		if (orderDirection == OrderDirection.sell) {
			return originTokenbalances * orderPrice
		} else {
			return orderPrice === 0 
				? 0 
				: originTokenbalances / orderPrice
		}
	}, [orderPrice, originTokenbalances])

	return (
		<>
			<Container>
				<InfoBoxRow
					title="Available"
					textValue={formatCurrency(marketInfo?.marketAddress ?? '', originTokenbalances, {
						currencyKey: originTokenSymbol
					})}
				/>
				
				{orderType !== 'market' && <InfoBoxRow
					title={`Max ${orderDirection === OrderDirection.buy ? 'Buy' : 'Sell'}`}
					textValue={formatCurrency(marketInfo?.marketAddress ?? '', maxSize, {
						currencyKey: targetTokenSymbol
					})}
				/>}

			</Container>
		</>
	)
})

const Container = styled.div`
	// margin-top: 18px;
	// margin-bottom: 16px;
`

export default InfoBlock
