import '../../assets/tailwind.css'
import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'

const Sidepanel = () => {
	const [input, setInput] = useState('')
	const [response, setResponse] = useState('(Your chat will appear here)')
	const [loading, setLoading] = useState(false)

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!input.trim()) return
		setLoading(true)
		try {
			const res = await fetch('http://localhost:8000/ask', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ question: input }),
			})
			const data = await res.json()
			setResponse(data.answer || 'No answer received.')
		} catch (err) {
			setResponse('Error fetching response.')
		}
		setLoading(false)
		setInput('')
	}

	return (
		<>
			<div className='flex-1 flex flex-col justify-center items-center px-4 pb-28'>
				<div className='max-w-md w-full text-center'>
					<h1 className='text-2xl font-bold mb-2'>
						ASK AI anything...
					</h1>
					<p className='text-gray-600 mb-6'>
						Type your question below. You can also search or ask
						about content on the current page!
					</p>
					<div className='bg-white rounded-lg shadow p-4 min-h-[120px] flex flex-col items-center justify-center mb-4'>
						<span className='text-gray-400'>
							{loading ? 'Loading...' : response}
						</span>
					</div>
					<div className='flex justify-center gap-2 text-xs text-gray-400'>
						<span>Powered by Merlin AI</span>
						<span>•</span>
						<a href='#' className='hover:underline'>
							Help
						</a>
					</div>
				</div>
			</div>
			<form
				className='fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 px-4 py-3 flex items-center gap-2'
				style={{ zIndex: 10 }}
				onSubmit={handleSubmit}
			>
				<input
					type='text'
					placeholder='Type your question...'
					className='flex-1 rounded-full border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400'
					value={input}
					onChange={e => setInput(e.target.value)}
					disabled={loading}
				/>
				<button
					type='submit'
					className='bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded-full transition'
					disabled={loading}
				>
					{loading ? 'Sending...' : 'Send'}
				</button>
			</form>
		</>
	)
}

// const root = document.querySelector('#sidepanel-root')
// console.log(document.getElementById('sidepanel-root'))
ReactDOM.createRoot(document.getElementById('sidepanel-root')!).render(
	<React.StrictMode>
		<Sidepanel />
	</React.StrictMode>
)
