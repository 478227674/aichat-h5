<template>
  <div class="page-continer">
    <div class="chat-background">
      <div class="chat-page-top">
        <div class="chat-user-info">
          <van-icon
            size="20px"
            @click="$router.back()"
            color="#fff"
            name="arrow-left"
          />
          <div class="chat-user-head">
            <img :src="chatUser.img" alt="" />
            <div>
              <p>{{ chatUser.name }}</p>
              <span>@坐着</span>
            </div>
          </div>
        </div>

        <div class="chat-user-handle">
          <van-icon
            @click="onVoiceChat"
            class="chat-user-handle-item"
            color="#fff"
            size="20px"
            name="phone"
          />
          <van-icon
            class="chat-user-handle-item"
            color="#fff"
            size="20px"
            name="volume"
          />
          <van-icon
            class="chat-user-handle-item"
            color="#fff"
            size="20px"
            name="weapp-nav"
          />
        </div>
      </div>

      <message />
      <TextAr class="msg-input" />
    </div>
  </div>
</template>

<script>
import message from "@/bussniessCom/chat/message.vue";
import TextAr from "@/bussniessCom/chat/text.vue";
import { mapGetters } from "vuex";
export default {
  data() {
    return {};
  },
  components: {
    message,
    TextAr,
  },
  computed: {
    ...mapGetters(["chatUser"]),
  },
  methods: {
    onVoiceChat() {
      this.$store.commit("SET_CHAT_TYPE", 2);
      this.$router.push({ path: "/voiceChat", query: {} });
    },
  },
};
</script>

<style></style>
