const express = require('express')
const http = require('http')
const axios = require('axios')
const cors = require('cors')
const qs = require('qs')
const { Server } = require('socket.io')
const path = require('path')

const app = express()
// TODO: remove in the future
app.use(cors())
app.use(express.json())
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})

// 提供静态文件（Vue 前端）
app.use(express.static(path.join(__dirname, '../client/dist')))

// 存储用户和坐席的 Socket 连接
const customers = new Map() // key: customerId, value: socket

const JAVA_END_URL_PREFIX = 'http://localhost:8080'
// 用户登录
io.on('connection', (socket) => {
  console.log('a user connected:', socket.id)

  // bind customerId with socket and initial session
  socket.on('customer-inbound', async (customerId) => {
    // bind customerId with socket
    customers.set(customerId, socket)
    console.log('bind customerId: ' + customerId)

    // find session, if not exist active session, create a session
    console.log('load session, customerId:' + customerId)
    const response = await loadSession(customerId)
    console.log('session loaded, session:' + response.data)
    socket.emit('session-assigned', response.data)

    //assignAgentToCustomer(customerId)
  })

  // 消息转发
  socket.on('send-message', async (msg) => {
    await sendMessage(msg)
  })

  // 断开连接
  socket.on('disconnect', () => {
    console.log('user disconnected:', socket.id)
    // 清理用户和坐席的连接
    for (const [customerId, customerSocket] of customers) {
      if (customerSocket.id === socket.id) {
        customers.delete(customerId)
        break
      }
    }
  })
})

// Load session
async function loadSession(customerId) {
  const url = JAVA_END_URL_PREFIX + '/api/session/loadOrCreate?customerId=' + customerId

  const response = await axios.post(url, null, {
    headers: {
      'Content-Type': 'application/json', // 设置请求头
    },
  })

  return response
}

// send message
async function sendMessage(msg) {
  const data = msg
  const url = JAVA_END_URL_PREFIX + '/api/message/send'
  const customerId = msg.senderId

  const socket = customers.get(customerId)
  console.log('socket:' + socket)
  if (socket === undefined) {
    error = 'can not find connection for customerId: ' + customerId
    console.dir('send message error: ' + error)
    return
  }
  try {
    const response = await axios.post(url, data, {
      headers: {
        'Content-Type': 'application/json', // 设置请求头
      },
    })
    socket.emit('send-message-result', { code: 0, message: 'success' })
    return response
  } catch (error) {
    console.dir('send message error: ' + error)
    socket.emit('send-message-result', { code: -1, message: error })
  }
}

// HTTP API for pushing messages to customers
app.post('/api/push-message', (req, res) => {
  const msg = req.body

  const customerId = msg.customerId
  console.log('push message: ', msg)

  // Find the socket for the customer
  const socket = customers.get(customerId)
  if (socket) {
    // Send the message to the customer
    socket.emit('message-received', msg)
    res.status(200).json({ success: true, message: 'Message sent to customer' })
  } else {
    res.status(404).json({ success: false, message: 'Customer not connected' })
  }
})

// 分配坐席给用户
function assignAgentToCustomer(customerId) {
  if (agentQueue.length > 0) {
    const agentId = agentQueue.shift()
    const customerSocket = customers.get(customerId)
    const agentSocket = agents.get(agentId)

    if (customerSocket && agentSocket) {
      // 通知用户和坐席
      customerSocket.emit('assigned-agent', agentId)
      agentSocket.emit('assigned-customer', customerId)
    }
  }
}

// 启动服务器
const PORT = 3000
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})
