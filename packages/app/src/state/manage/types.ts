import { ThemeName } from 'styles/theme'
import { Language } from 'translations/constants'

export type ListPairState = {
	quoteToken: string
	baseToken: string
}

export type ManageState = {
	listPair: ListPairState
}
