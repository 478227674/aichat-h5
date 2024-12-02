<template>
  <div class="page-continer page-voice-chat" style="background-color: #000">
    <div class="voice-user-name">{{ chatUser.name }}</div>
    <div class="voice-user-img">
      <div>
        <img :src="chatUser.img" alt="" />
      </div>
      <div class="chat-saying replay-animation">
        <recordUi />
      </div>
    </div>
    <div class="voice-chat-handle">
      <div class="voice-chat-handle-box">
        <van-icon size="30" color="#fff" name="volume-o" />
      </div>
      <div>
        <div>
          <recordUi />

          <span class="voice-status-text">你可以开始说话</span>
        </div>
      </div>
      <div
        class="voice-chat-handle-box voice-chat-handle-close"
        @click="onCloseVoiceChat"
      >
        <van-icon size="30" color="#fff" name="close" />
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import recordUi from "@/bussniessCom/recording/recordUi.vue";

export default {
  data() {
    return {};
  },
  components: {
    recordUi,
  },
  computed: {
    ...mapGetters(["chatUser"]),
  },
  methods: {
    onCloseVoiceChat() {
      //关闭实时语音

      //返回上一页
      this.$router.back();
    },
  },
};
</script>

<style lang="less">
.chat-saying {
  .wave {
    background: #036af3 !important;
  }
}
</style>
