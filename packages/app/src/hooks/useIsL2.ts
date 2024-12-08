import { notNill } from '@kwenta/sdk/utils'
import { useMemo } from 'react'

import Connector from 'containers/Connector'
import { chain } from 'containers/Connector/config'

const useIsL2 = () => {
	const { activeChain } = Connector.useContainer()
	const isL2 = false;
	return isL2
}

export default useIsL2
