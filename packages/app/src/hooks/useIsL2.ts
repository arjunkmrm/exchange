import Connector from 'containers/Connector'

const useIsL2 = () => {
	const { activeChain } = Connector.useContainer()
	const isL2 = false
	return isL2
}

export default useIsL2
