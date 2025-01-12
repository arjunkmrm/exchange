import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { ManageState } from './types'

export const MANAGE_INITIAL_STATE: ManageState = {
	listPair: {
		quoteToken: '',
		baseToken: '',
	},
}

const manageSlice = createSlice({
	name: 'manage',
	initialState: MANAGE_INITIAL_STATE,
	reducers: {
		setBaseToken: (state, action: PayloadAction<string>) => {
			state.listPair.baseToken = action.payload
		},
		setQuoteToken: (state, action: PayloadAction<string>) => {
			state.listPair.quoteToken = action.payload
		},
	},
})

export const { 
	setBaseToken,
	setQuoteToken,
} = manageSlice.actions

export default manageSlice.reducer
