import '../../assets/tailwind.css'
import React, { useState, useRef, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import ReactMarkdown from 'react-markdown'
import {
	PaperAirplaneIcon,
	UserCircleIcon,
	SparklesIcon,
} from '@heroicons/react/24/solid'

const HEADER_HEIGHT = 80
const DESC_HEIGHT = 48
const CLEAR_HEIGHT = 40
const INPUT_HEIGHT = 64
const PANEL_PADDING = 16

const Sidepanel = () => {
	const [input, setInput] = useState('')
	const [response, setResponse] = useState('(Your chat will appear here)')
	const [loading, setLoading] = useState(false)
	const [html, setHtml] = useState('')
	const [error, setError] = useState<string | null>(null)
	const [chatSummary, setChatSummary] = useState('')
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
			const N = 6 // Number of recent messages to send
			const recentMessages = updatedMessages.slice(-N).map(m => ({
				role: m.role,
				content: m.content,
			}))
			const requestPayload = {
				summary: chatSummary,
				recentMessages,
				question:
					input +
					" Try to keep it concise unless asked to elaborate in the previous text, P.S: The Chat will be displayed in a Sidebar & Don't mention about the last sentence",
				pageContent: pageContent.text,
				pageHtml: pageContent.html,
			}

			const controller = new AbortController()
			const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

			const res = await fetch('https://askai-dfup.onrender.com/ask', {
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
			if (data.summary !== undefined) {
				setChatSummary(data.summary)
			}
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
		setChatSummary('')
	}

	return (
		<>
			<div
				className='flex flex-col h-screen bg-gradient-to-br from-blue-50 to-white'
				style={{ minHeight: '100vh', padding: `${PANEL_PADDING}px` }}
			>
				{/* Header */}
				<div
					id='header'
					className='shadow-lg bg-gradient-to-r from-blue-500 to-blue-700 rounded-2xl flex flex-col items-center justify-center mb-2'
					style={{ height: HEADER_HEIGHT }}
				>
					<div className='flex items-center gap-2 mb-1'>
						<SparklesIcon className='h-7 w-7 text-white drop-shadow' />
						<h1 className='text-2xl font-extrabold text-white tracking-tight'>
							Falcon – AI Assistant
						</h1>
					</div>
					<div className='flex justify-center gap-2 text-xs text-blue-100'>
						<span>Powered by Gemini Flash</span>
						<span>•</span>
						<a href='#' className='hover:underline'>
							Help
						</a>
					</div>
				</div>

				{/* Description */}
				<div
					className='flex items-center justify-center text-gray-600 text-center mb-2 bg-white/70 rounded-xl shadow-sm'
					style={{ height: DESC_HEIGHT }}
				>
					<p className='w-full'>
						Type your question below. You can also search or ask
						about content on the current page!
					</p>
				</div>

				{/* Error Display */}
				{error && (
					<div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-2 animate-fade-in'>
						<strong>Error:</strong> {error}
					</div>
				)}

				{/* Chat Messages Container */}
				<div className='flex-1 flex flex-col bg-white/80 rounded-2xl shadow-md border border-blue-100 backdrop-blur-sm mb-2 overflow-hidden'>
					<div
						className='flex-1 overflow-y-auto p-4 space-y-3'
						style={{ minHeight: 0 }}
					>
						{messages.length === 0 ? (
							<span className='text-gray-400'>
								{loading
									? 'Loading...'
									: '(Your chat will appear here)'}
							</span>
						) : (
							<>
								{messages.map((msg, idx) => (
									<div
										key={idx}
										className={`flex items-end ${
											msg.role === 'user'
												? 'justify-end'
												: 'justify-start'
										} animate-fade-in`}
									>
										{msg.role === 'assistant' && (
											<UserCircleIcon className='h-6 w-6 text-blue-400 mr-2 mb-1' />
										)}
										<div
											className={`max-w-[80%] rounded-2xl px-4 py-2 shadow transition-all duration-200 ${
												msg.role === 'user'
													? 'bg-blue-500 text-white rounded-br-none'
													: 'bg-gray-100 text-gray-800 rounded-bl-none border border-blue-100'
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
									<div className='flex justify-start animate-pulse'>
										<div className='bg-gray-100 text-gray-800 rounded-2xl px-4 py-2'>
											<span className='text-sm'>
												Thinking...
											</span>
										</div>
									</div>
								)}
								<div ref={messagesEndRef} />
							</>
						)}
					</div>
				</div>

				{/* Clear Chat Button */}
				<div
					className='flex items-center justify-center'
					style={{ height: CLEAR_HEIGHT }}
				>
					{messages.length > 0 && (
						<button
							onClick={clearChat}
							className='text-sm text-blue-400 hover:text-blue-600 underline transition-colors duration-150'
						>
							Clear Chat
						</button>
					)}
				</div>

				{/* Input Form */}
				<form
					className='w-full bg-white/90 border-t border-blue-100 px-4 py-3 flex items-center gap-2 shadow-lg backdrop-blur rounded-xl'
					style={{ height: INPUT_HEIGHT }}
					onSubmit={handleSubmit}
				>
					<input
						type='text'
						placeholder='Type your question...'
						className='flex-1 rounded-full border border-blue-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/80 shadow-sm transition-all duration-150'
						value={input}
						onChange={e => setInput(e.target.value)}
						disabled={loading}
					/>
					<button
						type='submit'
						className='bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded-full transition disabled:opacity-50 flex items-center gap-1 shadow-md focus:ring-2 focus:ring-blue-300 focus:outline-none'
						disabled={loading || !input.trim()}
					>
						{loading ? (
							<span>Sending...</span>
						) : (
							<>
								<span>Send</span>
								<PaperAirplaneIcon className='h-5 w-5 ml-1 -rotate-45' />
							</>
						)}
					</button>
				</form>
			</div>
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
