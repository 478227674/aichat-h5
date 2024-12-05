<script>
import { actions } from "@/store";
import { stop, record, start } from "@/utils/chat/audio/main";
import recordUi from "@/bussniessCom/recording/recordUi.vue";
import { sendMsgToService } from "@/api";
export default {
  name: "msgText",
  components: {
    recordUi,
  },
  vuex: {
    actions: actions,
  },
  data() {
    return {
      content: "",
      //录音状态 0正常 1正在录音 2已停止录音
      recordStatus: 0,
      //聊天方式 1文字 2语音 3实时语音
      chatType: "1",
      //是否录音中间中断了
      isInterrupt: false,
      //长按事件的延时器
      timeOutEvent: null,
      //记录长按按下时的位置，判断上划取消发送语音使用
      touchY: 0,
    };
  },
  created() {},

  mounted() {},
  methods: {
    sendTextMsgToService(msg) {
      let data = {
        op_name: "lindaiyu",
        stream: "stream",
        ids: {
          user_id: "test-888",
          agent_id: "1",
          conversation_group_id: "test-111",
          sender_id: "test-666",
          receiver_id: "test-222",
          request_id: "123",
        },
        kb_params: {
          belong_type: "组",
          group_id: 11,
        },
        query: {
          content: msg,
          content_type: "text",
        },
      };
      sendMsgToService(data).then((res) => {
        console.log(res);
      });
    },
    //开始录音
    async onRecord() {
      if (this.recordStatus == 0) {
        record();
        this.recordStatus = 1;
      }
    },

    //结束录音
    onStopRecord() {
      if (this.recordStatus == 1) {
        setTimeout(() => {
          //停止录音
          stop((theblob, duration, rec_text) => {
            //重置录音状态
            this.recordStatus = 0;
            //如果是用户主动触发录音中断 则不往下处理
            if (this.isInterrupt) {
              this.isInterrupt = false;
              return;
            }

            if (rec_text != "") {
              this.sendTextMsgToService(rec_text);
            }
            if (duration > 100) {
              this.$store.commit("SEND_MESSAGE", {
                type: "audio",
                duration: (duration / 1000).toFixed(0),
                content: (window.URL || webkitURL).createObjectURL(theblob),
                self: true,
              });
            } else {
              console.log("录音时长太短");
            }
          });
        }, 500);
      }
    },

    onKeyup(e) {
      if (e.keyCode === 13 && this.content.length) {
        this.sendMsg();
      }
    },
    sendMsg() {
      let data = {
        content: this.content,
        type: "text",
      };
      window.$ws.wsSend(this.content + " Avatar3 (MuseV)");

      // this.sendTextMsgToService(this.content);
      this.$store.commit("SEND_MESSAGE", data);
      this.content = "";
    },

    checkRecored(t) {
      this.chatType = t;
    },

    //长按事件（起始）
    gtouchstart(event) {
      var self = this;
      //记录按下的位置
      this.touchY = event.touches[0].pageY;
      //长按500毫秒触发长按事件
      this.timeOutEvent = setTimeout(function () {
        self.longPress();
      }, 500);
      return false;
    },
    //手释放，如果在500毫秒内就释放，则取消长按事件，此时可以执行onclick应该执行的事件
    showDeleteButton() {
      if (this.timeOutEvent != 0) {
        //这里写要执行的内容（如onclick事件）
        return;
      }
      clearTimeout(this.timeOutEvent); //清除定时器

      //如果是长按情况下手释放 停止录音
      this.onStopRecord();
      //录音状态下上划取消了
      if (this.isInterrupt) {
        console.log("取消录音");
      }
      return false;
    },
    //如果手指有移动，则取消所有事件，此时说明用户只是要移动而不是长按
    gtouchmove(e) {
      e.preventDefault(); // 阻止默认滚动行为
      //判断上划取消
      if (e.touches[0].pageY + 30 < this.touchY) {
        this.isInterrupt = true;
        clearTimeout(this.timeOutEvent); //清除定时器
        this.timeOutEvent = 0;
      } else {
        this.isInterrupt = false;
      }
    },
    //真正长按后应该执行的内容
    longPress() {
      this.timeOutEvent = 0;
      //开始录音
      this.onRecord();
    },
    // 阻止长按出现复制等菜单
    onContextMenu(event) {
      event.preventDefault();
    },
  },
};
</script>

<template>
  <div
    class="text"
    :class="{ 'record-ing': chatType == 2 && recordStatus == 1 }"
  >
    <!-- 文字发送输入框 -->
    <div class="text-input-box" v-show="chatType == 1">
      <input
        id="varArea"
        class="text-textarea"
        placeholder="按 Enter 发送"
        v-model="content"
        @keyup="onKeyup"
      />
      <div class="input-btns">
        <!-- 发送文字按钮 -->
        <van-icon
          v-show="content != ''"
          size="20px"
          @click="sendMsg"
          color="#fff"
          name="guide-o"
        />
        <!-- 切换语音按钮 -->
        <van-icon
          v-show="content == ''"
          size="20px"
          @click="checkRecored(2)"
          color="#fff"
          name="pause-circle-o"
        />
      </div>
    </div>
    <!-- 语音发送输入框 -->
    <div class="text-input-box" v-show="chatType == 2">
      <div
        class="record-btn"
        @touchstart="gtouchstart($event)"
        @touchmove="gtouchmove($event)"
        @touchend="showDeleteButton()"
        @contextmenu.prevent="onContextMenu"
      >
        <div v-show="recordStatus == 0">按住说话</div>

        <div v-show="recordStatus == 1 && !isInterrupt">
          <recordUi class="record-icon" />
          <span class="record-prompt">松手发送，上移取消</span>
          <van-loading color="#fff"> 录音中... </van-loading>
        </div>

        <div v-show="recordStatus == 1 && isInterrupt">
          <span class="record-prompt">松手取消</span>
          松手取消
        </div>
      </div>

      <!-- 切换文字按钮 -->
      <div class="input-btns" v-show="recordStatus == 0">
        <van-icon
          v-show="content == ''"
          size="20px"
          @click="checkRecored(1)"
          color="#fff"
          name="service"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.text.record-ing {
  padding: 100px 4% 10px 4%;
  background-image: linear-gradient(to top, black, transparent 100%);
  bottom: 0 !important;
}
.text {
  width: 92%;
  padding: 0 4%;
  position: fixed;
  bottom: 10px;
  left: 0;
  height: 50px;
  background: none;
  // overflow: hidden;
  .record-btn {
    -webkit-touch-callout: none !important;
    -webkit-user-select: none;
    text-align: center;
    font-size: 16px;
    font-weight: 100;
    color: #fff;
    width: calc(100% - 20px);
    position: absolute;
    bottom: 0px;
    line-height: 50px;
    .record-prompt {
      position: absolute;
      width: 100%;
      text-align: center;
      top: -40px;
      left: 0;
      font-size: 12px;
      color: #fff;
    }
    .record-icon {
      position: absolute;
      top: -100px;
      left: 50%;
      margin-left: -50px;
    }
  }
  .text-input-box {
    position: relative;
    height: 50px;
    border-radius: 10px;
    background: #5d5c5b;
    width: calc(100% - 60px);
    padding: 0 50px 0 10px;
    .input-btns {
      position: absolute;
      right: 20px;
      top: 15px;
      z-index: 2;
    }

    .text-textarea {
      height: 50px;
      font-size: 14px;
      border: none;
      line-height: 50px;
      color: #fff;
      // width: calc(100% - 60px);
      // padding: 0 50px 0 10px;
      background: none;
    }
  }
}
</style>
