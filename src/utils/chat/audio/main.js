/* 2022-2023 by zhaoming,mali aihealthx.com */
import { EventBus } from "./event-bus.js";
import store from "@/store/index.js";
// setTimeout(function () {
//   console.log(EventBus.$emit);

// }, 2000);
// // 录音; 定义录音对象,wav格式
var rec = Recorder({
  type: "pcm",
  bitRate: 32,
  sampleRate: 16000,
  onProcess: recProcess,
});
var sampleBuf = new Int16Array();

var isRec = false; //是否录音中

var rec_text = ""; // for online rec asr result
var offline_text = ""; // for offline rec asr result

var isfilemode = false; // if it is in file mode
var file_data_array; // array to save file data

var totalsend = 0;

//开始录音
export function record() {
  rec.open(function () {
    isRec = true;
    rec_text = "";
    rec.start();
  });
}

// 识别ws启动
export function start() {
  //启动ws连接
  var ret = window.$ws.wsStart();
  // 1 is ok, 0 is error
  if (ret == 1) {
    isRec = true;
    return 1;
  } else {
    return 0;
  }
}

//暂停录音
export function onLineChatStopRec() {
  rec.stop();
}

//isHandle：停止后是否继续处理录音 默认处理
export function stop(callback, isHandle) {
  if (isHandle) {
    isRec = false;
    return;
  }
  // var chunk_size = new Array(5, 10, 5);
  // var request = {
  //   chunk_size: chunk_size,
  //   wav_name: "h5",
  //   is_speaking: false,
  //   chunk_interval: 10,
  //   mode: "2pass",
  // };

  if (sampleBuf.length > 0) {
    // 假设你有一个二进制数据（例如，Uint8Array）
    const binaryData = new Uint8Array(sampleBuf); // 代表字节数据 "Hello"

    // 将二进制数据转换为 Base64
    const base64String = btoa(String.fromCharCode.apply(null, binaryData));

    window.$ws.wsSend(sampleBuf);
    // window.$ws.wsSend(JSON.stringify({ data: base64String, stop: true }));
    sampleBuf = new Int16Array();
  }
  window.$ws.wsSend(JSON.stringify({ stop: true }));
  // window.$ws.wsSend(JSON.stringify(request));
  isRec = false;

  if (isfilemode == false) {
    rec.stop(
      function (blob, duration) {
        var audioBlob = Recorder.pcm2wav(
          { sampleRate: 16000, bitRate: 16, blob: blob },
          function (theblob, duration) {
            if (callback) {
              callback(theblob, duration, rec_text);
            }
          },
          function (msg) {
            console.log(msg);
          }
        );
      },
      function (errMsg) {
        console.log("errMsg: " + errMsg);
      }
    );
  }
  // 停止连接
}

//切片 持续和后台通过websocket通信
export function recProcess(
  buffer,
  powerLevel,
  bufferDuration,
  bufferSampleRate,
  newBufferIdx,
  asyncEnd
) {
  if (isRec) {
    var data_48k = buffer[buffer.length - 1];
    var array_48k = new Array(data_48k);
    var data_16k = Recorder.SampleData(array_48k, bufferSampleRate, 16000).data;

    sampleBuf = Int16Array.from([...sampleBuf, ...data_16k]);
    var chunk_size = 960; // for asr chunk_size [5, 10, 5]
    // info_div.innerHTML = "" + bufferDuration / 1000 + "s";

    while (sampleBuf.length >= chunk_size) {
      var sendBuf = sampleBuf.slice(0, chunk_size);
      sampleBuf = sampleBuf.slice(chunk_size, sampleBuf.length);
      // 假设你有一个二进制数据（例如，Uint8Array）
      const binaryData = new Uint8Array(sendBuf); // 代表字节数据 "Hello"
      // 将二进制数据转换为 Base64
      const base64String = btoa(String.fromCharCode.apply(null, binaryData));
      window.$ws.wsSend(sendBuf);

      // window.$ws.wsSend(JSON.stringify({ data: base64String }));
      // window.$ws.wsSend(JSON.stringify({ data: base64String, stop: false }));
    }
    // console.log(sendBuf);
  }
}

export function getUseITN() {
  var obj = document.getElementsByName("use_itn");
  for (var i = 0; i < obj.length; i++) {
    if (obj[i].checked) {
      return obj[i].value === "true";
    }
  }
  return false;
}
export function addresschange() {
  var now_ipaddress = window.location.href;
  now_ipaddress = now_ipaddress.replace("https://", "wss://");
  now_ipaddress = now_ipaddress.replace("static/index.html", "");
  var localport = window.location.port;
  now_ipaddress = now_ipaddress.replace(localport, "8080");
  // document.getElementById("wssip").value =
  //   process.env.VUE_APP_AUDIO_INPUT_WSS_URI;

  var Uri = "wss//";
  // document.getElementById("info_wslink").innerHTML =
  //   "点此处手工授权（IOS手机）";
  Uri = Uri.replace(/wss/g, "https");
  console.log("addresschange uri=", Uri);

  // awsslink.onclick = function () {
  //   window.open(Uri, "_blank");
  // };
}

// upfile.onclick = function () {
//   btnStart.disabled = true;
//   btnStop.disabled = true;
//   btnConnect.disabled = false;
// };

// from https://github.com/xiangyuecn/Recorder/tree/master
var readWavInfo = function (bytes) {
  //读取wav文件头，统一成44字节的头
  if (bytes.byteLength < 44) {
    return null;
  }
  var wavView = bytes;
  var eq = function (p, s) {
    for (var i = 0; i < s.length; i++) {
      if (wavView[p + i] != s.charCodeAt(i)) {
        return false;
      }
    }
    return true;
  };

  if (eq(0, "RIFF") && eq(8, "WAVEfmt ")) {
    var numCh = wavView[22];
    if (wavView[20] == 1 && (numCh == 1 || numCh == 2)) {
      //raw pcm 单或双声道
      var sampleRate =
        wavView[24] +
        (wavView[25] << 8) +
        (wavView[26] << 16) +
        (wavView[27] << 24);
      var bitRate = wavView[34] + (wavView[35] << 8);
      var heads = [wavView.subarray(0, 12)],
        headSize = 12; //head只保留必要的块
      //搜索data块的位置
      var dataPos = 0; // 44 或有更多块
      for (var i = 12, iL = wavView.length - 8; i < iL; ) {
        if (
          wavView[i] == 100 &&
          wavView[i + 1] == 97 &&
          wavView[i + 2] == 116 &&
          wavView[i + 3] == 97
        ) {
          //eq(i,"data")
          heads.push(wavView.subarray(i, i + 8));
          headSize += 8;
          dataPos = i + 8;
          break;
        }
        var i0 = i;
        i += 4;
        i +=
          4 +
          wavView[i] +
          (wavView[i + 1] << 8) +
          (wavView[i + 2] << 16) +
          (wavView[i + 3] << 24);
        if (i0 == 12) {
          //fmt
          heads.push(wavView.subarray(i0, i));
          headSize += i - i0;
        }
      }
      if (dataPos) {
        var wavHead = new Uint8Array(headSize);
        for (var i = 0, n = 0; i < heads.length; i++) {
          wavHead.set(heads[i], n);
          n += heads[i].length;
        }
        return {
          sampleRate: sampleRate,
          bitRate: bitRate,
          numChannels: numCh,
          wavHead44: wavHead,
          dataPos: dataPos,
        };
      }
    }
  }
  return null;
};

function play_file() {
  var audioblob = new Blob([new Uint8Array(file_data_array)], {
    type: "audio/wav",
  });
  var audio_record = document.getElementById("audio_record");
  audio_record.src = (window.URL || webkitURL).createObjectURL(audioblob);
  audio_record.controls = true;
  //audio_record.play();  //not auto play
}
function start_file_send() {
  sampleBuf = new Uint8Array(file_data_array);

  var chunk_size = 960; // for asr chunk_size [5, 10, 5]

  while (sampleBuf.length >= chunk_size) {
    sendBuf = sampleBuf.slice(0, chunk_size);
    totalsend = totalsend + sampleBuf.length;
    sampleBuf = sampleBuf.slice(chunk_size, sampleBuf.length);
    window.$ws.wsSend(sendBuf);
  }

  stop();
}

// 语音识别结果; 对jsonMsg数据解析,将识别结果附加到编辑框中
export function getJsonMessage(jsonMsg) {
  if (store.state.chatType == 1) {
    EventBus.$emit("websocket-message", jsonMsg.data);
  } else {
    EventBus.$emit("websocket-message-online", jsonMsg.data);
  }
  return;
  console.log(typeof jsonMsg.data);
  if (jsonMsg.data["text"]) {
    console.log("message: " + JSON.parse(jsonMsg.data)["text"]);
    var rectxt = "" + JSON.parse(jsonMsg.data)["text"];
    var asrmodel = JSON.parse(jsonMsg.data)["mode"];
    var is_final = JSON.parse(jsonMsg.data)["is_final"];
    var timestamp = JSON.parse(jsonMsg.data)["timestamp"];
    if (asrmodel == "2pass-offline" || asrmodel == "offline") {
      offline_text = offline_text + rectxt; //直接拼接字符串
      rec_text = offline_text;
    } else {
      rec_text = rec_text + rectxt; //.replace(/ +/g,"");
    }
  } else {
    EventBus.$emit("websocket-message", jsonMsg.data);
  }

  // var varArea = document.getElementById("varArea");
  // var audio_record = document.getElementById("audio_record");
  //todo 此时根据返回结果判断是否要中断播放

  // varArea.value = rec_text;
  // console.log("rec_text: " + rec_text);

  // if (isfilemode == true && is_final == true) {
  //   console.log("call stop ws!");
  //   play_file();
  //   window.$ws.wsStop();

  // info_div.innerHTML = "请点击连接";

  // btnStart.disabled = true;
  // btnStop.disabled = true;
  // btnConnect.disabled = false;
  // }
}

// 连接状态响应
export function getConnState(connState) {
  if (connState === 0) {
    //on open
    if (isfilemode == true) {
      start_file_send();
    } else {
    }
  } else if (connState === 1) {
    stop();
  } else if (connState === 2) {
    stop();
    console.log("connecttion error");
  }
}
