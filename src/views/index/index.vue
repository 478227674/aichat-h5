<template>
  <div class="page-continer">
    <div class="page-head">
      <span class="page-head-title">对话</span>
    </div>
    <div class="chat-list-continer">
      <ul class="chat-list">
        <li
          @click="onChat(item)"
          v-for="item in sessions"
          :key="item.id"
          class="chat-list-item"
        >
          <div class="chat-user-head">
            <img :src="item.user.img" alt="" />
          </div>
          <div class="chat-user-detail">
            <span>{{ item.user.name }}</span>
            <p>{{ item.user.lastMsg || "暂无消息" }}</p>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  data() {
    return {
      chatList: [],
    };
  },
  computed: {
    ...mapGetters(["sessions"]), // 映射 Vuex 的 getters
  },
  methods: {
    onChat(data) {
      this.$store.commit("SELECT_SESSION", data.id);
      this.$router.push("/chat");
    },
  },
};
</script>

<style></style>
