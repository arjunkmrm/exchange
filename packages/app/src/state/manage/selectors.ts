import { RootState } from 'state/store'

export const selectBaseToken = (state: RootState) => state.manage.listPair.baseToken

export const selectQuoteToken = (state: RootState) => state.manage.listPair.quoteToken