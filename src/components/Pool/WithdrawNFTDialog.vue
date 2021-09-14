<template>
  <div class="seting">
    <div class="seting_1">
      <span>订单NFT-Ids</span>
      <el-popover
        placement="top"
        width="200"
        trigger="click"
        content="输入框中的订单ID对应的订单将会从矿池中取出"
      >
        <i class="iconfont icon-help help" slot="reference"></i>
      </el-popover>
    </div>
    <el-select multiple :disabled="allChecked" class="nft_selector" v-model="nftIds" @change="selectNftId" placeholder="请选择需要抵押的订单(可多选)">
      <el-option
        v-for="item in orderList"
        :key="item.id"
        :label="item.id"
        :value="item.id">
        <span style="float: left">订单NFT-ID:{{ item.id }}[权重:{{ item.weight }}]</span>
      </el-option>
    </el-select>
    <div class="seting_2">
      <span>已选订单总权重: {{totalWeight}}</span>
      <el-checkbox v-model="allChecked" @change="checkAllNfts">全部解压</el-checkbox>
    </div>
    
    <div class="save" @click="submit">提交</div>
  </div>
</template>
<script>
import BigNumber from "bignumber.js";
import BoboPair from "../../assets/contracts/abi/BoboPair.json";

export default {
  name: "WithdrawNFTDialog",
  props: [],
  data() {
    return {
      nftIds: '',
      orderList: [],
      boboFactory: this.$store.state.drizzle.contracts.BoboFactory,
      orderNFT: this.$store.state.drizzle.contracts.OrderNFT,
      boboPairHelper: this.$store.state.drizzle.contracts.BoboPairHelper,
      boboFarmer4TradeMining: this.$store.state.drizzle.contracts.BoboFarmer4TradeMining,
      approved: false,
      approving: false,
      loading: false,
      nftStartTime: 0,
      nftEndTime: 0,
      totalWeight: 0,
      nftId2Weight: {},
      allChecked: false,
      curStakeId: 0,
    };
  },
  created() {
    this.syncAllDepositedOrders();
  },
  methods: {
    syncAllDepositedOrders() {
      this.boboPairHelper.methods.getAllDepositedOrders(this.boboFarmer4TradeMining.address, this.$store.state.account).call().then(orderInfos => {
        console.log(orderInfos);
        for (var i = 0; i < orderInfos.length; i++) {
          this.nftId2Weight[orderInfos[i].id] = orderInfos[i].weight;
        }
        this.orderList = orderInfos;
      });
    },
    getValidTime(timestamp) {
      var renderTime = new BigNumber(timestamp);
      renderTime = renderTime.shiftedBy(3);
      var date = new Date(renderTime.toNumber());
      return date.format("MM/dd hh:mm:ss"); // +  '.' + (date.getMilliseconds() + 1000 + '').substr(1);
    },
    close() {
      this.$emit("close");
    },
    save() {
      this.close();
    },
    selectNftId(nftIds) {
      this.totalWeight = 0;
      nftIds.map(id => {
        this.totalWeight += parseInt(this.nftId2Weight[id]);
      })
    },
    checkAllNfts() {
      console.log(this.allChecked);
      if (this.allChecked) {
        this.orderList.map(order => {
          this.totalWeight += parseInt(order.weight);
        })
      }
    },
    submit() {
      console.log(this.nftIds);
      if (this.allChecked) {
        this.curStakeId = this.boboFarmer4TradeMining.methods['withdrawAll'].cacheSend({ from: this.$store.state.account });
      } else {
        this.curStakeId = this.boboFarmer4TradeMining.methods['deposit'].cacheSend([this.nftIds],
                                                      { from: this.$store.state.account });
      }
      this.syncTxStatus(
        () => {
          this.toast("success", "抵押成功");
        },
        () => {
          this.toast("error", "抵押失败");
        }
      );
    },
    handleClick(v) {
      this.lpAmountInput = new BigNumber(this.lpAmount).multipliedBy(v).shiftedBy(-2).toString();
    },
    syncTxStatus(successCallback, failCallback) {
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
<style lang="scss">
@import "../../assets/styles/Pool/DepositLPDialog.scss";

</style>
