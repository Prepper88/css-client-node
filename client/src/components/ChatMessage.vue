<template>
  <div
    v-if="messageType === 'text' || messageType === 'system-notice'"
    :class="['message', senderTypeClass]"
  >
    <div
      v-if="showAvatar"
      class="message-avatar"
      :class="{ right: isSelf }"
      v-html="avatarSvg"
    ></div>
    <span class="message-content">{{ content }}</span>
  </div>

  <div v-if="messageType === 'order-list'">
    <div :class="['message', senderTypeClass]">
      <div
        v-if="showAvatar"
        class="message-avatar"
        :class="{ right: isSelf }"
        v-html="avatarSvg"
      ></div>
      <span class="message-content">{{ orderListMessageBody.messageTitle }}</span>
    </div>
    <OrderList :orders="orderListMessageBody.orderCards"></OrderList>
  </div>

  <div v-if="messageType === 'order-card'">
    <div :class="['message', senderTypeClass]" style="justify-content: flex-end">
      <div
        v-if="showAvatar"
        class="message-avatar"
        :class="{ right: isSelf }"
        v-html="avatarSvg"
      ></div>
      <span class="message-content">This is the order I'd like to consult about:</span>
    </div>
    <OrderCard
      :id="orderCard.id"
      :order-id="orderCard.orderId"
      :order-title="orderCard.orderTitle"
      :price="orderCard.price"
      :pay-status="orderCard.payStatus"
      :delivery-status="orderCard.deliveryStatus"
      :created-at="orderCard.createdAt"
      :image-name="orderCard.imageName"
      :selected="true"
    ></OrderCard>
  </div>
  <div v-if="messageType === 'service-progress-card'" name="serviceProgress">
    <div :class="['message', senderTypeClass]" style="justify-content: flex-start">
      <div
        v-if="showAvatar"
        class="message-avatar"
        :class="{ right: isSelf }"
        v-html="avatarSvg"
      ></div>
      <span class="message-content">The current service progress is as follows: </span>
    </div>
    <ServiceProgressCard :currentStatus="content"></ServiceProgressCard>
  </div>
</template>

<script>
import multiavatar from '@multiavatar/multiavatar'
import avatarRobot from '@/assets/robot.svg?raw'
import avatarAgent from '@/assets/agent.svg?raw'
import OrderList from './OrderList.vue'
import OrderCard from './OrderCard.vue'
import ServiceProgressCard from './ServiceProgressCard.vue'

export default {
  name: 'ChatMessage',
  components: { OrderList, OrderCard, ServiceProgressCard },
  props: {
    senderType: String,
    senderName: String,
    content: String,
    messageType: String,
  },
  computed: {
    orderListMessageBody() {
      if (this.messageType === 'order-list' && this.content) {
        return JSON.parse(this.content)
      } else {
        return {}
      }
    },
    orderCard() {
      if (this.messageType === 'order-card' && this.content) {
        return JSON.parse(this.content)
      } else {
        return {}
      }
    },
    senderTypeClass() {
      return this.messageType === 'system-notice' ? 'system' : this.senderType
    },
    isSystemNotice() {
      return this.messageType === 'system-notice'
    },
    isSelf() {
      return this.senderType === 'customer'
    },
    showAvatar() {
      return this.messageType !== 'system-notice'
    },
    avatarSvg() {
      if (this.senderType === 'agent') {
        return avatarAgent
      } else if (this.senderType === 'robot') {
        return avatarRobot
      } else if (this.senderType === 'customer') {
        return multiavatar(this.username)
      }
      return ''
    },
  },
  methods: {},
}
</script>

<style scoped>
.message {
  display: flex;
  align-items: flex-start;
  margin: 8px 0;
}
.message.robot,
.message.agent {
  align-self: flex-start;
}
.message.customer {
  align-self: flex-end;
}
.message.system {
  align-self: center;
  font-size: 13px;
  color: #888;
}

/* 头像 */
.message-avatar {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  margin: 0 8px;
  object-fit: cover;
}
.message-avatar.right {
  order: 2;
}

/* 气泡内容 */
.message-content {
  /* max-width: 80%; */
  padding: 10px 14px;
  border-radius: 12px;
  background-color: #f1f1f1;
  font-size: 14px;
  line-height: 1.4;
  word-wrap: break-word;
}
.message.agent .message-content {
  background-color: #d2f1ff;
}
.message.robot .message-content {
  background-color: #ffe9a7;
}
</style>
