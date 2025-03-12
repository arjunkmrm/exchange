import { ethers } from 'ethers'

import Context, { IContext } from './context'
import ExchangeService from './services/exchange'
import ManageService from './services/manage'
import PricesService from './services/prices'
import TransactionsService from './services/transactions'
import WalletService from './services/wallet'

export default class BitlySDK {
	public context: Context

	public exchange: ExchangeService
	public transactions: TransactionsService
	public prices: PricesService
	public wallet: WalletService
	public manage: ManageService

	constructor(context: IContext) {
		this.context = new Context(context)
		this.manage = new ManageService(this)
		this.exchange = new ExchangeService(this)
		this.prices = new PricesService(this)
		this.transactions = new TransactionsService(this)
		this.wallet = new WalletService(this)
	}

	public async setProvider(provider: ethers.providers.Provider) {
		console.log("ww: setProvider: ", provider)
		const networkId = await this.context.setProvider(provider)
		if (this.exchange) {
			const marketName = this.exchange.getMarketName()
			await this.exchange.setMarketName(marketName, true)
		}
		return networkId
	}

	public setSigner(signer: ethers.Signer) {
		return this.context.setSigner(signer)
	}
}
