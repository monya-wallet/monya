const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

const path = require('path');
const url = require('url');

let mainWindow;

const singleInstance = app.makeSingleInstance((argv, workingDirectory) => {
  if (process.platform == 'win32' || process.platform === 'linux') {
    customURI = argv.slice(1)
  }
  if (mainWindow) {
    mainWindow.webContents.executeJavaScript(`window.handleOpenURL('${customURI}');`);
  }
})

if (singleInstance) {
  app.quit()
}

app.setAsDefaultProtocolClient('monacoin');

app.on('ready', () => {
  mainWindow = new BrowserWindow({
    width: 360,
    height: 600
  });

  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }));

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  if (process.platform == 'win32' || process.platform === 'linux') {
    customURI = process.argv.slice(1)
    if (typeof customURI !== 'undefined' && customURI !== '') {
      mainWindow.webContents.executeJavaScript(`window.handleOpenURL('${customURI}');`);
    }
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin')  app.quit();
});

app.on('activate', () => {
  if (mainWindow === null)  createWindow();
});

app.on('open-url', (event, url) => {
  mainWindow.webContents.executeJavaScript(`window.handleOpenURL('${url}');`);
});
