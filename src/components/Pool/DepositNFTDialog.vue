<template>
  <div class="seting">
    <div class="seting_1">
      <span>订单NFT-Ids</span>
      <el-popover
        placement="top"
        width="200"
        trigger="click"
        content="输入框中的订单ID对应的订单将被用于抵押挖矿"
      >
        <i class="iconfont icon-help help" slot="reference"></i>
      </el-popover>
    </div>
    <el-select multiple :disabled="checked" class="nft_selector" v-model="nftIds" @change="selectNftId" placeholder="请选择需要抵押的订单(可多选)">
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
      <el-checkbox v-model="checked" @change="checkAllNfts">全部抵押</el-checkbox>
    </div>
    
    <div v-if="!approved" class="save" @click="approve">{{approving ? '授权NFT中...' : '授权NFT'}}</div>
    <div v-else class="save" @click="submit">提交</div>
  </div>
</template>
<script>
import BigNumber from "bignumber.js";
import BoboPair from "../../assets/contracts/abi/BoboPair.json";

export default {
  name: "DepositNFTDialog",
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
      checked: false,
      curStakeId: 0
    };
  },
  created() {
    this.boboFarmer4TradeMining.methods.nftStartTime().call().then(startTime => {
      this.nftStartTime = parseInt(startTime);
      this.boboFarmer4TradeMining.methods.nftEndTime().call().then(endTime => {
        this.nftEndTime = parseInt(endTime);
        this.syncAllDealedOrders();
      });
    });
    this.orderNFT.methods.isApprovedForAll(this.$store.state.account, this.boboFarmer4TradeMining.address).call().then(approved => {
      this.approved = approved;
    });
  },
  methods: {
    syncAllDealedOrders() {
      this.boboFactory.methods.pairNumber().call().then(pairNumber => {
        pairNumber =parseInt(pairNumber);
        for (var i = 0; i < 1; i++) {
          this.boboFactory.methods.allPairs(i).call().then(pairAddr => {
            this.syncDealedOrdersOfOnePair(pairAddr);
          });
        }
      });
    },
    syncDealedOrdersOfOnePair(pairAddr) {
      console.log(pairAddr);
      this.boboPairHelper.methods.getDepositableOrders_old(pairAddr, this.$store.state.account, this.nftStartTime, this.nftEndTime).call().then(orderInfos => {
        console.log(orderInfos);
        const orderList = [];
        for (var i = 0; i < parseInt(orderInfos.count); i++) {
          const orderInfo = {id: parseInt(orderInfos.orderIds[i]), weight: orderInfos.weights[i]};
          orderList.push(orderInfo);
          this.nftId2Weight[orderInfo.id] = orderInfo.weight;
        }
        this.orderList = orderList;
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
    checkAllNfts() {
      console.log(this.checked);
      if (this.checked) {
        this.nftIds = [];
        this.totalWeight = 0;
        this.orderList.map(order => {
          this.nftIds.push(order.id);
          this.totalWeight += parseInt(order.weight);
        })
      }
    },
    selectNftId(nftIds) {
      this.totalWeight = 0;
      nftIds.map(id => {
        this.totalWeight += parseInt(this.nftId2Weight[id]);
      })
    },
    approve() {
      if (this.approving) return;
      this.curStakeId = this.orderNFT.methods['setApprovalForAll'].cacheSend(this.boboFarmer4TradeMining.address, 
                                                                             true,
                                                                             { from: this.$store.state.account });
      this.approving = true;
      this.syncTxStatus(
        () => {
          this.approving = false;
          this.approved = true;
          this.toast("success", "授权成功，请点击提交按钮进行挖矿");
        },
        () => {
          this.approving = false;
          this.toast("error", "授权失败");
        }
      );
    },
    submit() {
      console.log(this.nftIds);
      this.curStakeId = this.boboFarmer4TradeMining.methods['deposit'].cacheSend([...this.nftIds],
                                                      { from: this.$store.state.account });
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
