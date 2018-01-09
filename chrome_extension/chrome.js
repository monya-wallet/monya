chrome.browserAction.onClicked.addListener(function() {
	createData = new Object();
	createData.url = chrome.extension.getURL('index.html');
	createData.type = "popup";
	createData.width = 768;
	createData.height = 543;
	chrome.windows.create(createData);
});
