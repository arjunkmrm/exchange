import { RootState } from 'state/store'

export const selectBaseToken = (state: RootState) => state.manage.listPair.baseToken

export const selectQuoteToken = (state: RootState) => state.manage.listPair.quoteToken

export const selectCustomMarkets = (state: RootState) => state.manage.customMarkets

export const selectCustomMarketsStatus = (state: RootState) => state.manage.queryStatuses.customMarkets

export const selectAllTokens = (state: RootState) => state.manage.allTokens

export const selectAllTokensStatus = (state: RootState) => state.manage.queryStatuses.allTokens

export const selectCreateMarketStatus = (state: RootState) => state.manage.writeStatuses.createMarket

export const selectAddPairToMarketStatus = (state: RootState) => state.manage.writeStatuses.addPairToMarket