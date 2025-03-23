<template>
  <div class="chat-container">
    <!-- Chat Area -->
    <div class="chat-window">
      <div v-for="(msg, index) in messages" :key="index" class="message" :class="msg.sender">
        <div class="message-content">
          <pre>{{ msg.content }}</pre>
          <!-- Use pre tag to preserve multi-line format -->
        </div>
        <div class="message-time">
          {{ msg.time }}
        </div>
      </div>
    </div>

    <!-- Input Area -->
    <div class="input-area">
      <el-input
        v-model="inputMessage"
        placeholder="Type a message"
        @keydown.enter="handleKeydown"
        type="textarea"
        :autosize="{ minRows: 4, maxRows: 15 }"
        resize="none"
        class="chat-input"
      />
      <el-button type="primary" class="send-button" @click="sendMessage">
        <el-icon><ArrowUp /></el-icon>
      </el-button>
    </div>
  </div>
</template>

<script>
import { ArrowUp } from '@element-plus/icons-vue'
import io from 'socket.io-client'

export default {
  props: {
    customerId: {
      type: Number,
      required: true, // customerId is a required prop
    },
  },
  data() {
    return {
      messages: [], // Store chat messages
      inputMessage: '', // Store the current input message
      sessionId: null, // Store the session ID
      socket: null, // Socket instance
    }
  },
  mounted() {
    this.initializeSocket()
  },
  methods: {
    // Initialize socket and send customer-inbound event
    initializeSocket() {
      // Connect to the Socket.IO server
      this.socket = io('http://localhost:3000')

      this.socket.on('connect_error', (error) => {
        console.error('Connection error:', error.message)
        this.addMessage(error, 'system', 'error')
      })

      // Send customer-inbound event with customerId
      this.socket.emit('customer-inbound', this.customerId)

      // Listen for session-created event
      this.socket.on('session-created', (sessionId) => {
        // Save the session ID when received
        this.sessionId = sessionId
        console.log('Session created with ID:', this.sessionId)
      })

      // Listen for incoming messages
      this.socket.on('message', (data) => {
        this.addMessage(data.message, data.senderName, 'message')
      })

      this.socket.on('send-message-result', (result) => {
        console.log('send-message-result:' + JSON.stringify(result))
        if (result.code == 0) {
          // Add the message to the local chat
          this.addMessage(this.inputMessage, 'customer', 'message')
          // clear input box
          this.inputMessage = ''
        } else {
          console.error('Failed to send message:', result.message)
          // Push error message to the chat
          this.addMessage(result.message, 'system', 'error')
        }
      })

      // Listen for system messages
      this.socket.on('system-message', (data) => {
        this.addMessage(data.content, 'system', data.type)
      })
    },
    addMessage(content, sender, type = 'message') {
      this.messages.push({
        content,
        sender,
        type,
        time: new Date().toLocaleTimeString(),
      })
      // Scroll to the bottom
      this.$nextTick(() => {
        const chatWindow = this.$el.querySelector('.chat-window')
        if (chatWindow) chatWindow.scrollTop = chatWindow.scrollHeight
      })
    },
    // Send message
    sendMessage() {
      if (this.inputMessage.trim() === '') return
      try {
        // Send message through Socket.IO
        this.socket.emit('send-message', {
          from: this.customerId,
          sessionId: this.sessionId,
          message: this.inputMessage,
        })
      } catch (error) {
        console.error('Failed to send message:', error)
        // Push error message to the chat
        this.addMessage('Failed to send message. Please try again.', 'system', 'error')
      }
    },
    // Handle keyboard events
    handleKeydown(event) {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault() // Prevent default line break behavior
        this.sendMessage()
      }
      // Allow line break with Shift + Enter
    },
  },
  components: {
    ArrowUp,
  },
}
</script>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding: 20px;
  box-sizing: border-box;
}

/* Chat Area */
.chat-window {
  flex: 1;
  overflow-y: auto;
  border: 1px solid #ebeef5;
  padding: 10px;
  margin-bottom: 10px;
}

.message {
  margin-bottom: 10px;
  display: flex;
  flex-direction: column;
  align-items: center; /* Center system messages */
}

.message-content {
  padding: 8px;
  border-radius: 4px;
  max-width: 70%;
  word-wrap: break-word;
  white-space: pre-wrap;
  text-align: center; /* Center text for system messages */
}

.message-time {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

/* Messages sent by the agent (客服) */
.agent .message-content {
  background-color: #409eff;
  color: white;
  margin-left: auto; /* 居右 */
}

/* Messages sent by the customer (用户) */
.customer .message-content {
  background-color: #f0f0f0;
  color: #333;
  margin-right: auto; /* 居左 */
}

/* System messages */
.system.info .message-content {
  background-color: #e6f7ff;
  color: #1890ff;
  font-size: 12px; /* Smaller font size */
}

.system.warn .message-content {
  background-color: #fffbe6;
  color: #faad14;
  font-size: 12px; /* Smaller font size */
}

.system.error .message-content {
  background-color: #fff1f0;
  color: #ff4d4f;
  font-size: 12px; /* Smaller font size */
}

/* Input Area */
.input-area {
  display: flex;
  align-items: flex-end;
  gap: 10px;
}

.chat-input :deep(.el-textarea__inner) {
  border-radius: 8px;
  padding: 10px;
  line-height: 1.5;
  font-size: 14px;
  resize: none;
  overflow-y: auto;
  padding-right: 60px;
}

.send-button {
  position: absolute;
  right: 30px;
  bottom: 30px;
  height: 40px;
  width: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}
</style>
