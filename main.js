'use strict';

const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const ipcMain = require('electron').ipcMain;
const Tester = require('./tester.js');

electron.crashReporter.start();

let mainWindow;

app.on('ready', () => {
    mainWindow = new BrowserWindow({
        // frame: false,
      width: 1280,
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

ipcMain.on('zipcd-test-start', function(event, args) {
    let tester = new Tester(args.testZone);
    tester.test(args.addrStr);
});
