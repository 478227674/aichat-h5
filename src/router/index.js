import Vue from "vue";
import VueRouter from "vue-router";
import Home from "@/views/index/index";
import Chat from "@/views/index/chat";
import voiceChat from "@/views/index/voiceChat";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "home",
    component: Home,
  },
  {
    path: "/chat",
    name: "Chat",
    component: Chat,
  },
  {
    path: "/voiceChat",
    name: "voiceChat",
    component: voiceChat,
  },
];

const router = new VueRouter({
  mode: "hash",
  base: process.env.BASE_URL,
  routes,
});

export default router;
