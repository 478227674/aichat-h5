const axios = require("axios");
const service = axios.create({
  baseURL: process.env.VUE_APP_AXIOS_URL,
  timeout: 5000, // request timeout
});
service.interceptors.request.use(
  (config) => {
    // if (getStorage("token")) {
    //   let token = 123;
    //   config.headers["token"] = token;
    // } else {
    // config.headers['token'] = 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJzenp6IiwiaXNzIjoic3p6eiIsInN6enpfcm9sZSI6IjI1MSIsImV4cCI6MTY4MzY5ODk1NCwiaWF0IjoxNjc1OTIyOTU0fQ.xDOaWWNnZfvxQ1vo74KNMDgndhUJxsLOYozuwhMHJWWBQjU4-CkbMX09DBlV19e5LRCGW3f0B9MOH6FMRKpPdw'
    // config.headers['token'] = 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJzenp6IiwiaXNzIjoic3p6eiIsInN6enpfcm9sZSI6Ijg5 MDQiLCJleHAiOjE2ODI2NDc3MTYsImlhdCI6MTY3NDg3MTcxNn0.9bxZH9DidhjTSKFQ_zMLKjNU0kpmCblniWkhLsTfxZhqqqo78nqDgATuQKR7NqsrkbKjZSbi2kPoFUg4NDb41g';
    // }
    // else {
    //   config.headers['token'] = 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJzenp6IiwiaXNzIjoic3p6eiIsInN6enpfcm9sZSI6Ijg5MDQiLCJleHAiOjE2NzQxMTk3NTAsImlhdCI6MTY2NjM0Mzc1MH0.cf6iX6akijM4xTpgJ3vIWrg0TynxwKFeL8rt7EKivCI63VF5gt81cituT64cNy4bUqDDPDgvUmdTd_kSuh6twA';
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

service.interceptors.response.use(
  (response) => {
    // 对响应数据做点什么
    if (response.data) {
      if (response.data.code === 200 || !response.data.code) {
        return response.data;
      } else if (response.data.code == 401) {
        //   removeStorage("token")
        //   toLogin()
      } else if (response.data.code == 201) {
        //   ElMessage.error(response.data.message)
        return Promise.reject(response.data.message);
      } else {
        //   ElMessage.error(response.data.message)
        return Promise.reject(response.data.message);
      }
    } else {
      // ElMessage.error(response.data.message)
    }
  },
  (error) => {
    // 对响应错误做点什么
    return Promise.reject(error);
  }
);
export default service;
