export default defineContentScript({
	matches: ['<all_urls>'],
	main() {
		console.log('[Content Script] Loaded')
		setTimeout(() => {
			const shadowHost = document.querySelector('custom-element')
			const shadowRoot = shadowHost?.shadowRoot
			const content = shadowRoot?.querySelector('some-tag')?.innerText
		}, 5000)
		// const pageHTML = document.documentElement.outerHTML
		// const pageText = document.body.innerText

		// console.log(pageText)
		// console.log(pageHTML)
		// document.body.style.border = '5px dashed orange'
		if (window.top !== window) {
			console.warn('⚠️ Running inside an iframe:', window.location.href)
		}

		console.log('Hello content.')
	},
})
