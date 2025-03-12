import BitlySDK from '@bitly/sdk'
import { DEFAULT_NETWORK_ID } from 'constants/defaults'

import { wagmiClient } from 'containers/Connector/config'
import logError from 'utils/logError'

// Read networkId from localStorage
const storedNetworkId = typeof window !== 'undefined' ? window.localStorage.getItem('networkId') : null;
const networkId = storedNetworkId ? parseInt(storedNetworkId, 10) : DEFAULT_NETWORK_ID;
const sdk = new BitlySDK({ networkId, provider: wagmiClient.provider, logError })

export default sdk
