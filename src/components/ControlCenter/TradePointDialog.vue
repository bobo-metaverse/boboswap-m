<template>
  <div class="seting">
    <div class="seting_1">
      <span>充值金额</span>
    </div>
    <el-input
      placeholder="请输入大于等于1的数字"
      size="small"
      class="input1"
      v-model.number="depositAmount"
      type="number"
    >
      <template slot="append">USDT</template>
    </el-input>
    <el-button-group class="btngroup">
      <el-button size="mini" @click="handleClick(10)">10 U</el-button>
      <el-button size="mini" @click="handleClick(100)">100 U</el-button>
      <el-button size="mini" @click="handleClick(500)">500 U</el-button>
      <el-button size="mini" @click="handleClick(1000)">1000 U</el-button>
    </el-button-group>
    <el-input
      placeholder="填邀请码可享受充值奖励"
      size="small"
      class="input1"
      v-model.number="spreadCode"
    >
      <template slot="prepend">邀请码</template>
    </el-input>
    <div v-if="!approved" class="save" @click="approve">{{approving ? "授权中..." : "授权 -> 提交"}}</div>
    <div v-else class="save" @click="submit">提交</div>
  </div>
</template>
<script>
import BigNumber from "bignumber.js";
export default {
  name: "TradePointDialog",
  props: [],
  data() {
    return {
      exManager: this.$store.state.drizzle.contracts.EXManager,
      USDT: this.$store.state.drizzle.contracts.USDT,
      depositAmount: '',
      spreadCode: '',
      approving: false,
      approved: false,
      allowance: 0,
      curStakeId: 0,
    };
  },
  created() {
    this.USDT.methods.allowance(this.$store.state.account, this.exManager.address).call().then(v => {
      if (v > 0) {
        this.approved = true;
        this.allowance = v;
      }
    });
  },
  methods: {
    close() {
    },
    approve() {
      if (this.approving) return;
      this.curStakeId = this.USDT.methods['approve'].cacheSend(this.exManager.address, 
                                                              '0x' + new BigNumber(1).shiftedBy(30).toString(16),
                                                              { from: this.$store.state.account });
      this.approving = true;
      this.syncTxStatus(
        () => {
          this.approving = false;
          this.approved = true;
          this.toast("success", "授权成功，请点击提交按钮");
        },
        () => {
          this.approving = false;
          this.toast("error", "授权失败");
        }
      );
    },
    submit() {
      if (this.depositAmount < 1) {
        this.toast("error", "请输入大于等于1的数字");
        return;
      }
      const depositAmount = '0x' + new BigNumber(this.depositAmount).shiftedBy(6).toString(16);
      this.curStakeId = this.exManager.methods["buyTradePoints"].cacheSend(depositAmount, this.spreadCode, { from: this.$store.state.account });
      this.syncTxStatus(
        () => {
          this.toast("success", "充值成功");
        },
        () => {
          this.toast("error", "充值失败");
        }
      );
    },
    syncTxStatus(successCallback, failCallback) {
      this.executingTx = true;
      const intervalId = setInterval(() => {
        // get the transaction states from the drizzle state
        console.log(this.$drizzle);

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
    handleClick(v) {
      this.depositAmount = v;
    }
  },
};
</script>
<style lang="scss">
@import "../../assets/styles/base";
.seting {
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  .seting_1 {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    span {
      font-size: 13px;
      @include text-color(title-text);
      margin-right: 5px;
    }
    i {
      font-size: 18px;
      @include text-color(title-text);
    }
  }
  .input1,
  .btngroup {
    margin: 13px 0;
  }
  .btngroup {
    margin-bottom: 25px;
  }
  .save {
    width: 100%;
    height: 35px;
    background: #1da57a;
    color: #fff;
    text-align: center;
    line-height: 35px;
    margin-top: 20px;
    font-size: 14px;
  }
}

.el-input-group__append,
.el-input-group__prepend {
  @include bg-color(input-group);
  border: none;
}
.el-button {
  @include bg-color(input-group);
  @include text-color(title-text);
}
.el-button:focus,
.el-button:hover {
  @include bg-color(input-group);
  @include text-color(title-text);
}
</style>
