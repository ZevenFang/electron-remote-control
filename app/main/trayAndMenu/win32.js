const { app, Menu, Tray  } = require('electron')
const path = require('path')
const {show: showMainWindow} = require('../windows/main')
const {create: createAboutWindow}= require('../windows/about')

let tray;
app.whenReady().then(() => {
    tray = new Tray(path.resolve(__dirname, './icon_win32.png'))
    const contextMenu = Menu.buildFromTemplate([
        { label: '控制台', click: showMainWindow},
        { label: '关于', click: createAboutWindow},
        { type: 'separator' },
        { label: '退出', click: () => {app.quit()}}
    ])
    tray.setContextMenu(contextMenu)
    menu = Menu.buildFromTemplate([])
    app.applicationMenu = menu;
})
