import { TransactionStatusData } from '@bitly/sdk/types'
import { toast } from 'react-toastify'

import {
	NotificationSuccess,
	NotificationPending,
	NotificationError,
} from 'components/TransactionNotification'
import { blockExplorer } from 'containers/Connector/Connector'
import sdk from 'state/sdk'
import { ethers } from 'ethers'

export const monitorTransaction = async ({
	transaction,
	onTxSent,
	onTxConfirmed,
	onTxFailed,
}: {
	transaction: () => Promise<ethers.ContractTransaction>
	onTxSent?: () => void
	onTxConfirmed?: () => void
	onTxFailed?: (failureMessage: TransactionStatusData) => void
}) => {
	let txHash = ''
	try {
		txHash = (await transaction()).hash
	} catch (e) {
		const options = {
			containerId: 'notifications',
			autoClose: 5000,
		}
		toast(<NotificationError failureReason={e.reason} />, options)
		if (onTxFailed != null) {
			onTxFailed({ transactionHash: '', failureReason: e.reason })
		}
		return
	}
	const link = blockExplorer.txLink?.(txHash)

	const toastProps = {
		onClick: () => window.open(link, '_blank'),
		containerId: 'notifications',
	}
	const emitter = sdk.transactions.hash(txHash)
	emitter.on('txSent', () => {
		toast(<NotificationPending />, { ...toastProps, toastId: txHash })
		if (onTxSent != null) {
			onTxSent()
		}
	})
	emitter.on('txConfirmed', ({ transactionHash }) => {
		toast.update(transactionHash, {
			...toastProps,
			render: <NotificationSuccess />,
			autoClose: 10000,
		})
		if (onTxConfirmed != null) {
			onTxConfirmed()
		}
	})
	emitter.on('txFailed', ({ transactionHash, failureReason }) => {
		toast.update(transactionHash, {
			...toastProps,
			render: <NotificationError failureReason={failureReason} />,
		})
		if (onTxFailed != null) {
			onTxFailed({ transactionHash, failureReason })
		}
	})
}
