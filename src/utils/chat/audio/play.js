export default function AudioContext() {
  try {
    //授权播放
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(function (mediaStream) {
        console.log(mediaStream);
      })
      .catch(function (error) {
        console.log(error);
      });
  } catch {
    alert("播放授权失败");
  }
  /**
   *
   * @param {二进制文件数组} audioDataBuffer
   * @param {播放数组下标} audioIndex
   * @param {多少个单位播放一次} playNum
   */
  this.playAudio = function (
    audioDataBuffer,
    audioIndex,
    playNum = 50,
    callback
  ) {
    let audioContext = new (window.AudioContext || window.webkitAudioContext)();
    let source = audioContext.createBufferSource();
    let playBuffer = audioDataBuffer.slice(audioIndex, audioIndex + playNum);

    const audioBuffer = playBuffer.reduce((acc, chunk) => {
      const chunkArray = new Int32Array(chunk); // 假设音频数据是 32 位整型
      return acc.concat(Array.from(chunkArray));
    }, []);

    // 将数据转换为 Float32Array 以用于播放
    const floatArray = new Float32Array(audioBuffer.length);
    for (let i = 0; i < audioBuffer.length; i++) {
      floatArray[i] = audioBuffer[i] / Math.pow(2, 31); // 将 32 位整型数据归一化
    }

    const buffer = audioContext.createBuffer(1, floatArray.length, 24000);
    buffer.copyToChannel(floatArray, 0);

    source.buffer = buffer;

    //监听本次播放的this.playNum个单位的语音流 播放完成后count
    source.onended = function (res) {
      console.log("播放完了");

      // _this.audioIndex = _this.audioIndex + _this.playNum;
      // this.count = 0;
      // _this.playAudioStream();
    };
    source.connect(audioContext.destination);
    source.start();
    // this.isPlaying = true;
  };
}
