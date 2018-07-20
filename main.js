const {app, BrowserWindow, ipcMain} = require('electron')
const path = require('path')
const url = require('url')
const pug = require('electron-pug')({pretty: true});
const net = require('net');


let openPorts = [];
let verbose = false;
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;
let contents;
let complete = 0;
let portsMax = 0;
function createWindow() {
    // Create the browser window.
    win = new BrowserWindow({width: 800, height: 600});

    // and load the index.pug of the app.
    win.loadURL(`file://${__dirname}/index.pug`);
    contents = win.webContents;
    // Open the DevTools.
    // win.webContents.openDevTools()

    // Emitted when the window is closed.
    win.on('closed', () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        win = null
    });
}

app.on('ready', createWindow);

ipcMain.on('do-scan', (event, args) => {
    clearInstanceVars();
    let {host, portto, portfrom} = args;
    portsRemain = portsMax = portto - portfrom;
    testPort(host, portfrom, portto);

});


async function testPort(host, port, portto) {
    if (port > portto){
        openPorts.forEach(function(a){
            console.log("Port " + a + " was open.");
        });
        console.log('scan complete');

        return;
    }
    let sock = net.Socket();
    sock.setTimeout(6000);

    let connect = sock.connect(port, host, (event, args) => {
        let portconnected = sock.remotePort;
        addPortToList(portconnected);
        connect.destroy();
    });
    connect.on('end', () => {
        if (verbose) console.log('port ' + port + ' remote closed the connection');
    });
    connect.on('error', () => {
        if (verbose) console.log('port ' + port + ' appears to be closed');
    });

    sock.on('timeout', () => {
        sock.end();
    });

    let percent = ((complete * 100) / portsMax).toFixed(2);
    console.log(percent + '% | Total Ports: ' + portsMax + " Remaining: " + portsRemain + " Complete: " + complete);
    updateProgress(percent);

    await sleep(20);
    port++;
    complete++;
    testPort(host, port, portto);
}

function addPortToList(port) {
    console.log('Port ' + port + " appears to be open");

    openPorts.push(port);

    let args = {
        index: openPorts.length,
        port: port
    }

    contents.send('port-found', args);

}

function updateProgress(percent) {
    let args = {
        percent: percent
    };
    contents.send('update-progress', args);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function clearInstanceVars(){
    openPorts = [];
    complete = 0;
    portsMax = 0;
}