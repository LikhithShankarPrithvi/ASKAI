import { CONTENT_SCRIPT_MATCHES } from '@/utils/matches'
const contentMatch = new MatchPattern(CONTENT_SCRIPT_MATCHES)

export default defineBackground(() => {
	  browser.runtime.onMessage.addListener((message, sender) => {
		console.log("message")
	    if (message.action === 'openSidePanel' && sender.tab?.id) {
	      browser.sidePanel.open({ tabId: sender.tab.id });
	    }
	    return false;
	  })

	console.log('Background sript loaded')
	;(browser.action ?? browser.browserAction).onClicked.addListener(
		async tab => {
			if (tab.id && tab.url && contentMatch.includes(tab.url)) {
				const res = await browser.scripting.executeScript({
					target: { tabId: tab.id },
					files: ['/content-scripts/content.js'],
				})
				console.log('result', res)
			}
		}
	)
})
