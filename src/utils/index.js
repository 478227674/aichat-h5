/********对服务器端接口以及底层异步请求方法进行二次封装**********/
// 服务器根地址
export const base = process.env.VUE_APP_BASE_API + '/business'
//POST请求通用属性/
let postOptions = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'X-auth': localStorage.getItem('token')
  }
}
// post方法
export const myPostFetch = async function (url, params) {
  url = base + url
  let u = ''
  if (params) {
    let paramsArray = []
    //拼接参数
    Object.keys(params).forEach(key => paramsArray.push(key + '=' + params[key]))
    if (url.search(/\?/) === -1) {
      u += paramsArray.join('&')
    } else {
      u += '&' + paramsArray.join('&')
    }
  }
  let options = {
    ...postOptions,
    body: u
  }
  let res = await fetch(url, options)
  let data = await res.json()
  return data
}
