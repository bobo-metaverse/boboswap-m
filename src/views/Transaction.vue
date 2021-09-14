<template>
  <div class="transaction">
    <div class="transaction_nav">
      <span :class="navIndx == 1 ? 'active' : null" @click="navIndx = 1"
        >行情</span>
      <span :class="navIndx == 2 ? 'active' : null" @click="navIndx = 2"
        >交易</span>
      <span :class="navIndx == 3 ? 'active' : null" @click="navIndx = 3"
        >矿池</span>
      <!--span :class="navIndx == 4 ? 'active' : null" @click="navIndx = 4"
        >DAO</span-->
      <span :class="navIndx == 5 ? 'active' : null" @click="navIndx = 5"
        >Loot合成</span>
    </div>
    <Quotation v-if="navIndx == 1" :openTrade="openTrade"/>
    <Trade v-if="navIndx == 2"/>
    <Pool v-if="navIndx == 3" />
    <DAO v-if="navIndx == 4" />
    <Loot v-if="navIndx == 5" />
  </div>
</template>
<script>
import Trade from "../components/Trade/Trade";
import Quotation from "../components/Quotation/Quotation";
import Pool from "../components/Pool/Pool";
import DAO from "../components/DAO/DAO";
import Loot from "../components/Loot/Loot";
export default {
  name: "Transaction",
  components: { Trade, Quotation, Pool, DAO, Loot },
  data() {
    return {
      navIndx: 1, //行情1，交易2，矿池3
      pairInfo: ''
    };
  },
  methods: {
    openTrade(pairInfo) {
      //console.log(pairInfo);
      this.navIndx = 2;
      this.pairInfo = pairInfo;
    }
  },
};
</script>
<style lang="scss">
@import "../assets/styles/Trade/Transaction";
</style>