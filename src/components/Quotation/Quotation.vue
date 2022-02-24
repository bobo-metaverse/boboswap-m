<template>
  <div class="quotation">
    <div class="quotation_nav">
      <div class="nav_left">
        <!-- <span>自选</span> -->
        <span
          v-for="(item, index) in baseTokenList"
          :key="index"
          :class="activeIndex == index ? 'active' : null"
          @click="changeActiveIndex(index)"
          >{{ item.id }}</span
        >
      </div>
      <!-- <img src="../../assets/images/search.png" @click="goSearch" /> -->
    </div>

    <div class="filter">
      <div class="filter_left">
        <div class="left_box">
          <span class="text">名称</span>
          <span class="filter_imgs">
            <i class="iconfont icon-up"></i>
            <i class="iconfont icon-down"></i>
          </span>
        </div>
        <div class="left_box">
          <span class="text">24H额</span>
          <span class="filter_imgs">
            <i class="iconfont icon-up"></i>
            <i class="iconfont icon-down"></i>
          </span>
        </div>
      </div>

      <div class="filter_left">
        <div class="left_box">
          <span class="text">当前价</span>
          <span class="filter_imgs">
            <i class="iconfont icon-up"></i>
            <i class="iconfont icon-down"></i>
          </span>
        </div>
        <div class="left_box" style="margin-right: 0">
          <span class="text">涨跌幅</span>
          <span class="filter_imgs">
            <i class="iconfont icon-up"></i>
            <i class="iconfont icon-down"></i>
          </span>
        </div>
      </div>
    </div>
    <!-- list_data -->
    <div
      class="list"
      v-for="(list, listIndex) in baseTokenList"
      :key="listIndex"
      v-show="listIndex == activeIndex"
    >
      <div class="list_item" v-for="(item, index) in list.data" :key="index" @click="openTradePage(item)">
        <div class="item_left">
          <div class="text1">
            <span>{{ item.symbol }}</span
            ><span>/ {{ item.baseTokenName }}</span>
          </div>
          <div class="text2">24H额 {{item.volumnOf24Hours}} U</div>
        </div>
        <div class="item_right">
          <div class="right_div1"><span>{{item.currentPrice}} U</span></div>
          <span class="right_div2" :class="item.price24HPercent > 0 ? 'up' : 'down'"
            >{{ item.price24HPercent > 0 ? "+" : null }}{{ item.price24HPercent }}%</span
          >
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import axios from 'axios';

const aa = [];
export default {
  name: "Quotation",
  props: ["openTrade"],
  data() {
    return {
      baseTokenList: [],
      intervalId: 0,
      activeIndex: 0,
      syncCount: 0
    };
  },
  computed: {
    chainId() {
      return this.$store.state.chainId;
    },
  },
  async created() {
    //console.log(this.chainId);
    //console.log(this.$store.state.hangqing);
    this.showPairList();
    this.intervalId = setInterval(this.showPairList, 5000);
  },

  methods: {
    showPairList() {
      let pairInfos = this.$store.state.hangqing;
      let pairListByBaseToken = {};
      Object.keys(pairInfos).forEach((pairKey) => {
          const tokenNames = pairKey.split('-');
          const baseTokenName = tokenNames[1];
          if (!pairListByBaseToken[baseTokenName]) {
            pairListByBaseToken[baseTokenName] = [pairInfos[pairKey]];
          } else {
            pairListByBaseToken[baseTokenName].push(pairInfos[pairKey]);
          }
      });
      let allPairList = [];
      Object.keys(pairListByBaseToken).forEach((baseTokenName) => {
        allPairList.push({
          id: baseTokenName,
          data: pairListByBaseToken[baseTokenName],
        });
      });
      this.baseTokenList = allPairList;
    },
    changeActiveIndex(index) {
      this.activeIndex = index;
    },
    goSearch() {
      this.$store.dispatch("chageHeader", false);
      this.$router.push("/search");
    },
    openTradePage(curPairInfo) {
      const chainId = this.$store.state.chainId;
      const pairInfo = {};
      pairInfo[chainId] = curPairInfo;
      localStorage.setItem("CurPairInfo", JSON.stringify(pairInfo));
      this.openTrade(curPairInfo);
    }
  },
};
</script>
<style lang="scss">
@import "../../assets/styles/Quotation/Quotation.scss";
</style>