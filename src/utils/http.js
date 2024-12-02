// axios基础的封装
import axios from "axios";
import { Notification, MessageBox, Message, Loading } from "element-ui";
import errorCode from "@/utils/errorCode";
import cache from "@/plugins/cache";
export const baseURL = process.env.VUE_APP_BASE_API;

const httpInstance = axios.create({
  baseURL: baseURL,
  timeout: 600000,
});

// 是否显示重新登录
export let isRelogin = { show: false };
// axios请求拦截器
httpInstance.interceptors.request.use(
  (config) => {
    // 是否需要设置 token
    const isToken = (config.headers || {}).isToken === false;
    // 是否需要防止数据重复提交
    const isRepeatSubmit = (config.headers || {}).repeatSubmit === false;
    if (!isToken) {
      config.headers["x-auth"] = localStorage.getItem("token"); // 让每个请求携带自定义token 请根据实际情况自行修改
    }
    // get请求映射params参数
    if (config.method === "get" && config.params) {
      let url = config.url + "?" + tansParams(config.params);
      url = url.slice(0, -1);
      config.params = {};
      config.url = url;
    }
    if (
      !isRepeatSubmit &&
      (config.method === "post" || config.method === "put")
    ) {
      const requestObj = {
        url: config.url,
        data:
          typeof config.data === "object"
            ? JSON.stringify(config.data)
            : config.data,
        time: new Date().getTime(),
      };
      const sessionObj = cache.session.getJSON("sessionObj");
      if (
        sessionObj === undefined ||
        sessionObj === null ||
        sessionObj === ""
      ) {
        cache.session.setJSON("sessionObj", requestObj);
      } else {
        const s_url = sessionObj.url; // 请求地址
        const s_data = sessionObj.data; // 请求数据
        const s_time = sessionObj.time; // 请求时间
        const interval = 1000; // 间隔时间(ms)，小于此时间视为重复提交
        if (
          s_data === requestObj.data &&
          requestObj.time - s_time < interval &&
          s_url === requestObj.url
        ) {
          const message = "数据正在处理，请勿重复提交";
          console.warn(`[${s_url}]: ` + message);
          // return Promise.reject(new Error(message))
        } else {
          cache.session.setJSON("sessionObj", requestObj);
        }
      }
    }
    return config;
  },
  (e) => Promise.reject(e)
);

// axios响应式拦截器
// 响应拦截器
httpInstance.interceptors.response.use(
  (res) => {
    // 未设置状态码则默认成功状态
    const code = res.data.code || 200;
    // 获取错误信息
    const msg = errorCode[code] || res.data.msg || errorCode["default"];
    // 二进制数据则直接返回
    if (
      res.request.responseType === "blob" ||
      res.request.responseType === "arraybuffer"
    ) {
      return res.data;
    }
    if (code === 401) {
      if (!isRelogin.show) {
        isRelogin.show = true;
        MessageBox.confirm(
          "登录状态已过期，您可以继续留在该页面，或者重新登录",
          "系统提示",
          {
            confirmButtonText: "重新登录",
            cancelButtonText: "取消",
            type: "warning",
          }
        )
          .then(() => {
            isRelogin.show = false;
          })
          .catch(() => {
            isRelogin.show = false;
          });
      }
      return Promise.reject("无效的会话，或者会话已过期，请重新登录。");
    } else if (code === 500) {
      Message({ message: msg, type: "error" });
      return Promise.reject(new Error(msg));
    } else if (code === 601) {
      Message({ message: msg, type: "warning" });
      return Promise.reject("error");
    } else if (code != 200) {
      Notification.error({ title: msg });
      return Promise.reject("error");
    } else {
      return res.data;
    }
  },
  (error) => {
    let { message } = error;
    if (message == "Network Error") {
      message = "后端接口连接异常";
    } else if (message.includes("timeout")) {
      message = "系统接口请求超时";
    } else if (message.includes("Request failed with status code")) {
      // message = "系统接口" + message.substr(message.length - 3) + "异常";
    }
    // Message({ message: message, type: "error", duration: 5 * 1000 });
    return Promise.reject(error);
  }
);

// 数据查询文件下载
export function queryDownload(url, params, filename, config) {
  downloadLoadingInstance = Loading.service({
    text: "正在下载数据，请稍候",
    spinner: "el-icon-loading",
    background: "rgba(0, 0, 0, 0.7)",
  });
  return service({
    url: url, //用于请求的服务器 URL
    data: params, //必须是一个无格式对象(plain object)或 URLSearchParams 对象
    method: "post", //请求时使用的方法,get默认
    responseType: "blob", //表示服务器响应的数据类型，可以是 'arraybuffer', 'blob', 'document', 'json'(默认), 'text', 'stream'
  })
    .then((data) => {
      if (!data) return alert("文件下载失败");
      const blob = new Blob([data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      let fileName = "数据查询";
      if (typeof window.navigator.msSaveBlob !== "undefined") {
        window.navigator.msSaveBlob(blob, fileName + ".xlsx");
      } else {
        let url = window.URL.createObjectURL(blob);
        let link = document.createElement("a");
        link.style.display = "none";
        link.href = url;
        link.setAttribute("download", fileName + ".xlsx");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link); //下载完成移除元素
        window.URL.revokeObjectURL(url); //释放掉blob对象
        downloadLoadingInstance.close();
      }
    })
    .catch((err) => {
      Message.error("下载文件出现错误，请联系管理员！");
      downloadLoadingInstance.close();
    });
}
export default httpInstance;
