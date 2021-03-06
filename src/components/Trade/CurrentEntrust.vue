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
            <span v-if="order.bBuyQuoteToken" class="type_text_buy">买入[NFT-Id: {{order.id}}]</span>
            <span v-else class="type_text_sell">卖出[NFT-Id: {{order.id}}]</span>
          </div>
          <span v-if="executingTx" class="cancel">撤销</span>
          <span v-else class="cancel" @click="cancelOrder(order.id)">撤销</span>
        </div>
        <div class="data_info">
          <div class="small_box">
            <span class="info_title">下单价({{pairInfo.baseTokenName}})</span>
            <span class="info_num">{{getReadableNumber(order.spotPrice, 6, 2)}}</span>
          </div>
          <div class="small_box">
            <span class="info_title">下单数量({{order.bBuyQuoteToken ? pairInfo.baseTokenName : pairInfo.symbol}})</span>
            <span class="info_num">{{getReadableNumber(order.inAmount, order.bBuyQuoteToken ? 6 : pairInfo.decimals, 2)}}</span>
          </div>
          <div class="small_box">
            <span class="info_title">至少获得({{order.bBuyQuoteToken ? pairInfo.symbol : pairInfo.baseTokenName}})</span>
            <span class="info_num">{{getReadableNumber(order.minOutAmount, order.bBuyQuoteToken ? pairInfo.decimals : 6, 4)}}</span>
          </div>
          <div class="small_box info_time">
            <span class="info_title">时间</span>
            <span class="info_num">{{getValidTime(order.delegateTime)}}</span>
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
      boboPairHelper: this.$store.state.drizzle.contracts.BoboPairHelper,
      orderList: [],
      curStakeId: null,
      executingTx: false
    };
  },
  created() {
    this.updateHangingOrders();
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
    updateHangingOrders() {
      this.orderList = [];
      this.boboPairHelper.methods.getUserHangingOrderInfos(this.pairInfo.pairAddr, this.$store.state.account, 0, 100).call().then(orders => {
        for(var i = orders.orderInfos.length - 1; i--;) {
          this.orderList.push(orders.orderInfos[i]);
          if (i == 0) break;
        }
      });
    },
    cancelOrder(orderId) {
      this.curStakeId = this.pairContract.methods['cancelOrder'].cacheSend(orderId, { from: this.$store.state.account });
      this.syncTxStatus(
        orderId,
        () => {
          this.$emit("update");
          this.toast("success", "成功撤销订单");
        },
        () => {
          this.toast("error", "订单撤销失败");
        }
      );
    },
    syncTxStatus(orderId, successCallback, failCallback) {
      this.executingTx = true;
      const intervalId = setInterval(() => {
        // get the transaction states from the drizzle state
        //console.log(this.$drizzle);

        const drizzleState = this.$drizzle.store.getState();
        const { transactions, transactionStack } = drizzleState;

        // get the transaction hash using our saved `stackId`
        const txHash = transactionStack[this.curStakeId];
        //console.log("txHash", txHash, this.curStakeId, transactionStack);
        // if transaction hash does not exist, don't display anything
        if (!txHash) return;
        //console.log("transaction", transactions[txHash]);
        if (transactions[txHash]) {
          const status = transactions[txHash].status;
          if (status == "pending") return;

          this.executingTx = false;
          if (status == "success") {
            successCallback();
          } else {
            failCallback();
          }
          clearInterval(intervalId);
        }
        return;
      }, 3000);
    }
  },
};
</script>
<style lang="scss">
@import "../../assets/styles/Trade/CurrentEntrust.scss";
</style>
