import dynamic from 'next/dynamic'
import Head from 'next/head'
import { FC, useCallback, useLayoutEffect } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import Earning from 'sections/homepage/Earning'
import Features from 'sections/homepage/Features'
import Hero from 'sections/homepage/Hero'
import TradeNow from 'sections/homepage/TradeNow'
import HomeLayout from 'sections/shared/Layout/HomeLayout'
import media from 'styles/media'
import Script from 'next/script'

type AppLayoutProps = {
	children: React.ReactNode
}

type HomePageComponent = FC & { layout?: FC<AppLayoutProps> }

const GA = () => {
	return (
		<>
			<Script
				strategy="afterInteractive"
				src="https://www.googletagmanager.com/gtag/js?id=G-DZN0CJ60CB"
			/>
			<Script id="google-analytics" strategy="afterInteractive">
				{`
					window.dataLayer = window.dataLayer || [];
					function gtag(){dataLayer.push(arguments);}
					gtag('js', new Date());
					gtag('config', 'G-DZN0CJ60CB');
				`}
			</Script>
		</>
	)
}

const HomePage: HomePageComponent = () => {
	const { t } = useTranslation()

	return (
		<>
			<Head>
				<title>{t('homepage.page-title')}</title>
			</Head>
			<GA />
			<HomeLayout>
				<Container>
					<Hero />
					<Earning />
					<Features />
					<TradeNow />
				</Container>
			</HomeLayout>
		</>
	)
}

export const Container = styled.div`
	width: 100%;
	margin: 0 auto;
	padding: 100px 20px 0 20px;
	${media.lessThan('sm')`
		padding: 50px 15px 0 15px;
	`}
`

export default HomePage
