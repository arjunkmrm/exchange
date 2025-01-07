import Head from 'next/head'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { selectCurrentMarketInfo } from 'state/exchange/selectors'
import { useAppSelector } from 'state/hooks'
import { selectCurrentMarketPrice } from 'state/prices/selectors'
import { formatCurrency } from 'utils/prices'

const MarketHead: FC = () => {
	const { t } = useTranslation()
	const market = useAppSelector(selectCurrentMarketInfo)
	const price = useAppSelector(selectCurrentMarketPrice)

	return (
		<Head>
			<title>
				{
					price > 0
					? t('futures.market.page-title-rate', {
							marketName: market?.displayName,
							rate: formatCurrency(market?.displayName ?? '', price, {
								currencyKey: market?.displayName,
								suggestDecimals: true,
							}),
					  })
					: t('futures.market.page-title')
				}
			</title>
		</Head>
	)
}

export default MarketHead
