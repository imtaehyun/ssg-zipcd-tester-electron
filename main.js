'use strict';

const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const ipcMain = require('electron').ipcMain;

const webdriverio = require('webdriverio');
const options = {
    desiredCapabilities: {
        browserName: 'phantomjs'
    }
}

electron.crashReporter.start();

let mainWindow;

app.on('ready', () => {
    mainWindow = new BrowserWindow({
      width: 1000,
      height: 600,
      'min-width': 500,
      'min-height': 200,
      'accept-first-mouse': true,
      'title-bar-style': 'hidden'
    });

    // and load the index.html of the app.
  mainWindow.loadURL('file://' + __dirname + '/index.html');

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
})

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

let addrList = [];
ipcMain.on('test-start', function(event, arg) {
    var idx = arg.idx;
    var addrStr = arg.addr;

    var addr = addrStr.split(' ');
    var sdNm = addr[0];
    var sggNm = addr[1];
    var roadNmAddr = '';
    for (var i=2; i < addr.length; i++) {
        if (addr[i].endsWith("읍")  || addr[i].endsWith("면")  || addr[i].endsWith("동")) {
            continue;
        }
        if (addr[i].endsWith("구")) {
            sggNm += ' ' + addr[i];
            continue;
        }
        roadNmAddr += addr[i] + " ";
    }

    test({idx: idx, sdNm: sdNm, sggNm: sggNm, roadNmAddr: roadNmAddr});
});

function test(addr) {
    console.log('test start: ' + addr);

    const client = webdriverio.remote(options);
    client
        .init()
        .url('https://member.ssg.com/addr/popup/zipcd.ssg')
        .selectByVisibleText('select[name="sdNm"]', addr.sdNm)
        .selectByVisibleText('select[name="sggNm"]', addr.sggNm)
        .setValue('#roadNmAddrQuery', addr.roadNmAddr)
        .click('#address_street .btn.small.slightly2 span')
        .waitForVisible('#address_street div.section.searchResult', 5000)
        .saveScreenshot('./snapshot.png')
        .getText('#address_street div.section.searchResult table table tbody')
        .then(function (text) {
            mainWindow.webContents.send('test-result', {idx:addr.idx, addr: text})
            console.log(text);
        })
        .end();
}
