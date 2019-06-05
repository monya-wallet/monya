chrome.browserAction.onClicked.addListener(function() {
	createData = new Object();
	createData.url = chrome.extension.getURL('index.html');
	createData.type = "popup";
	createData.width = 400;
	createData.height = 700;
	chrome.windows.create(createData);
});
