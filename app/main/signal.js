const WebSocket = require('ws');
const EventEmitter = require('events');
const { dialog } = require('electron');
const netaddr = require('./netaddr');

const signal = new EventEmitter();

let interval = null
let pingInterval = null
function createWS() {
    try {
        const SERVER_IP = 'ws://42.193.142.37'
        const PORT = '8010'
        let url = SERVER_IP + ':' + PORT
        const addr = netaddr.getAddr()
        if (addr.mac) {
            url += '?mac=' + addr.mac
        }
        const ws = new WebSocket(url);
        ws.onerror = function (e) {
            console.log('websocket error', e.message)
        }

        ws.on('open', function open() {
            console.log('connect success')
            if (interval) {
                signal.emit('reconnect')
                clearInterval(interval)
            }
            // 心跳包，防止掉线
            clearInterval(pingInterval)
            pingInterval = setInterval(() => {
                send('ping', {txt: 'hello'})
            }, 60000)
        })

        ws.on('close', function open() {
            signal.emit('disconnect')
            clearInterval(interval)
            interval = setInterval(() => {
                console.log('try reconnect')
                createWS()
            }, 5000)
        })

        ws.on('message', function incoming(message) {
            let data = JSON.parse(message)
            try {
                signal.emit(data.event, data.data)
            } catch (e) {
                console.error(e.context.msg)
                if (e.context.msg === 'user not found')
                    dialog.showErrorBox('温馨提示', '控制码不存在')
            }
        })


        function send(event, data) {
            console.log('sended', JSON.stringify({event, data}))
            ws.send(JSON.stringify({event, data}))
        }

        function invoke(event, data, answerEvent) {
            // event = 'login'  data = null
            return new Promise((resolve, reject) => {
                send(event, data)
                // answerEvent  = 'logined '
                signal.once(answerEvent, resolve)
                setTimeout(() => {
                    reject('timeout')
                }, 5000)
            })
        }
        signal.send = send
        signal.invoke = invoke
    } catch (e) {
        console.error(e)
    }
}

createWS()

module.exports = signal
