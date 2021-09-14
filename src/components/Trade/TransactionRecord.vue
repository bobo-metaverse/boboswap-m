<template>
  <div class="TransactionRecord">
    <div
      class="list"
      v-for="(order, listIndex) in orderList"
      :key="listIndex"
    >
      <div class="list_item">
        <div class="type">
          <div class="type_left">
            <span v-if="order.bBuy" class="type_text_buy">买入[NFT-Id: {{order.id}}]</span>
            <span v-else class="type_text_sell">卖出[NFT-Id: {{order.id}}]</span>
          </div>
          <span v-if="order.status=='交易成功'" class="status status-success">{{order.status}}</span>
          <span v-else-if="order.status=='交易失败'" class="status status-fail">
            {{order.status}}
            <el-popover
              placement="top"
              width="200"
              trigger="click"
              :content="order.comment"
            >
              <i class="iconfont icon-help help" slot="reference"></i>
            </el-popover>
          </span>
          <span v-else class="status">{{order.status}}</span>
        </div>
        <div class="data_info">
          <div class="small_box">
            <span class="info_title">下单价({{pairInfo.baseTokenName}})</span>
            <span class="info_num">{{order.price}}</span>
          </div>
          <div class="small_box">
            <span class="info_title">下单数量({{order.bBuy ? pairInfo.baseTokenName : pairInfo.symbol}})</span>
            <span class="info_num">{{order.amountIn}}</span>
          </div>
          <div class="small_box">
            <span class="info_title">实际获得({{order.bBuy ? pairInfo.symbol : pairInfo.baseTokenName}})</span>
            <span class="info_num">{{order.amountOut}}</span>
          </div>
          <div class="small_box info_time">
            <span class="info_title">下单时间</span>
            <span class="info_num">{{order.startTime}}</span>
          </div>
          <div class="small_box info_time">
            <span class="info_title">终止时间</span>
            <span class="info_num">{{order.endTime}}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import OrderNFTABI from "../../assets/contracts/abi/OrderNFT.json";
import OrderDetailNFTABI from "../../assets/contracts/abi/OrderDetailNFT.json";
import BigNumber from "bignumber.js";
export default {
  props: ['peerToken', 'baseToken', "pairInfo"],
  name: "TransactionRecord",
  data() {
    return {
      pairContract: null,
      orderNFT: this.$store.state.drizzle.contracts.OrderNFT,
      orderList: [],
      lastIndex: 0
    };
  },
  created() {
    this.syncUnHangingOrders();
  },
  methods: {
    syncUnHangingOrders() {
      this.pairContract = this.$store.state.drizzle.contracts[this.pairInfo.pairAddr];
      this.pairContract.methods.getUserOrderNumber(this.$store.state.account).call().then(number => {
        var i = this.lastIndex == 0 ? number : this.lastIndex;
        while(i >= 0) {
          this.pairContract.methods.userOrdersMap(this.$store.state.account, i).call().then(id => {
            this.orderNFT.methods.id2NFTInfoMap(id).call().then(orderInfo => {
              if (orderInfo.status == '0') return;

              orderInfo.id = id;
              orderInfo.bBuy = orderInfo.bBuyQuoteToken;
              orderInfo.price = this.getReadableNumber(orderInfo.spotPrice, 6, 2);
              orderInfo.amountIn = this.getReadableNumber(orderInfo.inAmount, orderInfo.bBuy ? 6 : this.pairInfo.decimals, 2);
              orderInfo.amountOut = this.getReadableNumber(orderInfo.outAmount, orderInfo.bBuy ? this.pairInfo.decimals : 6, 4);
              orderInfo.startTime = this.getValidTime(orderInfo.delegateTime);
              orderInfo.endTime = this.getValidTime(orderInfo.dealedTime);
              orderInfo.status = orderInfo.status == '1' ? '已撤销' : (orderInfo.status == '2' ? '交易成功' : '交易失败');
              this.orderList.push(orderInfo);
            });
          });
          i--;
        }
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
<style lang="scss">
@import "../../assets/styles/Trade/TransactionRecord.scss";
</style>