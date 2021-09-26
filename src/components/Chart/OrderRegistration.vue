<template>
  <div class="OrderRegistration">
    <div class="thead">
      <span>买盘 数量({{pairInfo.symbol}})</span><span>价格({{pairInfo.baseTokenName}})</span
      ><span>数量({{pairInfo.symbol}}) 卖盘</span>
    </div>
    <div class="order_list">
      <div class="tdata">
        <div
          class="list_one_side"
          v-for="(order, listIndex) in buyList"
          :key="listIndex"
        > 
          <div class="order_item_buy">
            <span>{{getReadableNumber(order.amount, 18, 2)}}</span>
            <span>{{order.price}}</span>
          </div>
        </div>
      </div>

      <div class="tdata">
        <div
          class="list_one_side"
          v-for="(order, listIndex) in sellList"
          :key="listIndex"
        > 
          <div class="order_item_sell">
            <span>{{order.price}}</span>
            <span>{{getReadableNumber(order.amount, 18, 2)}}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import BoboPair from "../../assets/contracts/abi/BoboPair.json";
import BigNumber from "bignumber.js";
export default {
  name: "OrderRegistration",
  data() {
    return {
      pairInfo: {},
      curPairContract: null,
      orderSize: 100,
      orderListedSize: 20,
      buyList: [],
      sellList: [],
      intervalId: 0,
      lastBuyNumber: 0,
      lastSellNumber: 0
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
    this.syncBuyOrders();
    this.syncSellOrders();
    this.intervalId = setInterval(() => {
      this.syncBuyOrders();
      this.syncSellOrders();
    }, 5000);
  },
  destroyed: function() {
    clearInterval(this.intervalId);
  },
  methods: {
    syncBuyOrders() {
      this.curPairContract.methods.getTotalOrderNumber(true).call().then(number => {
        number = parseInt(number);
        if (number == 0 || this.lastBuyNumber == number) return;
        this.buyList = [];
        this.lastBuyNumber = number;
        this.curPairContract.methods.getOrderInfos(true, 0, number > this.orderSize ? this.orderSize : number).call().then(orderInfos => {
          const length = orderInfos.length;
          var i = 0;
          var buyListLength = 0;
          while(i < length && buyListLength < this.orderListedSize) {
            const amount = new BigNumber(orderInfos[i].minOutAmount);
            const price = this.getReadableNumber(orderInfos[i].spotPrice, 6, 2);
            buyListLength = this.buyList.length;
            if (buyListLength > 0 && this.buyList[buyListLength - 1].price == price) {
              this.buyList[buyListLength - 1].amount = this.buyList[buyListLength - 1].amount.plus(amount);
            } else {
              this.buyList.push({price, amount});
            }
            i++;
          }
          console.log('this.buyList', this.buyList);
        });
      });
    },
    syncSellOrders() {
      this.curPairContract.methods.getTotalOrderNumber(false).call().then(number => {
        number = parseInt(number);
        if (number == 0 || this.lastSellNumber == number) return;
        this.sellList = [];
        this.lastSellNumber = number;
        this.curPairContract.methods.getOrderInfos(false, 0, number > this.orderSize ? this.orderSize : number).call().then(orderInfos => {
          const length = orderInfos.length;
          var i = 0;
          var sellListLength = 0;
          while(i < length && sellListLength < this.orderListedSize) {
            const amount = new BigNumber(orderInfos[i].inAmount);
            const price = this.getReadableNumber(orderInfos[i].spotPrice, 6, 2);
            sellListLength = this.sellList.length;
            if (sellListLength > 0 && this.sellList[sellListLength - 1].price == price) {
              this.sellList[sellListLength - 1].amount = this.sellList[sellListLength - 1].amount.plus(amount);
            } else {
              this.sellList.push({price, amount});
            }
            i++;
          }
          console.log('this.sellList', this.sellList);
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
  },
};
</script>
<style lang="scss" scoped>
@import "../../assets/styles/Chart/OrderRegistration";
</style>