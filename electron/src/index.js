const {app, BrowserWindow} = require('electron');
const path = require('path');
const url = require('url');

let mainWindow;
let customURI;

const singleInstance = app.makeSingleInstance((argv, workingDirectory) => {
  if (process.platform == 'win32' || process.platform === 'linux') {
    customURI = argv.slice(1);
  }
  if (mainWindow) {
    mainWindow.webContents.send('handle-open-url', customURI);
  }
})

if (singleInstance) {
  app.quit()
}

["monacoin","bitzeny","bitcoin","litecoin","fujicoin","bitcoin","bitcoincash","koto","dash","zcash","neetcoin","ripple","nem"].forEach(d=>{

  app.setAsDefaultProtocolClient(d);
})

const createWindow= () => {
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
    customURI = process.argv.slice(1);
    if (typeof customURI !== 'undefined' && customURI !== '') {
      mainWindow.webContents.on('did-finish-load', () => {
        mainWindow.webContents.send('handle-open-url', customURI);
      });
    }
  }
}

app.on('ready',createWindow);

app.on('window-all-closed', () => {
  app.quit();
});

app.on('activate', () => {
  if (mainWindow === null)  createWindow();
});

app.on('open-url', (event, url) => {
  mainWindow.webContents.send('handle-open-url', url);
});
