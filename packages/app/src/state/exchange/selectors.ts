import { createSelector } from "@reduxjs/toolkit";
import { selectNetwork } from "state/app/selectors";
import { RootState } from "state/store";

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