/* eslint-disable */
/* prettier-ignore */
/* @ts-nocheck */

const http = require('http')

const PORT = 5005

const setCORSHeaders = (res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
}

const server = http.createServer((req, res) => {
  setCORSHeaders(res)

  if (req.method === 'OPTIONS') {
    // Handle preflight request
    res.writeHead(204)
    res.end()
    return
  }

  if (req.method === 'POST' && req.url === '/ping') {
    let body = ''
    req.on('data', (chunk) => {
      body += chunk
    })
    req.on('end', () => {
      try {
        const data = JSON.parse(body)
        console.log('Received ping:', data)
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ status: 'ok', received: data }))
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ status: 'error', error: err.message }))
      }
    })
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ status: 'not found' }))
  }
})

server.listen(PORT, () => {
  console.log(`Ping server running on port ${PORT}`)
})
