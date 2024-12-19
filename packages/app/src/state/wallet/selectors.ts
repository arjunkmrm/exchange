import { createSelector } from '@reduxjs/toolkit'

import { DEFAULT_NETWORK_ID } from 'constants/defaults'
import type { RootState } from 'state/store'

export const selectWallet = (state: RootState) => state.wallet.walletAddress ?? null

export const selectNetwork = (state: RootState) => state.wallet.networkId ?? DEFAULT_NETWORK_ID

export const selectIsWalletConnected = createSelector(
	(state: RootState) => state.wallet.walletAddress,
	(walletAddress) => !!walletAddress
)

