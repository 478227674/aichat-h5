<script>
import { stop, record, start } from "@/utils/chat/audio/main";
import { mapGetters } from "vuex";
import { EventBus } from "@/utils/chat/audio/event-bus";
import AudioContext from "@/utils/chat/audio/play";
export default {
  computed: {
    ...mapGetters(["user", "session"]), // 映射 Vuex 的 getters
  },
  data() {
    return {
      ws: null,
      audioQueue: [], //音频播放队列
      changeAudio: false, //播放语音过程中 是否点击了其他语音播放
      count: 0,
      audioContext: {},
      audioDataBuffer: [],
      audioIndex: 0, //记录播放位置
      playNum: 30, //每次播放多少单位
      source: {},
      isPlaying: false, //是否 播放中
      audio_record: "",
      slicesNum: 0,
      chatType: 1, //1对讲 2实时语音
    };
  },
  created() {
    this.$store.commit("SET_CHAT_TYPE", 1);
    window.$ws.wsSend(JSON.stringify({ online: false }));

    this.audioContext = window.$audioContext;
    this.source = window.$source;
  },
  mounted() {
    let _that = this;
    //audio下的main.js里定义的，接收websocket回传的数据
    EventBus.$on("websocket-message", function (res) {
      // if (_that.$store.state.chatType != 1) {
      //   return;
      // }
      if (res) {
        if (res != "音频播放结束") {
          _that.handleWebSocketMessage(res);
        } else {
          _that.isPlayEnd = true;
        }
      }
    });
    //授权播放
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(function (mediaStream) {})
      .catch(function (error) {
        console.log(error);
      });
    this.audio_record = document.getElementById("audio_record");
    // this.audioContext = new AudioContext();
    // document.getElementById("msgList").addEventListener(
    //   "touchstart",
    //   function (e) {
    //     // 阻止默认的触摸行为
    //     e.preventDefault();
    //   },
    //   { passive: false }
    // );
  },
  directives: {
    // 发送消息后滚动到底部
    "scroll-bottom"(el, binding, vnode) {
      const vm = vnode.context;
      vm.$nextTick(() => {
        el.scrollTop = el.scrollHeight - el.clientHeight;
      });
    },
  },

  methods: {
    // 处理接收到的 WebSocket 消息
    handleWebSocketMessage(data) {
      // 继续将收到的数据添加到音频缓冲区
      this.audioDataBuffer.push(data);
      this.count++;
      this.slicesNum += 1;
      // 接收50条消息后播放音频
      if (this.count == this.playNum) {
        this.playAudioStream();
      }
    },

    //停止播放语音流
    playStop() {
      try {
        this.source.stop();
      } catch {}
      this.isPlaying = false;
    },

    // 播放音频数据
    playAudioStream() {
      console.log("对讲的播放方法");
      let _this = this;
      //监听audioIndex，如果大于语音流的二进制数组 则播放完
      if (this.audioDataBuffer.length == 0) {
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
        _this.count = 0;
        _this.playAudioStream();
      };
      this.source.connect(this.audioContext.destination);
      this.source.start();
      this.isPlaying = true;
    },
    //播放语音
    playAudio(data) {
      console.log(222);

      //点击页面聊天记录语音时 如果正在播放流式语音 则停止播放流式语音
      this.playStop();

      // var audio_record = document.getElementById("audio_record");
      this.audio_record.src = data.content;
      this.audio_record.controls = true;
      this.audio_record.play();
      this.isPlaying = true;
      this.audio_record.onended = function () {
        this.isPlaying = false;
      };

      //todo 此处模拟播放回复语音时 识别到用户说话 后台返回结果 要暂停播放
      if (!data.self) {
        record();
        setTimeout(() => {
          audio_record.pause();
          stop(null, true);
        }, 5000);
      }
    },
  },
};
</script>

<template>
  <div class="message" id="msgList" v-scroll-bottom="session.messages">
    <ul v-if="session" class="message-ul">
      <audio controls src="" ref="audio_record" id="audio_record"></audio>
      <li v-for="item in session.messages" :key="item.id">
        <div class="main" :class="{ self: item.self }">
          <div class="text" v-if="item.type == 'text'">{{ item.content }}</div>
          <div class="text" v-if="item.type == 'audio'">
            <div
              @click="playAudio(item)"
              class="audio-msg"
              :style="{
                width: item.duration ? item.duration * 20 + 'px' : '1px',
              }"
            >
              {{ item.duration }}"
            </div>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<style lang="scss" scoped>
.message-ul {
  overflow-y: scroll;
  // height: 100%;
  padding: 10px 15px 120px 15px;
}
.message {
  overflow-y: scroll;
  height: 100%;
  li {
    margin-bottom: 15px;
  }
  .time {
    margin: 7px 0;
    text-align: center;

    > span {
      display: inline-block;
      padding: 0 18px;
      font-size: 12px;
      color: #fff;
      border-radius: 2px;
      background-color: #dcdcdc;
    }
  }
  .avatar {
    float: left;
    margin: 0 10px 0 0;
    border-radius: 3px;
  }
  .text {
    max-width: 80%;
    display: inline-block;
    position: relative;
    padding: 10px 15px;
    line-height: 20px;
    font-size: 16px;
    text-align: left;
    word-break: break-all;
    background-color: #69624b;
    border-radius: 10px;
    color: #fff;
  }
  .audio-msg {
    overflow: hidden;
    max-width: 80%;
  }
  .self {
    text-align: right;
    .avatar {
      float: right;
      margin: 0 0 0 10px;
    }
    .text {
      background-color: #222222;
    }
    // .audio-msg {
    //   text-align: right;
    //   > div {
    //     display: inline-block;
    //     height: 30px;
    //     width: 60px;
    //     background-color: #b2e281;
    //   }
    //   &:before {
    //     content: " ";
    //     position: absolute;
    //     top: 9px;
    //     right: 100%;
    //     border: 6px solid transparent;
    //     border-right-color: #fafafa;
    //   }
    // }
  }
}
</style>
