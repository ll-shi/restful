import {defalult_AccessToken,refresh_token} from './config.js'
import axios from 'axios'
// 解决请求参数问题。对参数格式进行转换。
// 如果请求参数的格式不是json，而是form-urlencoded的时候需要使用qs进行一个序列化。
import qs from 'qs';
// 解决可能会出现的精度问题
import JSONbig from 'json-bigint';
const refreshTokenReq = axios.create({
   baseURL:'http://www.llshi.com/api/',
   timeout:1000
})
// 创建一个刷新令牌的请求对象
const flashHttp = axios.create({
  baseURL:'http://www.llshi.com/api/'
})
const http = axios.create({
   baseURL:'http://www.llshi.com/api/',
   timeout:1000,
   transformResponse:[function(data){
     try{
      // 如果返回的是json类型进行一个解析。
       return JSONbig.parse(data);
     }catch(error){
       return data;
     }
   }]
})
// 设置全局token
http.defaults.headers.common['Authorization'] = defalult_AccessToken;
// 给post请求设置content-type，处理表单提交问题
http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded'
// 添加请求拦截器。
http.interceptors.request.use(function(config){
  try{
    // 正常发送请求
    return config;
  }catch(error){
    // 网络问题，请求未发送出去。可以写一个提示组件。
    return Promise.reject(error)
  }
});
// 添加响应拦截器。
http.interceptors.response.use(async function(response){
  try{
    return response;
  }catch(error){
    // 响应失败
    const status = error.response.status;
    switch(status){
      case 400:
      console.log('客户请求参数异常');
      break;
      case 429:
      console.log('频繁请求');
      break;
      case 401:
      // token 无效
      flashToken(error);
      break;
      case 403:
      console.log('没有权限操作');
      break;
    }
    return Promise.reject(error);
  }
})
async function flashToken(user,error){
  if(!user && !user.token){
    return returnLogin();
  }
  try{
    // 使用刷新令牌来重新获取访问令牌
    const {data} = await flashToken({
      method:'PUT',
      url:'/app/autho',
      headers:{
        Authorization:refresh_token
      }
    })
    user.token = data.data.token;
    // 重新保存token在cookie中。
    // 重新发送失败的请求
    return http(error.config);
  }catch(error){
    // 刷新令牌也失效了，重新跳回登陆页面。
    returnLogin();
  }
}
function returnLogin(){
  return false;
}
// 创建一个取消令牌工厂
const CancelToken = axios.CancelToken;
// const source = CancelToken.source();
// // 生成取消令牌(注意可以使用相同的取消令牌取消多个请求)
// const cToken = source.token;
// console.log(cToken);
/**
 * 发送请求方式
 * axios.get(url,{params:{}})
 * axios.post(url,params)
 * axios({method:'post',url:'',data:{}})
 * axios({method:'get',url:'',responseType:'stream'})
 * promise.all()
 * axios(url,options) 默认是get请求
 * 在上传表单的时候一般content-type = 'multipart/form-data'
 */

/**
 * 状态码
 * 429 表示请求发送频繁
 */
var obj = qs.parse('a=c');
console.log(obj);
var str = qs.stringify({a:''});
console.log(qs.stringify({ a: 'æ' }, { charsetSentinel: true, charset: 'iso-8859-1' }));
// 对post，get请求做一个封装操作。
function post(url,params,format,isCancle=false){
  // isCancle表示该请求是否可以进行取消。
  format ? http.post(url,params) : (()=>{
    // 初始化参数格式
    switch(format){
      case 'json':
      format = 'application/x-www-form-urlencoded/json';
      break;
    }
    return true;
  })()&&http.post(url,params,{headers:format});  
}
// 添加请求取消机制
function cancle(url){
  // 根据url来取消请求。
}
// 初始化令牌
function initCancleToken(url){
  //
  let source = CancelToken.source();
  const TokenMap = [];
  TokenMap.poush({url:url,cancle:source.cancel});
  return source.token;
}
export {http,post}