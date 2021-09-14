<template>
  <div class="seting">
    <div class="seting_1">
      <span>LP(Bobo-USDT)</span>
      <el-popover
        placement="top"
        width="200"
        trigger="click"
        content="请在QuickSwap上提供Bobo-USDT流动性以获得LP"
      >
        <i class="iconfont icon-help help" slot="reference"></i>
      </el-popover>
    </div>
    <el-input
      size="small"
      class="input1"
      v-model.number="lpAmountInput"
      type="number"
    >
    </el-input>
    <el-button-group class="btngroup">
      <el-button size="mini" @click="handleClick(20)">20%</el-button>
      <el-button size="mini" @click="handleClick(50)">50%</el-button>
      <el-button size="mini" @click="handleClick(80)">80%</el-button>
      <el-button size="mini" @click="handleClick(100)">100%</el-button>
    </el-button-group>
    <div v-if="!approved" class="save" @click="approve">{{approving ? '授权LP中...' : '授权LP'}}</div>
    <div v-else class="save" @click="submit">提交</div>
  </div>
</template>
<script>
import BigNumber from "bignumber.js";
import Pair from "../../assets/contracts/abi/ICommonPair.json";

export default {
  name: "DepositLPDialog",
  props: [],
  data() {
    return {
      lpAmount: 0,
      lpAmountInput: 0,
      quickBoboUsdtPair: null,
      quickBoboUsdtPairAddr: '0x8F4Cd73B3ebEa35c2Ef108BB5b058b034B7757b5',
      quickBoboUsdtPairName: 'quickPair4BoboUsdt',
      approved: false,
      allowance: 0,
      boboMasterChef: this.$store.state.drizzle.contracts.BoboMasterChef,
      boboMasterChefAddr: '',
      approving: false,
      boboUsdtPid: 0,
    };
  },
  created() {
    if (this.$store.state.drizzle.contracts[this.quickBoboUsdtPairName] == null) {
      var quickBoboUsdtContract = {
        contractName: this.quickBoboUsdtPairName,
        web3Contract: new this.$store.state.web3.eth.Contract(Pair.abi, this.quickBoboUsdtPairAddr)
      }
      this.$store.state.drizzle.addContract(quickBoboUsdtContract, []);
    }
    this.quickBoboUsdtPair = this.$store.state.drizzle.contracts[this.quickBoboUsdtPairName];
    this.quickBoboUsdtPair.methods.balanceOf(this.$store.state.account).call().then(v => {
      this.lpAmount = new BigNumber(v).shiftedBy(-18).toString();
      this.lpAmountInput = this.lpAmount;
    });
    this.boboMasterChefAddr = this.$store.state.drizzle.contracts.BoboMasterChef.address;
    this.quickBoboUsdtPair.methods.allowance(this.$store.state.account, this.boboMasterChefAddr).call().then(v => {
      if (v > 0) {
        this.approved = true;
        this.allowance = v;
      }
    });
  },
  methods: {
    close() {
      this.$emit("close");
    },
    save() {
      this.close();
    },
    approve() {
      if (this.approving) return;
      this.curStakeId = this.quickBoboUsdtPair.methods['approve'].cacheSend(this.boboMasterChefAddr, 
                                                                            '0x' + new BigNumber(1).shiftedBy(30).toString(16),
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
      this.boboMasterChef.methods['deposit'].cacheSend(this.boboUsdtPid, 
                                                      '0x' + new BigNumber(this.lpAmountInput).shiftedBy(18).toString(16),
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
