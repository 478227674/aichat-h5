/**
 * Vuex
 * http://vuex.vuejs.org/zh-cn/intro.html
 */
import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

const now = new Date();
const store = new Vuex.Store({
  state: {
    // 当前用户
    user: {
      name: "coffce",
      img: "https://img2.baidu.com/it/u=1310029438,409566289&fm=253&app=138&size=w931&n=0&f=JPEG&fmt=auto?sec=1732294800&t=7fb44f96d1ad0c507e44638810a32801",
    },
    // 会话列表
    sessions: [
      {
        id: 1,
        user: {
          name: "天津姐姐",
          img: "https://img1.baidu.com/it/u=3947465130,3009712317&fm=253&app=120&size=w931&n=0&f=JPEG&fmt=auto?sec=1732294800&t=653f092ae22adf4309c84563c257f4c9",
        },
        messages: [
          {
            content: "嘿，干嘛呢!我是你王姐，倍儿耐聊天儿，有嘛事儿跟姐说，",
            date: now,
            type: "text",
          },
          {
            content: "哦是吗，你是做什么工作的？",
            type: "text",
            date: "2024-11-15T01:32:40.730Z",
            self: true,
          },
        ],
      },
      {
        id: 2,
        user: {
          img: "https://nimg.ws.126.net/?url=http%3A%2F%2Fdingyue.ws.126.net%2F2023%2F0920%2Fbd326359j00s19oi9001wd000iw00iwm.jpg&thumbnail=660x2147483647&quality=80&type=jpg",
          name: "埃隆·马斯克",
        },
        messages: [],
      },
      {
        id: 3,
        user: {
          img: "https://img2.woyaogexing.com/2024/02/20/f63f0161cb1f48fc%21400x400.jpg",
          name: "Zoe",
        },
        messages: [],
      },
    ],
    // 当前选中的会话
    currentSessionId: 1,
    // 过滤出只包含这个key的会话
    filterKey: "",
  },
  mutations: {
    INIT_DATA(state) {
      let data = localStorage.getItem("vue-chat-session");
      if (data) {
        state.sessions = JSON.parse(data);
      }
    },
    // 发送消息
    SEND_MESSAGE({ sessions, currentSessionId }, data) {
      let session = sessions.find((item) => item.id === currentSessionId);
      session.user.lastMsg = data.type == "text" ? data.content : "[语音]";
      session.messages.push({
        content: data.content,
        type: data.type,
        date: new Date(),
        duration: data.duration || null,
        self: true,
      });
    },
    // 选择会话
    SELECT_SESSION(state, id) {
      state.currentSessionId = id;
    },
    // 搜索
    SET_FILTER_KEY(state, value) {
      state.filterKey = value;
    },
  },
  getters: {
    user: (state) => state.user,
    session: (state) =>
      state.sessions.find((session) => session.id === state.currentSessionId) ||
      [],
    sessions: ({ sessions, filterKey }) => {
      let result = sessions.filter((session) =>
        session.user.name.includes(filterKey)
      );
      return result;
    },
    chatUser: ({ currentSessionId, sessions }) =>
      sessions.find((item) => currentSessionId == item.id).user,
    // 当前会话index
    currentId: ({ currentSessionId }) => currentSessionId,
  },
});

store.watch(
  (state) => state.sessions,
  (val) => {
    console.log("CHANGE: ", val);
    localStorage.setItem("vue-chat-session", JSON.stringify(val));
  },
  {
    deep: true,
  }
);

export default store;
// export const actions = {
//   initData: ({ dispatch }) => dispatch("INIT_DATA"),
//   sendMessage: ({ dispatch }, content) => dispatch("SEND_MESSAGE", content),
//   selectSession: ({ dispatch }, id) => dispatch("SELECT_SESSION", id),
//   search: ({ dispatch }, value) => dispatch("SET_FILTER_KEY", value),
// };
