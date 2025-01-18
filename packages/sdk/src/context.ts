import { EventEmitter } from 'events'

import { Provider as EthCallProvider } from 'ethcall'
import { ethers } from 'ethers'
import { TypedDataSigner } from '@ethersproject/abstract-signer'

import * as sdkErrors from './common/errors'
import {
	ContractsMap,
	MulticallContractsMap,
	getContractsByNetwork,
	getMulticallContractsByNetwork,
} from './contracts'
import { UnwrapPromise } from './common/type'
import { DEFAULT_NETWORK_ID } from './constants'

export interface IContext {
	provider: ethers.providers.Provider
	networkId: number
	signer?: ethers.Signer & TypedDataSigner
	walletAddress?: string
	logError?: (err: Error, skipReport?: boolean) => void
}

const DEFAULT_CONTEXT: Partial<IContext> = {
	networkId: DEFAULT_NETWORK_ID,
}

export default class Context implements IContext {
	private context: IContext
	public multicallProvider: EthCallProvider
	public contracts: UnwrapPromise<ContractsMap>
	public multicallContracts: UnwrapPromise<MulticallContractsMap>
	public events = new EventEmitter().setMaxListeners(100)

	constructor(context: IContext) {
		this.context = { ...DEFAULT_CONTEXT, ...context }
		this.multicallProvider = new EthCallProvider(context.networkId, context.provider);
        this.contracts = getContractsByNetwork(context.networkId, context.provider);
        this.multicallContracts = getMulticallContractsByNetwork(context.networkId);

		if (context.signer) {
			this.setSigner(context.signer)
		}
	}

	get networkId() {
		return this.context.networkId
	}

	get provider() {
		return this.context.provider
	}

	get signer() {
		if (!this.context.signer) {
			throw new Error(sdkErrors.NO_SIGNER)
		}

		return this.context.signer
	}

	get walletAddress() {
		if (!this.context.walletAddress) {
			throw new Error(sdkErrors.NO_SIGNER)
		}

		return this.context.walletAddress
	}

	public async setProvider(provider: ethers.providers.Provider) {
		this.context.provider = provider
		const networkId = (await provider.getNetwork()).chainId;
		this.setNetworkId(networkId);

		return networkId
	}

	public setNetworkId(networkId: number) {
		this.context.networkId = networkId
		this.multicallProvider = new EthCallProvider(networkId, this.provider)
		this.contracts = getContractsByNetwork(networkId, this.provider)
		this.multicallContracts = getMulticallContractsByNetwork(networkId)
		this.events.emit('network_changed', { networkId: networkId })
	}

	public async setSigner(signer: ethers.Signer) {
		this.context.walletAddress = await signer.getAddress()
		this.context.signer = signer as ethers.Signer & TypedDataSigner
	}

	public logError(err: Error, skipReport = false) {
		return this.context.logError?.(err, skipReport)
	}
}
