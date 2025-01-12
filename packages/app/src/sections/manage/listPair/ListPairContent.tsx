import { memo } from 'react'

import { DesktopOnlyView, MobileOrTabletView } from 'components/Media'
import BasicSwap from './BasicSwap'
import ListPairModals from './ListPairModals'
import MobileSwap from './MobileSwap'
import { PageContent } from 'styles/common'

const ListPairContent = memo(() => (
	<PageContent>
		<DesktopOnlyView>
			<BasicSwap />
		</DesktopOnlyView>
		<MobileOrTabletView>
			<MobileSwap />
		</MobileOrTabletView>
		<ListPairModals />
	</PageContent>
))

export default ListPairContent
