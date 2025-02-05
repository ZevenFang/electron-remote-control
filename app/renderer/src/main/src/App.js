import React, {useState, useEffect} from 'react';
import './App.css';
import {ipcRenderer} from 'electron'
import './peer-puppet'
const remote = window.require('@electron/remote')

const {Menu, MenuItem} = remote

function App() {
  const [remoteCode, setRemoteCode] = useState('');
  const [localCode, setLocalCode] = useState('');
  // 0未连接，1已控制，2被控制
  const [controlText, setControlText] = useState('');
  const [remoteCodes, setRemoteCodes] = useState([]);

  const startControl = (remoteCode) => {
    ipcRenderer.send('control', remoteCode)
  }
  const login = async () => {
    let code = await ipcRenderer.invoke('login')
    setLocalCode(code)
  }

  const handleControlState = (e, name, type) => {
    let text = ''
    if(type === 1) {
      text = `正在远程控制${name}`
    } else if(type === 2) {
      text = `被${name}控制中`
    } else if(type === 3) {
      setLocalCode(name)
    } else if(type === 4) {
      text = '重新连接服务器中...'
    } else {
      text = ''
    }
    setControlText(text)
  }

  const handleBroadcastCodes = (e, codes) => {
    setRemoteCodes(codes)
  }

  useEffect(() => {
    login()
    ipcRenderer.on('control-state-change', handleControlState)
    ipcRenderer.on('broadcast-codes', handleBroadcastCodes)
    return () => {
      ipcRenderer.removeListener('control-state-change', handleControlState);
      ipcRenderer.removeListener('broadcast-codes', handleBroadcastCodes);
    }
    // eslint-disable-next-line
  }, [])

  const handleContextMenu = (e) => {
    e.preventDefault()
    const menu = new Menu()
    menu.append(new MenuItem({label: '复制', role: 'copy'}))
    menu.popup()
  }
  return (
      <div className="App">
        {
          controlText === '' ? <>
            <div>你的控制码 <span onContextMenu={(e) => handleContextMenu(e)} >{localCode}</span></div>
            <input type="text" value={remoteCode} onChange={(e) => setRemoteCode(e.target.value)}/>
            <button onClick={() => {startControl(remoteCode)}}>确认</button>
            <div style={{color: 'red', marginTop: '10px'}}>已入侵设备：</div>
            {remoteCodes.filter(v => v.code !== localCode).map((item, index) => (
              <div style={{color: 'red', marginTop: '10px'}} key={index}>
                <span>{item.mac}</span>
                <span style={{margin: '0 20px'}}>{item.code}</span>
                <button onClick={() => {setRemoteCode(item.code)}}>选择</button>
              </div>
            ))}
          </> :
          <div>
            {controlText}<br/>
            <button onClick={() => setControlText('')}>取消控制</button>
          </div>
        }
      </div>
  );
}

export default App;
