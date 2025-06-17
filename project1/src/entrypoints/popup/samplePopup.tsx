import React, { FC } from 'react'

const POPUP_WIDTH = 360
const POPUP_HEIGHT = 600

const SamplePopup: FC = () => (
	<div
		className={`bg-[#f9f9f9] w-[${POPUP_WIDTH}px] h-[${POPUP_HEIGHT}px] flex flex-col p-3`}
		style={{ fontFamily: "'Georgia', serif", boxSizing: 'border-box' }}
	>
		<main className='flex-grow max-w-full w-full overflow-y-auto'>
			<section className='bg-[#ffffff] rounded-lg p-4 mb-4 flex flex-col items-center space-y-2 shadow-sm'>
				<h1 className='text-gray-900 text-lg mb-2 font-semibold'>
					Welcome to AmazeWeb
				</h1>
			</section>

			<section className='text-gray-700 max-w-full mx-auto'>
				<h2 className='text-gray-900 font-semibold text-sm mb-1'>
					Gemini 2.5 Flash
				</h2>
				<form
					className='bg-[#ffffff] rounded-lg p-2 flex items-center gap-2 max-w-full shadow-sm'
					onSubmit={e => e.preventDefault()}
				>
					<input
						aria-label='Type your prompt here'
						className='flex-grow bg-transparent placeholder-gray-400 text-gray-700 text-xs focus:outline-none'
						placeholder='Type your prompt here'
						type='text'
					/>
					<button
						aria-label='Send'
						className='p-2 rounded-full bg-gray-400 hover:bg-gray-500 transition text-white'
						type='submit'
					>
						SEND
					</button>
				</form>
			</section>
		</main>
	</div>
)

export default SamplePopup
