import Vue from 'vue'
import App from './App.vue'
import router from './router'
import {store} from './store/index'
import i18n from './vueI18n/i18n'
import axios from 'axios'
import qs from 'qs'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import API from './assets/js/Common/API';
import Base from './assets/js/Common/base';

require('./assets/font/Source Han Sans CN Regular.css');
require ('./assets/iconfont/iconfont.css')
// require('./assets/js/element')

Vue.use(ElementUI);
Vue.config.productionTip = false
Vue.prototype.$axios = axios
Vue.prototype.$API = API
Vue.prototype.$Base = Base

axios.defaults.baseURL = '';

// 请求拦截
axios.interceptors.request.use(
  config => {
    if (config.method == 'post') {
      config.data = qs.stringify(config.data);
    }

    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// 响应拦截
axios.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    // 错误提醒
    return Promise.reject(error);
  }
);

//消息提示
Vue.prototype.toast = function (type,msg){
  this.$message({
    showClose: true,
    message: msg,
    type:type
  });
}

Date.prototype.format = function (fmt) {
  var o = {
      "M+": this.getMonth() + 1, //月份
      "d+": this.getDate(), //日
      "h+": this.getHours(), //小时
      "m+": this.getMinutes(), //分
      "s+": this.getSeconds(), //秒
      "q+": Math.floor((this.getMonth() + 3) / 3), //季度
      "S": this.getMilliseconds() //毫秒
  };
  if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
  for (var k in o)
      if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
  return fmt;
}


new Vue({
  router,
  store,
  i18n,
  render: h => h(App)
}).$mount('#app')
