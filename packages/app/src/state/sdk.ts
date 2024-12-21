import BitlySDK from '@bitly/sdk'

import { wagmiClient } from 'containers/Connector/config'
import logError from 'utils/logError'

const sdk = new BitlySDK({ networkId: 17069, provider: wagmiClient.provider, logError })

export default sdk
