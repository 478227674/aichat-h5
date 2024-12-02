import request from "@/utils/http";
export function sendMsgToService(data) {
  return request({
    url: "/avatar_reply",
    method: "post",
    data: data,
  });
}
