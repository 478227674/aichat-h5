<script>
import { actions } from "../store";
import { stop, record, start, addresschange } from "../utils/chat/audio/main";
import { sendMsgToService } from "@/api";
export default {
  name: "msgText",
  vuex: {
    actions: actions,
  },
  data() {
    return {
      content: "",
      //录音状态 0正常 1正在录音 2已停止录音
      recordStatus: 0,
      //录制语音按钮文字 recordStatus 0：录制 、 1：停止 00:00 最长1分钟
      recordBtnText: "录制",
      //录制计时
      recordInterval: null,
      //录制时长
      recordNum: 0,
    };
  },
  created() {
    //自动连接ws
    setTimeout(() => {
      // start();
      addresschange();
    }, 500);
  },
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
    wsStart() {
      start();
    },
    //开始录音
    async onRecord() {
      if (this.recordStatus == 0) {
        record();
        this.recordStatus = 1;
        // let state = await start();
        // if (state == 1) {
        //   record();
        //   this.recordStatus = 1;
        // }
      } else if (this.recordStatus == 1) {
        setTimeout(() => {
          //stop:true
          stop((theblob, duration, rec_text) => {
            this.recordStatus = 0;
            if (rec_text != "") {
              this.sendTextMsgToService(rec_text);
            }
            if (duration > 100) {
              this.$store.commit("SEND_MESSAGE", {
                type: "audio",
                duration: (duration / 1000).toFixed(0),
                content: (window.URL || webkitURL).createObjectURL(theblob),
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
      this.sendTextMsgToService(this.content);
      this.$store.commit("SEND_MESSAGE", data);
      this.content = "";
    },
  },
};
</script>

<template>
  <div class="text">
    <div class="text-input-box">
      <div id="info_div" style="display: none">detail信息</div>
      <div class="chat-btns">
        <input
          type="text"
          style="display: none"
          placeholder="请输入ws链接"
          id="wssip"
        />
        <!-- <button id="btnConnect" class="send-msg-btn" @click="wsStart">
          连接
        </button> -->

        <button id="btnStart" class="send-record-btn" @click="onRecord">
          {{ recordStatus == 1 ? "停止" : "开始" }}
        </button>
        <!-- <button id="btnStop" class="send-record-btn" @click="onRecord">
          停止
        </button> -->

        <!-- <button class="send-msg-btn" @click="sendMsg">发送</button> -->
      </div>
      <textarea
        id="varArea"
        class="text-textarea"
        placeholder="按 Enter 发送"
        v-model="content"
        @keyup="onKeyup"
      ></textarea>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.text {
  border-top: solid 1px #ddd;
  .text-input-box {
    background: #fff;
    height: 160px;
    .chat-btns {
      padding: 10px 0;
      display: flex;
      justify-content: end;
      align-items: center;
      #info_div {
        margin-left: 10px;
        color: #b2e281;
      }
      .send-msg-btn,
      .send-record-btn {
        height: 30px;
        padding: 0 20px;
        font-size: 12px;
        background: #b2e281;
        border: none;
        color: #fff;
        border-radius: 4px;
        cursor: pointer;
        margin: 0px 10px 0;
      }
    }
    textarea {
      padding: 10px;
      height: 100%;
      width: 100%;
      border: none;
      outline: none;
      font-family: "Micrsofot Yahei";
      resize: none;
    }
  }

  .text-textarea {
    font-size: 14px;
  }
}
</style>
