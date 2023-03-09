const EventEmitter = require('events')
const peer = new EventEmitter()
const {ipcRenderer} = require('electron')
const remote = window.require('@electron/remote')

const {desktopCapturer} = remote

async function getScreenStream() {
    const sources = await desktopCapturer.getSources({types: ['window', 'screen']})
    console.log("-> sources", sources);

    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: false,
            video: {
                mandatory: {
                    chromeMediaSource: 'desktop',
                    chromeMediaSourceId: sources[0].id,
                    maxWidth: window.screen.width,
                    maxHeight: window.screen.height
                }
            }
        })
        console.log("-> stream", stream);
        peer.emit('add-stream', stream)

    } catch (e) {
        console.log("-> e", e);

    }
}

getScreenStream()

peer.on('robot', (type, data) => {
    console.log('robot', type, data)
    if(type === 'mouse') {
        data.screen = {
            width: window.screen.width,
            height: window.screen.height
        }
    }
    setTimeout(() => {
    ipcRenderer.send('robot', type, data)
    }, 2000)

})

module.exports = peer
