import { TransactionStatus } from '@bitly/sdk/types'
import { ethers } from 'ethers'

import { AppDispatch } from 'state/store'

import { updateTransactionHash, updateTransactionStatus } from './reducer'

export const monitorAndAwaitTransaction = async (
	dispatch: AppDispatch,
	tx: ethers.providers.TransactionResponse
) => {
	dispatch(updateTransactionHash(tx.hash))
	await tx.wait()
	dispatch(updateTransactionStatus(TransactionStatus.Confirmed))
}
