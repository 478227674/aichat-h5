<template>
  <div class="chat-container">
    <div class="chat-header">
      <span>AI 聊天</span>
    </div>

    <div class="chat-messages" ref="chatMessages">
      <div
        class="chat-message"
        v-for="(message, index) in messages"
        :key="index"
        :class="{
          sent: message.type === 'sent',
          received: message.type === 'received',
        }"
      >
        <div class="message-bubble">{{ message.text }}</div>
      </div>
    </div>

    <div class="chat-input">
      <input
        v-model="messageText"
        type="text"
        placeholder="请输入消息..."
        @keyup.enter="sendMessage"
        autofocus
      />
      <button @click="sendMessage">发送</button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      messageText: "", // 用户输入的消息
      messages: [], // 聊天消息记录
    };
  },
  methods: {
    // 发送消息
    sendMessage() {
      if (this.messageText.trim()) {
        const userMessage = this.messageText;
        this.messages.push({ type: "sent", text: userMessage });
        this.scrollToBottom();
        this.messageText = ""; // 清空输入框

        // 模拟 AI 回复
        setTimeout(() => {
          this.aiReply(userMessage);
        }, 1000);
      }
    },

    // 模拟 AI 的回复
    aiReply(userMessage) {
      const aiMessage = `AI 回复: 我收到您的消息 "${userMessage}"`;
      this.messages.push({ type: "received", text: aiMessage });
      this.scrollToBottom();
    },

    // 滚动到消息列表的最底部
    scrollToBottom() {
      this.$nextTick(() => {
        const chatMessages = this.$refs.chatMessages;
        chatMessages.scrollTop = chatMessages.scrollHeight;
      });
    },
  },
};
</script>

<style scoped>
/* 重置默认样式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* 页面整体布局 */
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f4f4f4;
}

/* 头部 */
.chat-header {
  background-color: #4caf50;
  color: white;
  padding: 16px;
  font-size: 18px;
  font-weight: bold;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 消息展示区 */
.chat-messages {
  flex-grow: 1;
  padding: 12px;
  overflow-y: auto;
  background-color: #fff;
}

/* 消息容器 */
.chat-message {
  display: flex;
  margin: 12px 0;
}

/* 发送的消息 */
.chat-message.sent {
  justify-content: flex-end;
}

/* 接收到的消息 */
.chat-message.received {
  justify-content: flex-start;
}

/* 气泡样式 */
.message-bubble {
  max-width: 75%;
  padding: 10px;
  border-radius: 15px;
  background-color: #e1e1e1;
  line-height: 1.5;
  word-wrap: break-word;
  font-size: 14px;
  word-break: break-word;
}

.chat-message.sent .message-bubble {
  background-color: #007bff;
  color: white;
}

.chat-message.received .message-bubble {
  background-color: #e1e1e1;
  color: #333;
}

/* 输入框区域 */
.chat-input {
  display: flex;
  padding: 12px;
  background-color: #fff;
  border-top: 1px solid #ddd;
}

/* 输入框样式 */
.chat-input input {
  flex-grow: 1;
  padding: 12px;
  border-radius: 20px;
  border: 1px solid #ddd;
  font-size: 14px;
  margin-right: 12px;
  background-color: #f1f1f1;
}

/* 发送按钮 */
.chat-input button {
  padding: 12px 16px;
  border-radius: 50%;
  background-color: #4caf50;
  color: white;
  border: none;
  cursor: pointer;
  font-size: 16px;
}

.chat-input button:hover {
  background-color: #45a049;
}

/* 响应式设计：保证适配移动设备 */
@media (max-width: 600px) {
  .chat-header {
    font-size: 16px;
  }

  .message-bubble {
    font-size: 12px;
    padding: 8px;
  }

  .chat-input input {
    font-size: 14px;
    padding: 10px;
  }

  .chat-input button {
    font-size: 20px;
    padding: 10px 14px;
  }
}
</style>
