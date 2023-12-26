const os = require('os');

function getAddr() {
  const interfaces = os.networkInterfaces()
  let addr = {}
  for (const i in interfaces) {
    for (const j in interfaces[i]) {
      const address = interfaces[i][j]
      if (address.family === 'IPv4' && !address.internal) {
        addr = address
        break
      }
    }
  }
  return addr
}

module.exports = { getAddr }
