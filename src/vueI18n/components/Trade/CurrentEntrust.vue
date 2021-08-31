<template>
  <div class="CurrentEntrust">
    <div
      class="list"
      v-for="(order, listIndex) in orderList"
      :key="listIndex"
    >
      <div class="list_item">
        <div class="type">
          <div class="type_left">
            <span v-if="order.bBuy" class="type_text_buy">买入</span>
            <span v-else class="type_text_sell">买出</span>
          </div>
          <span class="cancel" @click="cancelOrder(order.id)">撤销</span>
        </div>
        <div class="data_info">
          <div class="small_box">
            <span class="info_title">价格({{pairInfo.baseTokenName}})</span>
            <span class="info_num">{{order.price}}</span>
          </div>
          <div class="small_box">
            <span class="info_title">数量({{pairInfo.symbol}})</span>
            <span class="info_num">{{order.amount}}</span>
          </div>
          <div class="small_box info_time">
            <span class="info_title">时间</span>
            <span class="info_num">{{order.time}}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import OrderNFTABI from "../../assets/contracts/abi/OrderNFT.json";
import BigNumber from "bignumber.js";
export default {
  props: ['peerToken', 'baseToken', "pairInfo"],
  name: "CurrentEntrust",
  data() {
    return {
      pairContract: null,
      orderNFT: this.$store.state.drizzle.contracts.OrderNFT,
      orderList: []
    };
  },
  created() {
    this.pairContract = this.$store.state.drizzle.contracts[this.pairInfo.pairAddr];
    this.pairContract.methods.getUserHangingOrderNumber(this.$store.state.account).call().then(number => {
      var i = 0;
      while(i < number) {
        this.pairContract.methods.getUserHangingOrderId(this.$store.state.account, i).call().then(id => {
          this.orderNFT.methods.id2NFTInfoMap(id).call().then(orderInfo => {
            var orderInfo;
            orderInfo.id = id;
            orderInfo.bBuy = orderInfo.bBuyQuoteToken;
            orderInfo.price = this.getReadableNumber(orderInfo.spotPrice, 6, 2);
            orderInfo.amount = this.getReadableNumber(orderInfo.bBuyQuoteToken ? orderInfo.minOutAmount : orderInfo.inAmount, this.pairInfo.decimals, 2);
            orderInfo.time = this.getValidTime(orderInfo.delegateTime);
            this.orderList.push(orderInfo);
          });
        });
        i++;
      }
    });
  },
  methods: {
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
      return date.toLocaleString(); // +  '.' + (date.getMilliseconds() + 1000 + '').substr(1);
    },
    cancelOrder(orderId) {

    }
  },
};
</script>
<style lang="scss">
@import "../../assets/styles/Trade/CurrentEntrust.scss";
</style>
