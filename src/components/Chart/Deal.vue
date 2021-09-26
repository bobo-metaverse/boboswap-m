<template>
  <div class="Deal">
    <div class="thead">
      <span class="fixed_width">时间</span><span class="fixed_width">方向</span
      ><span>价格({{pairInfo.baseTokenName}})</span><span>数量({{pairInfo.symbol}})</span>
    </div>
    <div
      class="list_one_side"
      v-for="(order, listIndex) in orderInfos"
      :key="listIndex"
    > 
      <div class="td_data">
        <span class="time">{{order.time}}</span>
        <span v-if="order.bBuyQuoteToken" class="buy">买入</span>
        <span v-else class="sell">卖出</span>
        <span class="price">{{order.price}}</span>
        <span class="num">{{order.amount}}</span>
      </div>
    </div>
  </div>
</template>
<script>
import BoboPair from "../../assets/contracts/abi/BoboPair.json";
import BigNumber from "bignumber.js";
export default {
  name: "Deal",
  data() {
    return {
      pairInfo: {},
      curPairContract: null,
      boboPairHelper: this.$store.state.drizzle.contracts.BoboPairHelper,
      lastDealedOrderNumber: 0,
      pageSize: 20,
      orderInfos: [],
      intervalId: 0,
    };
  },
  created:function() {
    this.pairInfo = JSON.parse(localStorage.getItem("CurPairInfo"))[this.$store.state.chainId];
    if (this.$store.state.drizzle.contracts[this.pairInfo.pairAddr] == null) {
      var pairContract = {
        contractName: this.pairInfo.pairAddr,
        web3Contract: new this.$store.state.web3.eth.Contract(BoboPair.abi, this.pairInfo.pairAddr)
      }
      this.$store.state.drizzle.addContract(pairContract, []);
    }
    this.curPairContract = this.$store.state.drizzle.contracts[this.pairInfo.pairAddr];
    
    this.syncDealedOrders();
    this.intervalId = setInterval(() => {
      this.syncDealedOrders();
    }, 5000);
  },
  destroyed: function() {
    clearInterval(this.intervalId);
  },
  methods: {
    syncDealedOrders() {
      this.curPairContract.methods.getOrderNumber(2).call().then(dealedOrderNumber => {
        if (this.lastDealedOrderNumber == dealedOrderNumber) return;
        this.orderInfos = [];
        this.lastDealedOrderNumber = dealedOrderNumber;
        const fromIndex = dealedOrderNumber - this.pageSize >= 0 ? dealedOrderNumber - this.pageSize : 0;
        this.boboPairHelper.methods.getOneStatusOrders(this.pairInfo.pairAddr, 2, fromIndex, this.pageSize).call().then(orderInfo => {
          const count = orderInfo.count;
          const orders = orderInfo.nftInfos;
          for (var i = count - 1; i >= 0; i--) {
            const order = orders[i];
            const time = this.getValidTime(order.dealedTime);
            const bBuyQuoteToken = order.bBuyQuoteToken;
            const price = this.getReadableNumber(order.spotPrice, 6, 2);
            const amount = order.bBuyQuoteToken ? this.getReadableNumber(order.outAmount, 18, 2) : this.getReadableNumber(order.inAmount, 18, 2);
            this.orderInfos.push({time, bBuyQuoteToken, price, amount});
          }
        });
      });
    },
    getReadableNumber(value, assetDecimal, displayDecimal) {
      let renderValue = new BigNumber(value);
      renderValue = renderValue.shiftedBy(assetDecimal * -1);

      let decimalPlaces = assetDecimal > 6 ? 6 : assetDecimal;
      if (renderValue.comparedTo(new BigNumber(0.000001)) < 0) {
        decimalPlaces = assetDecimal;
      }

      BigNumber.config({ DECIMAL_PLACES: displayDecimal == null ? decimalPlaces : displayDecimal });
      renderValue = renderValue.toString(10);
      return renderValue;
    },
    getValidTime(timestamp) {
      var renderTime = new BigNumber(timestamp);
      renderTime = renderTime.shiftedBy(3);
      var date = new Date(renderTime.toNumber());
      return date.format("MM/dd hh:mm:ss"); // +  '.' + (date.getMilliseconds() + 1000 + '').substr(1);
    },
  },
};
</script>
<style lang="scss" scoped>
@import "../../assets/styles/Chart/Deal";
</style>