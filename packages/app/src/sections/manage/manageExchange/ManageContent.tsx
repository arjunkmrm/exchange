import { memo, useCallback } from 'react'

import { DesktopOnlyView, MobileOrTabletView } from 'components/Media'
import { PageContent } from 'styles/common'
import MarketList from './MarketList'
import MarketInfoModal from './MarketInfoModal'
import { selectShowModal } from 'state/app/selectors'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import { setOpenModal } from 'state/app/reducer'

const ManageContent = memo(() => {
	const dispatch = useAppDispatch()
	const openModal = useAppSelector(selectShowModal)
	const closeModal = useCallback(() => {
		dispatch(setOpenModal({type: null}))
	}, [dispatch])

	return (
		<PageContent>
			<DesktopOnlyView>
				<MarketList />
				{openModal?.type === 'custom-market-info' && 
					<MarketInfoModal 
						marketName={openModal?.params?.['marketName']} 
						onDismiss={closeModal} 
					/>
				}
			</DesktopOnlyView>
			<MobileOrTabletView>
				<MarketList mobile />
				{openModal?.type === 'custom-market-info' && 
				<MarketInfoModal 
					marketName={openModal?.params?.['marketName']} 
					onDismiss={closeModal} 
					mobile
				/>
			}
			</MobileOrTabletView>
		</PageContent>
	)
})

export default ManageContent
