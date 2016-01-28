module.exports = (function() {

    'use strict';
    const electron = require('electron');
    const BrowserWindow = electron.BrowserWindow;

    const webdriverio = require('webdriverio');
    const options = { desiredCapabilities: { browserName: 'phantomjs' } };

    class Tester {

        constructor(zone) {
            this.zone = zone;
            this.mainWindow = BrowserWindow.getFocusedWindow();
            this.testUrl = 'http://' + ((zone !== 'prod') ? zone + '-' : '') + 'member.ssg.com/addr/popup/zipcd.ssg';
            console.log('new test initialized: ' + this.zone);
        }

        test(addrStr) {
            let self = this;
            let list = this.analyzeParam(addrStr);

            list.forEach(function(val, idx) {
                const client = webdriverio.remote(options);
                let filename = './output/' + self.zone + '_' + idx + '.png';

                client
                    .init()
                    .url(self.testUrl)
                    .selectByVisibleText('select[name="sdNm"]', val.sdNm)
                    .selectByVisibleText('select[name="sggNm"]', val.sggNm)
                    .setValue('#roadNmAddrQuery', val.roadNmAddr)
                    .click('#address_street .btn.small.slightly2 span')
                    .waitForVisible('#address_street div.section.searchResult', 10000)
                    .saveScreenshot(filename)
                    .getText('#address_street div.section.searchResult table table tbody').then(function (text) {
                        val.result = text;
                        val.filename = filename;
                        self.mainWindow.webContents.send('zipcd-test-end', {idx:idx, result: val});
                    })
                    .on('error', function(e) {
                        self.mainWindow.webContents.send('zipcd-test-end', {idx:idx, result: val});
                    })
                    .end();
            });
        }

        analyzeParam(addrListStr) {
            // 파라미터 분석
            var list = [];
            var addrList = addrListStr.split('\n');

            addrList.forEach(function(addrStr) {
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

                list.push({
                    sdNm: sdNm,
                    sggNm: sggNm,
                    roadNmAddr: roadNmAddr,
                    addrStr: addrStr
                });
            });

            return list;
        }

    }

    return Tester;
})();
