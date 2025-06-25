import { defineConfig, type WxtViteConfig } from 'wxt'
// import tailwindcss from '@tailwindcss/vite'
import { CONTENT_SCRIPT_MATCHES } from './src/utils/matches'

// See https://wxt.dev/api/config.html
export default defineConfig({
	srcDir: 'src',
	manifest: {
		permissions: ['activeTab', 'scripting', 'sidePanel'],
		action: {},
		host_permissions: ['https://askai-dfup.onrender.com/'],
		web_accessible_resources: [
			// Since the content script isn't listed in the manifest, we have to
			// manually allow the CSS file to load.
			{
				resources: ['/content-scripts/content.css'],
				matches: [CONTENT_SCRIPT_MATCHES],
			},
		],
	},
})

// import { defineConfig, type WxtViteConfig } from 'wxt';

// export default defineConfig({

// });
