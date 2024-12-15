import { BigNumber } from '@ethersproject/bignumber';
import BitlySDK from '..';
import { 
    BalanceType,
} from '../types/exchange';
import { 
    BankReadContracts, 
    BankWriteContract, 
    ERC20ReadContracts, 
    ERC20WriteContract, 
    ExchangeReadContracts 
} from '../utils/contract';
import { BANK_ADDRESS_INVALID } from '../common/errors';
import { ADDRESSES } from '../constants';

export default class WalletService {
    private sdk: BitlySDK

    constructor(sdk: BitlySDK) {
        this.sdk = sdk
    }

    public async withdraw(token: string, amount: BigNumber) {
        return await BankWriteContract(this.sdk, 'withdraw', [token, amount]);
    }

    public async deposit(token: string, amount: BigNumber) {
        return await BankWriteContract(this.sdk, 'deposit', [token, amount]);
    }

    public async approve(token: string, amount: BigNumber) {
        const spender = ADDRESSES.BANK[this.sdk.context.networkId];
        if (!spender) {
            throw new Error(BANK_ADDRESS_INVALID);
        }
        return await ERC20WriteContract(this.sdk, token, 'approve', [spender, amount]);
    }

    public async balancesInWallet(tokens: string[]): Promise<BalanceType[]> {
        return await ERC20ReadContracts(this.sdk, tokens, ['balanceOf'], [[this.sdk.context.walletAddress]]);
    }

    public async balancesInBank(tokens: string[]) {
        return await BankReadContracts(
            this.sdk, 
            ['balances'], 
            tokens.map(e=>([this.sdk.context.walletAddress, tokens]))
        );
    }

    // Private methods

    
}
