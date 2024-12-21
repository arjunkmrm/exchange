import BitlySDK from '@bitly/sdk'
import { combineReducers, configureStore, PreloadedState } from '@reduxjs/toolkit'
import type { AnyAction, ThunkAction } from '@reduxjs/toolkit'
import logger from 'redux-logger'
import {
	persistReducer,
	persistStore,
	FLUSH,
	REHYDRATE,
	PAUSE,
	PERSIST,
	PURGE,
	REGISTER,
} from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import appReducer from './app/reducer'
import preferencesReducer from './preferences/reducer'
import walletReducer from './wallet/reducer'
import pricesReducer from './prices/reducer'
import balancesReducer from './balances/reducer'
import exchangeReducer from './exchange/reducer'
import sdk from './sdk'

const LOG_REDUX = false

const persistConfig = {
	key: 'root',
	storage,
	version: 1,
	blacklist: ['app', 'wallet'],
}

const combinedReducers = combineReducers({
	app: appReducer,
	preferenes: preferencesReducer,
	wallet: walletReducer,
	prices: pricesReducer,
	balances: balancesReducer,
	exchange: exchangeReducer,
})

const persistedReducer = persistReducer(persistConfig, combinedReducers)

export const setupStore = (preloadedState?: PreloadedState<any>) =>
	configureStore({
		reducer: persistedReducer,
		middleware: (getDefaultMiddleware) => {
			const baseMiddleware = getDefaultMiddleware({
				serializableCheck: {
					ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
				},
				thunk: { extraArgument: { sdk } },
			})
			return LOG_REDUX ? baseMiddleware.concat(logger) : baseMiddleware
		},
		preloadedState,
	})

const store = setupStore()

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export type AppStore = typeof store
export type ThunkConfig = {
	dispatch: AppDispatch
	state: RootState
	extra: { sdk: BitlySDK }
}
export type AppThunk<ReturnType = void> = ThunkAction<
	ReturnType,
	RootState,
	{ sdk: BitlySDK },
	AnyAction
>

export const persistor = persistStore(store)
export default store
