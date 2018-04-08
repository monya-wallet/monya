const {app, BrowserWindow, protocol} = require('electron');
const path = require('path');
const url = require('url');

const protocols=["monacoin","bitzeny","bitcoin","litecoin","fujicoin","bitcoin","bitcoincash","koto","dash","zcash","neetcoin","ripple","nem"]

let mainWindow;
let customURI;

const enableDevTools = true

const singleInstance = app.makeSingleInstance((argv, workingDirectory) => {
  customURI = argv[argv.length-1];
  if (mainWindow) {
    mainWindow.webContents.send('handle-open-url', customURI);
  }
})

if (singleInstance) {
  app.quit()
}

protocols.forEach(d=>{

  app.setAsDefaultProtocolClient(d);
  protocol.registerStandardSchemes([d])
})

const createWindow= () => {
  mainWindow = new BrowserWindow({
    minWidth: 360,
    width:400,
    minHeight:360,
    height: 750,
    devTools:enableDevTools,
    titleBarStyle: 'hidden',
    backgroundColor: '#ffeb47',
    fullscreenable:false
  });

  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }));
  if (enableDevTools) {
    mainWindow.webContents.openDevTools()
  }
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  protocols.forEach(pr=>{
  protocol.registerStringProtocol(pr, function (request, callback) {
    mainWindow.webContents.send('handle-open-url', request.url);
  }, function (err) {
    if (!err) {
      console.log('Registered protocol succesfully');
    }
  });
  })
  customURI = process.argv[ process.argv.length-1];
  if (typeof customURI !== 'undefined' && customURI !== '') {
    mainWindow.webContents.on('did-finish-load', () => {
      mainWindow.webContents.send('handle-open-url', customURI);
    });
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
  if(mainWindow){
    mainWindow.webContents.send('handle-open-url', url);
  }else{
    customURI=url
  }
});
