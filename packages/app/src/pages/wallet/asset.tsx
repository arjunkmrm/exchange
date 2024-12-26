import Head from 'next/head'
import { useRouter } from 'next/router'
import React, { FC, ReactNode, useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { FlexDivCol } from 'components/layout/flex'
import DashboardLayout from 'sections/dashboard/DashboardLayout'
import media from 'styles/media'
import { TokenInfo } from 'sections/asset/TokenInfo'
import DepositWithdraw from 'sections/asset/DepositWithdraw'
import ROUTES from 'constants/routes'
import { selectTokens } from 'state/exchange/selectors'
import { useAppSelector } from 'state/hooks'

type StakingComponent = FC & { getLayout: (page: ReactNode) => JSX.Element }

const StakingPage: StakingComponent = () => {
	const { t } = useTranslation()
	const router = useRouter()
	const tokensInfo = useAppSelector(selectTokens)
	
	const asset = useMemo(() => {
		if (tokensInfo.length == 0 || !router.query.address) {
			return;
		}

		const token = tokensInfo.find(e=>e.address===router.query.address)
		if (token === undefined) {
			router.push(ROUTES.NotFound.Home)
		} else {
			return token
		}
	}, [router, tokensInfo])

	return (
		<>
			<Head>
				<title>{t('wallet.asset.title')}</title>
			</Head>
			<TokenInfoContainer>
				<TokenInfo 
					name = {asset?.name ?? ''}
					symbol = {asset?.symbol ?? ''}
					logo = {asset?.logo ?? ''}
					address = {asset?.address ?? ''}
					description = {asset?.description ?? ''}
				/>
				<DepositWithdraw 
					address={asset?.address ?? ''}
					symbol={asset?.symbol ?? ''}
				/>
			</TokenInfoContainer>
		</>
	)
}

const StakingV1Container = styled(FlexDivCol)`
	margin-top: 20px;
	row-gap: 30px;
	${media.lessThan('lg')`
		padding: 0 15px;
		margin-top: 15px;
		row-gap: 25px;
	`}
`

const TokenInfoContainer = styled.div`
	${media.lessThan('lg')`
		padding: 0px 15px;
	`}
	margin-top: 20px;
`

StakingPage.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>

export default StakingPage
