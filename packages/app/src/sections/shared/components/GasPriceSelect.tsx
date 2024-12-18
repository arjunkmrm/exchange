import { formatNumber, formatDollars } from '@kwenta/sdk/utils'
import { FC, useMemo, memo } from 'react'
import { useTranslation } from 'react-i18next'

import { NO_VALUE } from 'constants/placeholder'
import { SummaryItem, SummaryItemValue, SummaryItemLabel } from 'sections/exchange/summary'
import { selectTransactionFeeWei } from 'state/exchange/selectors'
import { useAppSelector } from 'state/hooks'

type GasPriceSelectProps = {
	className?: string
}

const GasPriceItem: FC = memo(() => {
	const transactionFee = useAppSelector(selectTransactionFeeWei)

	const formattedTransactionFee = useMemo(() => {
		return transactionFee ? formatDollars(transactionFee, { maxDecimals: 1 }) : NO_VALUE
	}, [transactionFee])

	return (
		<span data-testid="gas-price">
			{formattedTransactionFee }
		</span>
	)
})

const GasPriceSelect: FC<GasPriceSelectProps> = memo(({ ...rest }) => {
	const { t } = useTranslation()

	return (
		<SummaryItem {...rest}>
			<SummaryItemLabel>
				{t(`common.summary.gas-prices.gas-price`)}
			</SummaryItemLabel>
			<SummaryItemValue>
				<GasPriceItem />
			</SummaryItemValue>
		</SummaryItem>
	)
})

export default GasPriceSelect
