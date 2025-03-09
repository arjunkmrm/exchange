import BitlySDK from '..';
import { 
	AllowanceType,
    BalanceType,
	TokenInfoType,
} from '../types/exchange';
import { 
    BankReadContracts, 
    BankWriteContract, 
    ERC20ReadContracts, 
    ERC20WriteContract, 
} from '../utils/contract';
import { BANK_ADDRESS_INVALID } from '../common/errors';
import { ADDRESSES } from '../constants';
import { calcBlockHeight, toPlainAmount, toRealAmount } from '../utils';
import { AllowancesType, BalancesType } from '../types/wallet';
import { ContractTransaction } from 'ethers';

export default class WalletService {
    private sdk: BitlySDK

    constructor(sdk: BitlySDK) {
        this.sdk = sdk
    }

    public async withdraw(token: string, amount: number): Promise<ContractTransaction> {
		const tokensInfo = this.sdk.exchange.getTokensInfo([token]);
		const plainAmount = toPlainAmount(amount, tokensInfo.find(e=>e.address===token)?.decimals);
        return await BankWriteContract(this.sdk, 'withdraw', [token, plainAmount]);
    }

    public async deposit(token: string, amount: number): Promise<ContractTransaction> {
		const tokensInfo = this.sdk.exchange.getTokensInfo([token]);
		const plainAmount = toPlainAmount(amount, tokensInfo.find(e=>e.address===token)?.decimals);
        return await BankWriteContract(this.sdk, 'deposit', [token, plainAmount]);
    }

    public async approve(token: string, amount: number): Promise<ContractTransaction> {
        const spender = ADDRESSES.BANK[(this.sdk.context.networkId).toString()];
        if (!spender) {
            throw new Error(BANK_ADDRESS_INVALID);
        }
		const tokensInfo = this.sdk.exchange.getTokensInfo([token]);
		const plainAmount = toPlainAmount(amount, tokensInfo.find(e=>e.address===token)?.decimals);
        return await ERC20WriteContract(this.sdk, token, 'approve', [spender, plainAmount]);
    }

    public async balancesInWallet(tokens: string[], relativeTimeInSec: number = 0): Promise<BalancesType> {
		const balances: BalancesType = {};
		try {
			const ret: BalanceType[] = await ERC20ReadContracts(
				this.sdk, 
				tokens, 
				['balanceOf'], 
				[[this.sdk.context.walletAddress]],
				{blockTag: await calcBlockHeight(relativeTimeInSec, this.sdk.context.provider)}
			);

			const tokensInfo = this.sdk.exchange.getTokensInfo([]);
			for (let i = 0; i < ret.length; i++) {
				const balance = ret[i];
				const tokenAddress = tokens[i];
				balances[tokenAddress] = 
					toRealAmount(balance, tokensInfo.filter(e=>e.address==tokenAddress)[0]?.decimals);
			}
		} catch (e) {}
		
		return balances;
    }

	public async allowance(tokens: string[], relativeTimeInSec: number = 0): Promise<AllowancesType> {
		const allowances: AllowancesType = {};
		try {
			const ret: AllowanceType[] = await ERC20ReadContracts(
				this.sdk, 
				tokens, 
				['allowance'], 
				[[this.sdk.context.walletAddress, ADDRESSES['BANK'][(this.sdk.context.networkId).toString()]]],
				{blockTag: await calcBlockHeight(relativeTimeInSec, this.sdk.context.provider)}
			);

			const tokensInfo = this.sdk.exchange.getTokensInfo([]);
			for (let i = 0; i < ret.length; i++) {
				const allowance = ret[i];
				const tokenAddress = tokens[i];
				allowances[tokenAddress] = 
					toRealAmount(allowance, tokensInfo.filter(e=>e.address==tokenAddress)[0]?.decimals);
			}
		} catch (e) {}
		
		return allowances;
    }

    public async balancesInBank(tokens: string[], relativeTimeInSec: number = 0): Promise<BalancesType> {
        const balances: BalancesType = {};
		try {
			const ret: BalanceType[] = await BankReadContracts(
				this.sdk, 
				['balances'], 
				tokens.map(e=>([this.sdk.context.walletAddress, e])),
				{blockTag: await calcBlockHeight(relativeTimeInSec, this.sdk.context.provider)}
			);

			const tokensInfo = this.sdk.exchange.getTokensInfo([]);
			for (let i = 0; i < ret.length; i++) {
				const balance = ret[i];
				const tokenAddress = tokens[i];
				balances[tokenAddress] = 
					toRealAmount(balance, tokensInfo.filter(e=>e.address==tokenAddress)[0]?.decimals);
			}
		} catch (e) {}
		
		return balances;
    }

	public async getTokenInfo(tokens: string[]): Promise<Partial<TokenInfoType>[]> {
		const infos: Partial<TokenInfoType>[] = [];
		try {
			const ret: any[] = await ERC20ReadContracts(
				this.sdk, 
				tokens, 
				['symbol', 'name', 'decimals']
			);

			const tokenNum = tokens.length;
			let retIdx = 0;
			for (let tokenIdx = 0; tokenIdx < tokenNum; tokenIdx++) {
				const symbol = ret[retIdx++];
				const name = ret[retIdx++];
				const decimals = ret[retIdx++];
				infos.push({ symbol, name, decimals });
			}
		} catch (e) {}
		
		return infos;
    }

    // Private methods

    
}
