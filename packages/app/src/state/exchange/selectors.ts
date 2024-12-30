import { createSelector } from "@reduxjs/toolkit";
import { selectNetwork } from "state/app/selectors";
import { RootState } from "state/store";
import { FetchStatus } from "state/types";

export const selectMarkets = createSelector(
	selectNetwork,
	(state: RootState) => state.exchange.markets,
	(network, markets) => {
		return markets[network] ?? []
	}
)

export const selectMarketVolumes = createSelector(
	selectNetwork,
	(state: RootState) => state.exchange.dailyMarketVolumes,
	(network, dailyMarketVolumes) => {
		return dailyMarketVolumes[network] ?? []
	}
)

export const selectTokens = createSelector(
	selectNetwork,
	(state: RootState) => state.exchange.tokensMap,
	(network, tokens) => {
		return tokens[network] ?? []
	}
)

export const selectOpenOrders = createSelector(
	selectNetwork,
	(state: RootState) => state.exchange.openOrders,
	(network, openOrders) => {
		return openOrders[network] ?? []
	}
)

export const selectCurrentMarketAsset = (state: RootState) => state.exchange.selectedMarketAsset

export const selectCurrentMarketInfo = createSelector(
	selectMarkets,
	selectCurrentMarketAsset,
	(markets, pairAddress) => {
		return markets.find(e=>e.marketAddress == pairAddress)
	}
)

export const selectOrderType = (state: RootState) => state.exchange.orderType

export const selectOrderDirection = (state: RootState) => state.exchange.orderDirection

export const selectMarketsQueryStatus = (state: RootState) => state.exchange.queryStatuses.markets

export const selectOrderPrice = (state: RootState) => state.exchange.orderPrice	

export const selectOrderSize = (state: RootState) => state.exchange.orderSize

export const selectSlippage = (state: RootState) => state.exchange.slippage

export const selectMakeOrderFinished = (state: RootState) => state.exchange.writeStatuses.makeOrder !== FetchStatus.Loading