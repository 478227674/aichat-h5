<script>
import { stop, record, start } from "../utils/chat/audio/main";
import { mapGetters } from "vuex";
import WebSocketConnectMethod from "/public/wsconnecter";

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
      playNum: 50, //每次播放多少单位
      source: {},
      isPlaying: false, //是否 播放中
      audio_record: "",
    };
  },
  mounted() {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(function (mediaStream) {
        console.log(mediaStream);
      })
      .catch(function (error) {
        console.log(error);
      });
    this.audio_record = document.getElementById("audio_record");
    let _this = this;
    //初始化输出音频websocket
    // this.ws = new WebSocketConnectMethod({
    //   //后台返回的数据
    //   msgHandle: (jsonmsg) => {
    //     this.handleWebSocketMessage(jsonmsg.data);
    //     // this.playNextAudio()
    //   },
    //   //websocket的状态
    //   stateHandle: (state) => {
    //     console.log(`websocket状态是${state}`);
    //   },
    //   //websocket的地址
    //   uri: process.env.VUE_APP_AUDIO_OUTPUT_WSS_URI,
    // });
    // // this.ws.binaryType = "arraybuffer";
    // var ret = this.ws.wsStart();
    start();
    this.audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();
    this.source = this.audioContext.createBufferSource();
  },
  filters: {
    // 将日期过滤为 hour:minutes
    time(date) {
      if (typeof date === "string") {
        date = new Date(date);
      }

      let hours = date.getHours(),
        mins = date.getMinutes();
      return (
        (hours < 10 ? "0" + hours : hours) +
        ":" +
        (mins < 10 ? "0" + mins : mins)
      );
    },
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
      // 接收50条消息后播放音频
      if (this.count == this.playNum) {
        this.playAudioStram();
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
      let _this = this;
      //监听audioIndex，如果大于语音流的二进制数组 则播放完
      if (this.audioIndex > this.audioDataBuffer.length) {
        this.audioIndex = 0;
        this.count = 0;
        return;
      }

      //截取上次播放完的位置 +this.playNum单位的语音流
      let playBuffer = this.audioDataBuffer.slice(
        this.audioIndex,
        this.audioIndex + this.playNum
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
        24000
      );
      buffer.copyToChannel(floatArray, 0);

      this.source.buffer = buffer;

      //监听本次播放的this.playNum个单位的语音流 播放完成后count职
      this.source.onended = function (res) {
        _this.audioIndex = _this.audioIndex + _this.playNum;
        this.count = 0;
        _this.playAudioStream();
      };
      this.source.connect(this.audioContext.destination);
      this.source.start();
      this.isPlaying = true;
    },
    //播放语音
    playAudio(data) {
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
  <div class="message" v-scroll-bottom="session.messages">
    <ul v-if="session">
      <audio controls src="" ref="audio_record" id="audio_record"></audio>
      <li v-for="item in session.messages" :key="item.id">
        <p class="time">
          <span>{{ item.date | time }}</span>
        </p>
        <div class="main" :class="{ self: item.self }">
          <img
            class="avatar"
            width="30"
            height="30"
            :src="item.self ? user.img : session.user.img"
          />
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
.message {
  padding: 10px 15px;
  overflow-y: scroll;

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
    display: inline-block;
    position: relative;
    padding: 0 10px;
    max-width: calc(100% - 40px);
    min-height: 30px;
    line-height: 2.5;
    font-size: 12px;
    text-align: left;
    word-break: break-all;
    background-color: #fafafa;
    border-radius: 4px;

    &:before {
      content: " ";
      position: absolute;
      top: 9px;
      right: 100%;
      border: 6px solid transparent;
      border-right-color: #fafafa;
    }
  }
  .audio-msg {
    height: 30px;
    overflow: hidden;
    max-width: 300px;
  }

  .self {
    text-align: right;

    .avatar {
      float: right;
      margin: 0 0 0 10px;
    }
    .text {
      background-color: #b2e281;

      &:before {
        right: inherit;
        left: 100%;
        border-right-color: transparent;
        border-left-color: #b2e281;
      }
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
