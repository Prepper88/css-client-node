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
      this.socket = io('http://localhost:3000') // Replace with your server URL

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
        // Add incoming messages to the chat
        this.messages.push({
          content: data.content,
          sender: data.sender,
          time: new Date().toLocaleTimeString(),
        })
        // Scroll to the bottom
        this.$nextTick(() => {
          const chatWindow = this.$el.querySelector('.chat-window')
          chatWindow.scrollTop = chatWindow.scrollHeight
        })
      })
    },
    // Send message
    sendMessage() {
      if (this.inputMessage.trim() === '') return
      // Send message through Socket.IO
      this.socket.emit('send-message', {
        from: this.customerId,
        sessionId: this.sessionId,
        message: this.inputMessage,
      }) // Add the message to the local chat
      this.messages.push({
        content: this.inputMessage,
        sender: 'customer',
        time: new Date().toLocaleTimeString(),
      })
      this.inputMessage = ''
      // Scroll to the bottom
      this.$nextTick(() => {
        const chatWindow = this.$el.querySelector('.chat-window')
        chatWindow.scrollTop = chatWindow.scrollHeight
      })
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
  padding: 20px;
  padding-bottom: 200px; /* Space for the input area */
  min-height: 100vh;
  box-sizing: border-box;
  position: relative;
  max-width: 600px; /* Limit overall width */
  margin: 0 auto; /* Center the container */
}

/* Chat Area */
.chat-window {
  width: 100%;
  height: calc(100vh - 240px); /* Subtract input area height and padding */
  overflow-y: auto;
  border: 1px solid #ebeef5;
  padding: 10px;
  margin-bottom: 10px;
}

.message {
  margin-bottom: 10px;
  display: flex;
  flex-direction: column;
}

.message-content {
  padding: 8px;
  border-radius: 4px;
  max-width: 70%;
  word-wrap: break-word; /* Prevent long messages from breaking layout */
  white-space: pre-wrap; /* Preserve multi-line format */
}

.message-time {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

/* Messages sent by the customer */
.customer .message-content {
  background-color: #409eff;
  color: white;
  margin-left: auto; /* Align to the right */
}

/* Messages sent by the agent */
.agent .message-content {
  background-color: #f0f0f0;
  color: #333;
  margin-right: auto; /* Align to the left */
}

/* Input Area */
.input-area {
  position: fixed;
  bottom: 20px; /* Fixed at the bottom with some spacing */
  left: 0;
  right: 0;
  background: white;
  padding: 20px;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: flex-end;
  gap: 10px;
  max-width: 600px; /* Match the width of the chat area */
  margin: 0 auto; /* Center the input area */
}

.chat-input :deep(.el-textarea__inner) {
  border-radius: 8px; /* Rounded corners */
  padding: 10px;
  line-height: 1.5;
  font-size: 14px;
  resize: none; /* Disable manual resizing */
  overflow-y: auto; /* Show scrollbar when exceeding max height */
  padding-right: 60px; /* Space for the send button */
}

/* Send Button */
.send-button {
  position: absolute;
  right: 30px;
  bottom: 30px;
  height: 40px;
  width: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%; /* Circular button */
}
</style>
