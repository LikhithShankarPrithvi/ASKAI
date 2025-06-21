import React from 'react'

const ContentPage: React.FC = () => {
	const handleClick = () => {
		browser.runtime
			.sendMessage({ action: 'openSidePanel' })
			.catch(console.error)
		// For testing, you can use:
		// alert('Side panel requested!')
	}

	return (
		<button className='bg-blue-600' onClick={handleClick}>
			<span>ASK AI</span>
		</button>
	)
}

export default ContentPage
