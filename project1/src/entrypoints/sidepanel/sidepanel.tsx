import '../../assets/tailwind.css'
import React, { useState, useRef, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import ReactMarkdown from 'react-markdown'

const Sidepanel = () => {
	const [input, setInput] = useState('')
	const [response, setResponse] = useState('(Your chat will appear here)')
	const [loading, setLoading] = useState(false)
	const [html, setHtml] = useState('')
	const [error, setError] = useState<string | null>(null)
	const messagesEndRef = useRef<HTMLDivElement>(null)

	type Message = {
		role: 'user' | 'assistant'
		content: string
		timestamp?: Date
	}

	const [messages, setMessages] = useState<Message[]>([])

	// Auto-scroll to bottom when new messages arrive
	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
	}

	useEffect(() => {
		scrollToBottom()
	}, [messages])

	const getPageContent = async (): Promise<{
		html: string
		text: string
	}> => {
		return new Promise(resolve => {
			const timeout = setTimeout(() => {
				resolve({ html: '', text: '' })
			}, 3000) // 3 second timeout

			browser.tabs.query({ active: true, currentWindow: true }, tabs => {
				if (tabs[0]?.id) {
					browser.tabs.sendMessage(
						tabs[0].id,
						{ type: 'GET_HTML' },
						response => {
							clearTimeout(timeout)
							if (browser.runtime.lastError) {
								console.error(
									'Error:',
									browser.runtime.lastError.message
								)
								resolve({ html: '', text: '' })
								return
							}
							resolve({
								html: response?.html || '',
								text: response?.text || '',
							})
						}
					)
				} else {
					clearTimeout(timeout)
					resolve({ html: '', text: '' })
					console.log('DID NOT RECIEVE')
				}
			})
		})
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!input.trim()) return

		setLoading(true)
		setError(null)

		const newMessage: Message = {
			role: 'user',
			content: input,
			timestamp: new Date(),
		}
		const updatedMessages: Message[] = [...messages, newMessage]
		setMessages(updatedMessages)

		try {
			// Get page content with timeout
			const pageContent = await getPageContent()
			setHtml(pageContent.html)

			// Prepare the request payload
			const requestPayload = {
				question:
					input +
					"Try to keep it concise unless asked to elaborate in the previous text, P.S: The Chat will be displayed in a Sidebar & Don't mention about the last sentence",
				pageContent: pageContent.text, // Use text content for better AI processing
				pageHtml: pageContent.html, // Include HTML if needed by your backend
			}

			const controller = new AbortController()
			const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

			const res = await fetch('http://localhost:8000/ask', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(requestPayload),
				signal: controller.signal,
			})

			clearTimeout(timeoutId)

			if (!res.ok) {
				throw new Error(`HTTP error! status: ${res.status}`)
			}

			const data = await res.json()
			console.log('data received')

			setResponse(data.answer || 'No answer received.')
			setMessages([
				...updatedMessages,
				{
					role: 'assistant',
					content: data.answer,
					timestamp: new Date(),
				},
			])
		} catch (err) {
			const errorMessage =
				err instanceof Error ? err.message : 'Error fetching response.'
			setError(errorMessage)
			setResponse('Error fetching response.')

			// Add error message to chat
			setMessages([
				...updatedMessages,
				{
					role: 'assistant',
					content: `Sorry, I encountered an error: ${errorMessage}`,
					timestamp: new Date(),
				},
			])
		} finally {
			setLoading(false)
			setInput('')
		}
	}

	const clearChat = () => {
		setMessages([])
		setError(null)
		setResponse('(Your chat will appear here)')
	}

	return (
		<>
			<div className='flex-1 flex flex-col justify-center items-center px-4 pb-28 mt-4'>
				<div className='max-w-md w-full'>
					<div
						id='header'
						className='shadow-sm bg-gray-300 p-4 rounded-lg mb-4'
					>
						<h1 className='text-2xl font-bold text-center'>
							ASK AI ANYTHING
						</h1>
						<div className='flex justify-center gap-2 text-xs text-gray-400'>
							<span>Powered by Gemini Flash</span>
							<span>•</span>
							<a href='#' className='hover:underline'>
								Help
							</a>
						</div>
					</div>
					<p className='text-gray-600 m-2'>
						Type your question below. You can also search or ask
						about content on the current page!
					</p>

					{/* Error Display */}
					{error && (
						<div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4'>
							<strong>Error:</strong> {error}
						</div>
					)}

					{/* Chat Messages Container */}
					<div
						className='bg-white rounded-lg shadow p-4 min-h-[120px] mb-4'
						style={{ maxHeight: '400px', overflowY: 'auto' }}
					>
						{messages.length === 0 ? (
							<span className='text-gray-400'>
								{loading
									? 'Loading...'
									: '(Your chat will appear here)'}
							</span>
						) : (
							<div className='space-y-3'>
								{messages.map((msg, idx) => (
									<div
										key={idx}
										className={`flex ${
											msg.role === 'user'
												? 'justify-end'
												: 'justify-start'
										}`}
									>
										<div
											className={`max-w-[80%] rounded-lg px-3 py-2 ${
												msg.role === 'user'
													? 'bg-blue-500 text-white'
													: 'bg-gray-100 text-gray-800'
											}`}
										>
											{msg.role === 'assistant' ? (
												<div className='text-sm'>
													<ReactMarkdown>
														{msg.content}
													</ReactMarkdown>
												</div>
											) : (
												<span className='text-sm'>
													{msg.content}
												</span>
											)}
											{msg.timestamp && (
												<div
													className={`text-xs mt-1 ${
														msg.role === 'user'
															? 'text-blue-100'
															: 'text-gray-500'
													}`}
												>
													{msg.timestamp.toLocaleTimeString()}
												</div>
											)}
										</div>
									</div>
								))}
								{loading && (
									<div className='flex justify-start'>
										<div className='bg-gray-100 text-gray-800 rounded-lg px-3 py-2'>
											<span className='text-sm'>
												Thinking...
											</span>
										</div>
									</div>
								)}
								<div ref={messagesEndRef} />
							</div>
						)}
					</div>

					{/* Clear Chat Button */}
					{messages.length > 0 && (
						<div className='flex justify-center mb-4'>
							<button
								onClick={clearChat}
								className='text-sm text-gray-500 hover:text-gray-700 underline'
							>
								Clear Chat
							</button>
						</div>
					)}
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
					className='bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded-full transition disabled:opacity-50'
					disabled={loading || !input.trim()}
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
