import BitlySDK from '@bitly/sdk'
import { DEFAULT_NETWORK_ID } from 'constants/defaults'

import { wagmiClient } from 'containers/Connector/config'
import logError from 'utils/logError'

const sdk = new BitlySDK({ networkId: DEFAULT_NETWORK_ID, provider: wagmiClient.provider, logError })

export default sdk
