import { FC, memo } from 'react'

import { Body } from 'components/Text'

const GitHashID: FC = memo(() => {
	const gitID = process.env.GIT_HASH_ID!.toString()

	return (
        <a>
			<Body color="secondary" style={{ textAlign: 'center' }}>
				{gitID}
			</Body>
		</a>
	)
})

export default GitHashID
