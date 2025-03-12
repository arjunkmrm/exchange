import { Period } from '@bitly/sdk/constants'
import { TransactionStatus, GasPrice } from '@bitly/sdk/types'
import { QueryStatus } from 'state/types'

export type ModalType =
	| 'futures_deposit_withdraw_smart_margin'
	| 'futures_deposit_withdraw_cross_margin'
	| 'futures_confirm_smart_margin_trade'
	| 'futures_confirm_cross_margin_trade'
	| 'futures_withdraw_keeper_balance'
	| 'futures_smart_margin_onboard'
	| 'futures_cross_margin_onboard'
	| 'futures_smart_margin_socket'
	| 'referrals_create_referral_code'
	| 'referrals_mint_boost_nft'
	| 'transfer_escrow_entries'
	| 'vest_escrow_entries'
	| 'base-select' 
	| 'quote-select'
	| 'custom-market-info'
	| 'select-blockchain'
	| null

export type FuturesPositionModalType =
	| 'smart_margin_close_position'
	| 'cross_margin_close_position'
	| 'futures_edit_position_margin'
	| 'futures_edit_position_size'
	| 'futures_edit_stop_loss_take_profit'

export type GasSpeed = 'average' | 'fast' | 'fastest'

export type Transaction = {
	type: string
	status: TransactionStatus
	error?: string
	hash: string | null
}

export type AppQueryStatuses = {
	marketName: QueryStatus,
}


export type AppState = {
	showModal?: { type: ModalType; params?: Record<string, any> }
	gasSpeed: GasSpeed
	gasPrice: GasPrice<string>
	synthetixOnMaintenance: boolean
	acknowledgedOrdersWarning: boolean
	showBanner: boolean
	marketName?: string
	selectedPortfolioTimeframe: Period
	queryStatuses: AppQueryStatuses
	tradePanelDrawerOpen: boolean
	showOrderbook: boolean
}
