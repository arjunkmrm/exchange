import { ethers } from 'ethers'

import Context, { IContext } from './context'
import ExchangeService from './services/exchange'
import PricesService from './services/prices'
import TransactionsService from './services/transactions'

export default class BitlySDK {
	public context: Context

	public exchange: ExchangeService
	public transactions: TransactionsService
	public prices: PricesService

	constructor(context: IContext) {
		this.context = new Context(context)
		this.exchange = new ExchangeService(this)
		this.prices = new PricesService(this)
		this.transactions = new TransactionsService(this)
	}

	public setProvider(provider: ethers.providers.Provider) {
		return this.context.setProvider(provider)
	}

	public setSigner(signer: ethers.Signer) {
		return this.context.setSigner(signer)
	}
}
