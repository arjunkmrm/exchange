import { ADDRESSES } from '@bitly/sdk/constants'
import { DefaultTheme } from 'styled-components'

import { chain } from 'containers/Connector/config'

export const DEFAULT_WIDTH = 360
export const DEFAULT_MOBILE_WIDTH = 180
export const SOCKET_SOURCE_TOKEN_ADDRESS =
	ADDRESSES.SUSD[chain.mainnet.id] || '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
export const SOCKET_DEST_TOKEN_ADDRESS = ADDRESSES.SUSD[chain.optimism.id]
