import { memo } from 'react'

import { DesktopOnlyView, MobileOrTabletView } from 'components/Media'
import { PageContent } from 'styles/common'
import MarketList from './MarketList'

const ManageContent = memo(() => (
	<PageContent>
		<DesktopOnlyView>
			<MarketList />
		</DesktopOnlyView>
		<MobileOrTabletView>
			<MarketList mobile />
		</MobileOrTabletView>
		{/* <ListPairModals /> */}
	</PageContent>
))

export default ManageContent
