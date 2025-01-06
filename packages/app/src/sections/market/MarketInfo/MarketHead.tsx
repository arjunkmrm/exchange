import Head from 'next/head'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { selectCurrentMarketInfo } from 'state/exchange/selectors'
import { useAppSelector } from 'state/hooks'
import { formatCurrency } from 'utils/prices'

const MarketHead: FC = () => {
	const { t } = useTranslation()
	const market = useAppSelector(selectCurrentMarketInfo)

	return (
		<Head>
			<title>
				{
					123
					? t('futures.market.page-title-rate', {
							marketName: market?.displayName,
							rate: formatCurrency('USD', 123, {
								currencyKey: 'USD',
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
