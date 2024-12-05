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
import { stop, record, onLineChatStopRec } from "@/utils/chat/audio/main";
import { EventBus } from "@/utils/chat/audio/event-bus";

export default {
  data() {
    return {
      conectNum: 0,
      count: 0,
      audioContext: {},
      audioDataBuffer: [],
      audioIndex: 0, //记录播放位置
      playNum: 20, //每次播放多少单位
      source: {},
      isPlaying: false, //是否 播放中
      audio_record: "",
    };
  },
  components: {
    recordUi,
  },
  beforeRouteLeave(to, from, next) {
    onLineChatStopRec();
    next();
  },
  created() {
    setTimeout(() => {
      this.init();
    }, 1000);
  },
  mounted() {
    let _that = this;
    this.audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();

    // //audio下的main.js里定义的，接收websocket回传的数据
    EventBus.$on("websocket-message-online", function (res) {
      if (typeof res == "object") {
        _that.handleWebSocketMessage(res);
      } else {
        if (res == "音频播放结束") {
          // _that.audioDataBuffer = [];
        } else if (res == '{"is_speaking": true}') {
          _that.audioDataBuffer = [];
          console.log("该暂停了", "🍍🍍🍍🍍🍍🍍🍍");
        }
      }
    });
  },
  computed: {
    ...mapGetters(["chatUser"]),
  },
  watch: {
    //监听正是否正在播放 如果没在播放则开启录音
    isPlaying(newVal) {
      if (newVal) {
        onLineChatStopRec();
      } else {
        setTimeout(() => {
          record();
        }, 100);
      }
    },
  },
  methods: {
    // 处理接收到的 WebSocket 消息
    handleWebSocketMessage(data) {
      if (this.$store.state.chatType != 2) {
        return;
      }

      // 继续将收到的数据添加到音频缓冲区
      this.audioDataBuffer.push(data);
      this.count++;
      this.slicesNum += 1;
      // 接收50条消息后播放音频
      if (this.count == this.playNum) {
        this.playAudioStream();
      }
    },
    // 播放音频数据
    playAudioStream() {
      if (this.isPlaying) {
        console.log("正在播放，请勿打扰");
        return;
      }
      this.isPlaying = true;

      let _this = this;
      //监听audioIndex，如果大于语音流的二进制数组 则播放完
      if (this.audioDataBuffer.length == 0) {
        this.isPlaying = false;
        console.log("播放完了");
        this.audioIndex = 0;
        this.count = 0;
        return;
      }

      //截取上次播放完的位置 +this.playNum单位的语音流
      let playBuffer = this.audioDataBuffer.splice(
        this.audioIndex,
        this.playNum
      );
      const audioBuffer = playBuffer.reduce((acc, chunk) => {
        const chunkArray = new Int32Array(chunk); // 假设音频数据是 32 位整型
        return acc.concat(Array.from(chunkArray));
      }, []);

      // 将数据转换为 Float32Array 以用于播放
      const floatArray = new Float32Array(audioBuffer.length);
      for (let i = 0; i < audioBuffer.length; i++) {
        floatArray[i] = audioBuffer[i] / Math.pow(2, 31); // 将 32 位整型数据归一化
      }

      const buffer = this.audioContext.createBuffer(
        1,
        floatArray.length,
        15000
      );
      buffer.copyToChannel(floatArray, 0);
      this.source = this.audioContext.createBufferSource();

      this.source.buffer = buffer;

      //监听本次播放的this.playNum个单位的语音流 播放完成后count
      this.source.onended = function (res) {
        _this.isPlaying = false;
        console.log("播放完了，来打扰我");
        _this.audioIndex = 0;
        _this.count = 0;
        _this.playAudioStream();
      };
      this.source.connect(this.audioContext.destination);

      this.source.start();
    },
    //判断链接状态 开始开始录音
    init() {
      let socketIsOnline = window.$ws.checkSocketIsOnLine();
      if (socketIsOnline) {
        this.conectNum = 0;
        window.$ws.wsSend(JSON.stringify({ online: true }));
        setTimeout(() => {
          record();
        }, 100);
      } else {
        if (this.conectNum >= 3) {
          alert("服务器连接失败，请稍后重试");
          return;
        }
        setTimeout(() => {
          window.$ws.wsStart();
          this.conectNum += 1;
          this.init();
        }, 5000);
      }
    },
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
