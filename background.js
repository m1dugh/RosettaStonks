


chrome.webRequest.onBeforeRequest.addListener((details) => {
	console.log(details);
}, {urls: ["*://*.google.com/*"]}, [])

