<template>
  <div class="chat-wrapper">
    <!-- Top Navigation Bar -->
    <div class="top-bar">
      <div class="logo">Customer Support</div>
      <div class="user-info">
        <span>{{ currentUser?.username }}</span>
      </div>
    </div>

    <!-- Info Box -->
    <div class="info-box">
      <p><strong>You are now connected with support.</strong> Please describe your issue below.</p>
    </div>

    <!-- Chat Messages -->
    <div class="chat-history" ref="messageContainer">
      <ChatMessage
        v-for="(msg, index) in messages"
        :key="index"
        :senderType="msg.senderType"
        :senderName="msg.senderName || msg.senderType"
        :message="msg.message"
      />
    </div>
    <ChatInput v-model="inputMessage" @send="sendMessage" />
  </div>
</template>

<script>
import { io } from 'socket.io-client'
import ChatMessage from '@/components/ChatMessage.vue'
import ChatInput from '@/components/ChatInput.vue'
import axios from 'axios'

export default {
  name: 'Chat',
  components: { ChatMessage, ChatInput },
  data() {
    return {
      inputMessage: '',
      messages: [],
      socket: null,
      sessionId: null,
      currentUser: null,
    }
  },
  mounted() {
    this.currentUser = JSON.parse(localStorage.getItem('customer'))
    this.socket = io('http://localhost:3000')

    if (this.currentUser) {
      this.socket.emit('customer-inbound', this.currentUser.id)

      this.socket.on('session-assigned', (session) => {
        this.sessionId = session.sessionId
        this.messages = session.messages
      })

      this.socket.on('message-received', (msg) => {
        console.log('receive message: ', msg)
        this.messages.push(msg)
      })
    }

    window.addEventListener('beforeunload', () => {
      this.socket?.disconnect()
    })
  },
  methods: {
    sendMessage() {
      if (!this.inputMessage.trim() || !this.sessionId) return

      const msg = {
        sessionId: this.sessionId,
        senderId: this.currentUser.id,
        senderType: 'customer',
        message: this.inputMessage,
      }

      this.socket.emit('send-message', msg)
      this.messages.push(msg)
      this.inputMessage = ''

      this.$nextTick(() => {
        const container = this.$refs.messageContainer
        if (container) {
          container.scrollTop = container.scrollHeight
        }
      })
    },
  },
}
</script>

<style scoped>
.chat-wrapper {
  max-width: 720px;
  margin: 0 auto;
  padding: 0 24px 24px;
  background: #f9f9f9;
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #ffffff;
  padding: 12px 24px;
  border-bottom: 1px solid #ddd;
  font-size: 16px;
}

.user-info {
  color: #333;
  font-weight: 500;
}

.logo {
  font-weight: bold;
  color: #007bff;
}

.info-box {
  background: #ffffff;
  padding: 12px 16px;
  margin-top: 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  text-align: center;
  color: #333;
  font-size: 14px;
}

.chat-history {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  overflow-y: auto;
  padding: 16px 8px;
  margin-top: 12px;
}

.chat-bubble {
  padding: 10px 14px;
  border-radius: 8px;
  margin: 6px 0;
  word-wrap: break-word;
}

.user-msg {
  background-color: #dcf8c6;
  align-self: flex-end;
  max-width: 60%;
  margin-left: auto;
  text-align: right;
}

.agent-msg {
  background-color: #e8f0fe;
  align-self: flex-start;
  margin-right: auto;
}

.robot-msg {
  background-color: #f3f3f3;
  align-self: flex-start;
  margin-right: auto;
}

.system-msg {
  background-color: #fff4e5;
  font-size: 13px;
  text-align: center;
  margin: 10px auto;
}

.chat-input-area {
  display: flex;
  gap: 12px;
  padding: 12px 0;
  border-top: 1px solid #e0e0e0;
}

.chat-input-area input {
  flex: 1;
  padding: 10px 14px;
  border-radius: 6px;
  border: 1px solid #ccc;
}

.chat-input-area button {
  background-color: #007bff;
  color: white;
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.chat-input-area button:hover {
  background-color: #0069d9;
}
</style>
