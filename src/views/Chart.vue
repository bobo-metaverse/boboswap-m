<template>
  <div class="Chart">
    <div class="title">
      <i class="iconfont icon-left_2 left_icon" @click="back"></i>
      <span class="line"></span>
      <img :src="theme == 'dark' ? view_img1 : view_img2" />
      <!-- <img src="../assets/images/view_img1.png" /> -->
      <span class="text">{{pairInfo.symbol}}/{{pairInfo.baseTokenName}}</span>
    </div>
    <div class="data">
      <div class="data_left">
        <span class="red_data">{{pairInfo.currentPrice}} U</span>
        <div class="data_item2">
          <span>涨跌幅 {{pairInfo.price24HPercent}}%</span>
        </div>
      </div>
      <div class="data_right">
        <div class="right_item"><span>高</span><span>{{pairInfo.high24H}} U</span></div>
        <div class="right_item"><span>低</span><span>{{pairInfo.low24H}} U</span></div>
        <div class="right_item"><span>24H</span><span>{{pairInfo.volumnOf24Hours}} U</span></div>
      </div>
    </div>
    <ChartChild />
    <div class="list">
      <div class="list_nav">
        <span
          class="nav_text"
          :class="list_index == 1 ? 'list_nav_active' : null"
          @click="list_index = 1"
          >委托挂单</span
        >
        <span
          class="nav_text"
          :class="list_index == 2 ? 'list_nav_active' : null"
          @click="list_index = 2"
          >成交</span
        >
        <span
          class="nav_text"
          :class="list_index == 3 ? 'list_nav_active' : null"
          @click="list_index = 3"
          >简介</span
        >
      </div>
      <div class="list_box">
        <OrderRegistration v-if="list_index == 1" />
        <Deal v-if="list_index == 2" />
        <Introduction v-if="list_index == 3" />
      </div>
    </div>
    <div class="footer">
      <span class="buy" @click="makeOrder(false)">买入</span>
      <span class="sell" @click="makeOrder(true)">卖出</span>    
    </div>
  </div>
</template>
<script>
let view_img1 = require("../assets/images/view_img1.png");
let view_img2 = require("../assets/images/view_img3.png");
import ChartChild from "../components/Chart/TradeChart";
import OrderRegistration from "../components/Chart/OrderRegistration";
import Introduction from "../components/Chart/Introduction";
import Deal from "../components/Chart/Deal";
export default {
  name: "Chart",
  data() {
    return {
      list_index: 1,
      view_img1: view_img1,
      view_img2: view_img2,
      pairInfo: {}
    };
  },
  computed: {
    theme() {
      return this.$store.state.skin;
    },
  },
  created:function() {
    this.pairInfo = JSON.parse(localStorage.getItem("CurPairInfo"))[this.$store.state.chainId];
    console.log(this.pairInfo)
  },
  components: { ChartChild, OrderRegistration, Introduction, Deal },
  methods: {
    back() {
      this.$store.dispatch("chageHeader", true);
      this.$router.push("/home");
      localStorage.setItem("curIndex", 2);
      //this.$router.go(-1);
    },
    makeOrder(bSell) {
      this.$store.dispatch("chageHeader", true);
      this.$router.push("/home");
      localStorage.setItem("curIndex", 2);
      localStorage.setItem("bSell", bSell ? 1 : -1);
    },
    toggle() {},
  },
};
</script>
<style lang="scss" scoped>
@import "../assets/styles/Chart/Chart";
</style>