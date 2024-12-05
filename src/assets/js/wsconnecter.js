/**
 * Copyright FunASR (https://github.com/alibaba-damo-academy/FunASR). All Rights
 * Reserved. MIT License  (https://opensource.org/licenses/MIT)
 */
/* 2021-2023 by zhaoming,mali aihealthx.com */
export default function WebSocketConnectMethod(config) {
  //定义socket连接方法类
  var speechSokt;
  var msgHandle = config.msgHandle;
  var stateHandle = config.stateHandle;
  var uri = config.uri;
  var socketStatus = null;
  this.wsStart = function () {
    // || process.env.VUE_AUDIO_INPUT_WSS_URI
    if (uri.match(/wss:\S*|ws:\S*/)) {
      //"wss://111.205.137.58:5821/wss/" //设置wss asr online接口地址 如 wss://X.X.X.X:port/wss/
      // console.log("Uri" + Uri);
    } else {
      alert("请检查wss地址正确性");
      return 0;
    }

    if ("WebSocket" in window) {
      speechSokt = new WebSocket(uri); // 定义socket连接对象
      speechSokt.binaryType = "arraybuffer";
      speechSokt.onopen = function (e) {
        console.log(
          `websocket连接成功 ---------------------------  🍍🍍🍍🍍🍍🍍🍍`,
          e
        );

        socketStatus = 0;
        onOpen(e);
      }; // 定义响应函数
      speechSokt.onclose = function (e) {
        console.log(
          `websocket断开连接 ---------------------------  🍍🍍🍍🍍🍍🍍🍍`,
          e
        );
        socketStatus = 1;
        // onClose(e);
        stateHandle(1);
      };
      speechSokt.onmessage = function (e) {
        msgHandle(e);
      };
      speechSokt.onerror = function (e) {
        console.log("wserror", e);
        socketStatus = 2;
        stateHandle(2);
      };
      return 1;
    } else {
      alert("当前浏览器不支持 WebSocket");
      return 0;
    }
  };

  // 定义停止与发送函数
  this.wsStop = function () {
    if (speechSokt != undefined) {
      // console.log("stop ws!");
      speechSokt.close();
    }
  };

  this.wsSend = function (oneData) {
    if (speechSokt == undefined) return;
    if (speechSokt.readyState === 1) {
      // 0:CONNECTING, 1:OPEN, 2:CLOSING, 3:CLOSED
      speechSokt.send(oneData);
    }
  };
  //获取websocket的状态码
  this.checkSocketIsOnLine = function () {
    if (socketStatus == 0) {
      return true;
    } else {
      return false;
    }
  };

  // SOCEKT连接中的消息与状态响应
  function onOpen(e) {
    // 发送json
    var chunk_size = new Array(5, 10, 5);
    var request = {
      chunk_size: chunk_size,
      wav_name: "h5",
      is_speaking: true,
      chunk_interval: 10,
      itn: false, //getUseITN(),
      mode: "2pass",
    };
    // if (isfilemode) {
    //   request.wav_format = file_ext;
    //   if (file_ext == "wav") {
    //     request.wav_format = "PCM";
    //     request.audio_fs = file_sample_rate;
    //   }
    // }

    // var hotwords = getHotwords();

    // if (hotwords != null) {
    //   request.hotwords = hotwords;
    // }
    console.log(JSON.stringify(request));
    speechSokt.send(JSON.stringify(request));
    console.log("连接成功");
    stateHandle(0);
  }
}
