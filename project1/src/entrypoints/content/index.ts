import './style.css'
import { ContentScriptContext } from '#imports'
import ReactDOM from 'react-dom/client'
import React from 'react'
import ContentPage from './contentPage'

export default defineContentScript({
	// Set "registration" to runtime so this file isn't listed in manifest
	registration: 'manifest',
	// Use an empty array for matches to prevent any host_permissions be added
	//  when using `registration: "runtime"`.
	matches: ['<all_urls>'],
	// Put the CSS in the shadow root
	cssInjectionMode: 'ui',

	async main(ctx) {
		console.log('Content script executed!')

		const ui = await createUi(ctx)
		ui.mount()

		// Optionally, return a value to the background
		return 'Its Working'
	},
})

// Message listener for HTML extraction
const messageListener = (message: any, sender: any, sendResponse: any) => {
	if (message.type === 'GET_HTML') {
		try {
			// Get the main content instead of entire HTML for better performance
			const mainContent =
				document.querySelector(
					'main, article, .content, #content, .main'
				) || document.body
			const html = mainContent.innerHTML

			// Clean up the HTML to remove scripts and styles for security
			const tempDiv = document.createElement('div')
			tempDiv.innerHTML = html

			// Remove script and style tags
			const scripts = tempDiv.querySelectorAll('script, style, noscript')
			scripts.forEach(el => el.remove())

			// Get text content for better AI processing
			const textContent = tempDiv.textContent || tempDiv.innerText || ''

			sendResponse({
				html: tempDiv.innerHTML,
				text: textContent.trim().substring(0, 10000), // Limit to 10k chars
			})
		} catch (error) {
			console.error('Error extracting HTML:', error)
			sendResponse({ html: '', text: '' })
		}
	}
	return true // keep the message channel open for async
}

// Add the message listener
browser.runtime.onMessage.addListener(messageListener)

function createUi(ctx: ContentScriptContext) {
	return createShadowRootUi(ctx, {
		name: 'active-tab-ui',
		position: 'inline',
		append: 'before',
		onMount(container) {
			const app = document.createElement('div')
			container.append(app)
			// app.className = 'fixed bottom-6 right-6 z-[9999]'
			app.style.position = 'fixed'
			app.style.right = '20px'
			app.style.bottom = '20px'
			app.style.zIndex = '9999'
			app.style.cursor = 'pointer'
			// app.style.backgroundColor = '#34568B'
			app.style.color = '#FFF'
			// app.style.margin = '24px 24px'
			app.style.padding = '24px 24px'
			// app.style.borderRadius = '4px'
			// app.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)'
			// app.textContent = 'Click Me'
			const root = ReactDOM.createRoot(app)

			root.render(React.createElement(ContentPage))
			return root
		},
		onRemove(root) {
			root?.unmount()
			// Clean up message listener when UI is removed
			browser.runtime.onMessage.removeListener(messageListener)
		},
	})
}
