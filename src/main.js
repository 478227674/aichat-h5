import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import Vant from "vant/lib/index.js";
import "vant/lib/index.css";

import WebSocketConnectMethod from "@/assets/js/wsconnecter";
import { getJsonMessage, getConnState } from "@/utils/chat/audio/main";
// 连接; 定义socket连接类对象与语音对象
var wsconnecter = new WebSocketConnectMethod({
  msgHandle: getJsonMessage,
  stateHandle: getConnState,
  uri: process.env.VUE_APP_AUDIO_INPUT_WSS_URI,
});
window.$ws = wsconnecter;
window.$ws.wsStart();

window.$audioContext = new (window.AudioContext || window.webkitAudioContext)();
window.$source = window.$audioContext.createBufferSource();

Vue.config.productionTip = false;

import VConsole from "vconsole";
const vConsole = new VConsole();
// css适配
// import "@/utils/flexible";
// // 引入element
// import "../src/plugins/element.js";
// // Element CSS样式
// import "element-ui/lib/theme-chalk/index.css";
// 引入全局样式
import "./CSS/base.css";
import "./CSS/chat.less";

// // fade/zoom 等
// import "element-ui/lib/theme-chalk/base.css";
// // axios
// import axios from "axios";
// import VueAxios from "vue-axios";
// Vue.use(VueAxios, axios);
import vconsole from "vconsole";
// 切换大图配置
import Viewer from "v-viewer";
import "viewerjs/dist/viewer.css";
Vue.use(Viewer);
Vue.use(Vant);
Viewer.setDefaults({
  Options: {
    inline: true, // 是否启用inline模式
    button: true, // 是否显示右上角关闭按钮
    navbar: true, // 是否显示缩略图底部导航栏
    title: true, // 是否显示当前图片标题，默认显示alt属性内容和尺寸
    toolbar: true, // 是否显示工具栏
    tooltip: true, // 放大或缩小图片时，是否显示缩放百分比，默认true
    fullscreen: true, // 播放时是否全屏，默认true
    loading: true, // 加载图片时是否显示loading图标，默认true
    loop: true, // 是否可以循环查看图片，默认true
    movable: true, // 是否可以拖得图片，默认true
    zoomable: true, // 是否可以缩放图片，默认true
    rotatable: true, // 是否可以旋转图片，默认true
    scalable: true, // 是否可以翻转图片，默认true
    toggleOnDblclick: true, // 放大或缩小图片时，是否可以双击还原，默认true
    transition: true, // 使用 CSS3 过度，默认true
    keyboard: true, // 是否支持键盘，默认true
    zoomRatio: 0.4, // 鼠标滚动时的缩放比例，默认0.1
    minZoomRatio: 0.01, // 最小缩放比例，默认0.01
    maxZoomRatio: 100, // 最大缩放比例，默认100
    url: "data-source", // 设置大图片的 url
  },
});

// 路由进度条
import NProgress from "nprogress";
import "nprogress/nprogress.css";
NProgress.configure({
  easing: "ease", // 动画方式
  speed: 500, // 递增进度条的速度
  showSpinner: false, // 是否显示加载ico
  trickleSpeed: 200, // 自动递增间隔
  minimum: 0.3, // 初始化时的最小百分比
});
//当路由进入前
router.beforeEach((to, from, next) => {
  // 每次切换页面时，调用进度条
  NProgress.start();
  // 若加载时间长且不定，担心进度条走完都没有加载完，可以调用
  NProgress.inc(); //这会以随机数量递增，且永远达不到100%，也可以设指定增量
  next();
});
//当路由进入后：关闭进度条
router.afterEach(() => {
  // 在即将进入新的页面组件前，关闭掉进度条
  NProgress.done();
});
new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount("#app");
