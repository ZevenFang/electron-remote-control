const WebSocket = require('ws');
const EventEmitter = require('events');
const signal = new EventEmitter();

let interval = null
function createWS() {
    try {
        const SERVER_IP = 'ws://42.193.142.37'
        const PORT = '8010'
        const ws = new WebSocket(SERVER_IP + ':' + PORT);

        ws.onerror = function (e) {
            console.log('websocket error', e.message)
        }

        ws.on('open', function open() {
            console.log('connect success')
            if (interval) {
                signal.emit('reconnect')
                clearInterval(interval)
            }
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
            signal.emit(data.event, data.data)
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
