<template>
  <div class="pool">
    <div class="pool_item">
      <div class="poll_title">
        <span class="incons">
          <img src="../../assets/images/NFT.png" />
          <span class="asset">交易挖矿</span>
        </span>
        <span class="time_request">
          <span class="time_span">成交时间: [{{nftStartTimeStr}}, {{nftEndTimeStr}})</span>
          <span class="time_span">抵押挖矿起止区块: [{{startBlock}}, {{endBlock}}]</span>
        </span>
      </div>
      <div class="pool_center">
        <div class="left">
          <span>{{nftTotalWeight}}M 总权重</span>
          <span>{{nftAmount}} 抵押订单数量</span>
        </div>
        <div class="right">
          <span>{{minedBoboAmount4NFT}} Bobo</span>
          <span>可提取BoBo</span>
        </div>
      </div>
      <div class="pool_btn">
        <div class="mining_btn" @click="nftDepositedDialogVisible = true">抵押订单NFT</div>
        <div class="mining_btn" @click="nftWithdrawDialogVisible = true">解压订单NFT</div>
        <div class="mining_btn" @click="claimNFTBobo">提取Bobo</div>
      </div>
      <el-dialog
        title="抵押订单NFT"
        :visible="nftDepositedDialogVisible"
        width="90%"
        center
        @close="nftDepositedDialogVisible = false"
        :nftStartTime="nftStartTime"
        :nftEndTime="nftEndTime"
      >
        <DepositNFTDialog @close="closeNFTDepositDialog"/>
      </el-dialog>
      <el-dialog
        title="解压订单NFT"
        :visible="nftWithdrawDialogVisible"
        width="90%"
        center
        @close="nftWithdrawDialogVisible = false"
      >
        <WithdrawNFTDialog @close="closeNFTWithdrawDialog"/>
      </el-dialog>
    </div>
    <div class="pool_item">
      <div class="poll_title">
        <span class="incons">
          <img src="../../assets/images/usdt.png" />
          <span class="asset">USDT挂单挖矿</span>
        </span>
        <span class="asset">总APY {{usdtAPY + boboAPYInUsdt}}%</span>
      </div>
      <div class="pool_center">
        <div class="left">
          <span>{{hangingBoboAmountOfUsdt}} Bobo</span>
          <span>APY {{boboAPYInUsdt}}%</span>
        </div>
        <div class="right">
          <span>{{minedUsdtAmount}} USDT</span>
          <span>APY {{usdtAPY}}%</span>
        </div>
      </div>
      <div class="pool_btn">
        <div class="mining_btn" @click="claimBobo(true)">提取Bobo</div>
        <div class="mining_btn" @click="claim(true)">提取USDT</div>
      </div>
    </div>
    <div class="pool_item">
      <div class="poll_title">
        <span class="incons">
          <img src="../../assets/images/usdc.png" />
          <span class="asset">USDC挂单挖矿</span>
        </span>
        <span class="asset">总APY {{usdcAPY + boboAPYInUsdt}}%</span>
      </div>
      <div class="pool_center">
        <div class="left">
          <span>{{hangingBoboAmountOfUsdc}} Bobo</span>
          <span>APY {{boboAPYInUsdc}}%</span>
        </div>
        <div class="right">
          <span>{{minedUsdcAmount}} USDC</span>
          <span>APY {{usdcAPY}}%</span>
        </div>
      </div>
      <div class="pool_btn">
        <div class="mining_btn" @click="claimBobo(false)">提取Bobo</div>
        <div class="mining_btn" @click="claim(false)">提取USDC</div>
      </div>
    </div>
    <div class="pool_item">
      <div class="poll_title">
        <span class="incons">
          <img src="../../assets/images/usdt.png" />
          <img src="../../assets/images/boboLogo.png" class="bobo" />
          <span class="asset">Bobo/USDT</span>
        </span>
        <span class="asset">APY {{lpAPY}}%</span>
      </div>
      <div class="pool_center">
        <div class="left">
          <span>{{depositedLPAmount}}</span>
          <span>抵押LP数量</span>
        </div>
        <div class="right">
          <span>{{lpMinedBoboAmount}} Bobo</span>
          <span>可提取BoBo</span>
        </div>
      </div>
      <div class="pool_btn">
        <div class="mining_btn" @click="lpDepositedDialogVisible = true">抵押LP</div>
        <div class="mining_btn" @click="withdrawLP">解压LP</div>
        <div class="mining_btn" @click="withdrawBobo">提取Bobo</div>
      </div>
      <el-dialog
        title="抵押LP(Bobo-USDT)"
        :visible="lpDepositedDialogVisible"
        width="90%"
        center
        @close="lpDepositedDialogVisible = false"
      >
        <DepositLPDialog @close="closeLPDepositDialog"/>
      </el-dialog>
    </div>

    <div class="pool_item">
      <div class="poll_title">
        <span class="incons">
          <img src="../../assets/images/boboLogo.png" class="bobo" />
          <span class="asset">Bobo</span>
        </span>
        <span class="asset">APY {{boboAPY}}%</span>
      </div>
      <div class="pool_center">
        <div class="left">
          <span>{{depositedBoboAmount}}</span>
          <span>抵押Bobo数量</span>
        </div>
        <div class="right">
          <span>{{boboMinedBoboAmount}} Bobo</span>
          <span>可提取BoBo</span>
        </div>
      </div>
      <div class="pool_btn">
        <div class="mining_btn" @click="boboDepositedDialogVisible = true">抵押Bobo</div>
        <div class="mining_btn" @click="withdrawAllBobo">解压Bobo</div>
        <div class="mining_btn" @click="withdrawBoboByBobo">提取Bobo奖励</div>
      </div>
      <el-dialog
        title="抵押Bobo"
        :visible="boboDepositedDialogVisible"
        width="90%"
        center
        @close="boboDepositedDialogVisible = false"
      >
        <DepositBoboDialog @close="closeBoboDepositDialog"/>
      </el-dialog>
    </div>
  </div>
</template>
<script>
import BigNumber from "bignumber.js";
import DepositLPDialog from "./DepositLPDialog";
import DepositBoboDialog from "./DepositBoboDialog";
import DepositNFTDialog from "./DepositNFTDialog";
import WithdrawNFTDialog from "./WithdrawNFTDialog";
export default {
  name: "Pool",
  data() {
    return {
      nftAPY: 0,
      nftAmount: 0,
      nftStartTimeStr: '09/10 12:00',
      nftEndTimeStr: '10/10 12:00',
      nftStartTime: 0,
      nftEndTime: 0,
      startBlock: 0,
      endBlock: 0,
      nftTotalWeight: 0,
      minedBoboAmount4NFT: 0,
      usdtAPY: 0,
      usdcAPY: 0,
      boboAPYInUsdt: 0,
      boboAPYInUsdc: 0,
      lpAPY: 0,
      lpAmount: 0,
      boboAPY: 0,
      depositedLPAmount: 0,
      depositedBoboAmount: 0,
      minedUsdtAmount: 0,
      minedUsdcAmount: 0,
      hangingBoboAmountOfUsdt: 0,
      hangingBoboAmountOfUsdc: 0,
      usdtAddr: '',
      usdcAddr: '',
      lpMinedBoboAmount: 0,
      boboMinedBoboAmount: 0,
      lpDepositedDialogVisible: false,
      lpRedeemDialogVisible: false,
      boboUsdtPid: 0,
      boboPid: 1,
      boboMasterChef: null,
      boboDepositedDialogVisible: false,
      nftDepositedDialogVisible: false,
      nftWithdrawDialogVisible: false,
      boboFarmer4TradeMining: this.$store.state.drizzle.contracts.BoboFarmer4TradeMining,
    };
  },
  created() {
    this.syncHangingInfo();
    this.syncOnceNFTMiningPool();
    setInterval(()=> {
      this.syncBoboMasterChefInfo();
      this.syncNFTMiningPool();
    }, 3000);
  },
  components: { DepositLPDialog, DepositBoboDialog, DepositNFTDialog, WithdrawNFTDialog },
  methods: {
    syncHangingInfo() {
      console.log(this.$store.state.drizzle.contracts);
      const interverId = setInterval(() => {
          const boboFactory = this.$store.state.drizzle.contracts.BoboFactory;
          const boboFarmer = this.$store.state.drizzle.contracts.BoboFarmer;
          const boboPairHelper = this.$store.state.drizzle.contracts.BoboPairHelper;
          if (boboFactory == null || boboFarmer == null) return;
          // clearInterval(interverId);
          boboFactory.methods.USDT().call().then(usdtAddr => {
            this.usdtAddr = usdtAddr;
            boboPairHelper.methods
              .getTotalHangingTokenAmount(usdtAddr, this.$store.state.account)
              .call()
              .then((hangingUsdtAmount) => {
                this.hangingUsdtAmount = this.getReadableNumber(hangingUsdtAmount, 6, 6);
              });
            boboPairHelper.methods
              .getClaimBaseTokenAmount(usdtAddr, this.$store.state.account)
                .call()
                .then((minedUsdtAmount) => {
                  this.minedUsdtAmount = this.getReadableNumber(minedUsdtAmount, 6, 6);
                });
            boboFarmer.methods.pendingBOBO(usdtAddr, this.$store.state.account).call().then(pendingBoboAmount => {
                  this.hangingBoboAmountOfUsdt = this.getReadableNumber(pendingBoboAmount, 18, 2);
            });
          });

          boboFactory.methods.USDC().call().then(usdcAddr => {
            this.usdcAddr = usdcAddr;
            boboPairHelper.methods
              .getTotalHangingTokenAmount(usdcAddr, this.$store.state.account)
              .call()
              .then((hangingUsdcAmount) => {
                this.hangingUsdcAmount = this.getReadableNumber(hangingUsdcAmount, 6, 6);
              });
            boboPairHelper.methods
              .getClaimBaseTokenAmount(usdcAddr, this.$store.state.account)
                .call()
                .then((minedUsdcAmount) => {
                  this.minedUsdcAmount = this.getReadableNumber(minedUsdcAmount, 6, 6);
                });
            boboFarmer.methods.pendingBOBO(usdcAddr, this.$store.state.account).call().then(pendingBoboAmount => {
                  this.hangingBoboAmountOfUsdc = this.getReadableNumber(pendingBoboAmount, 18, 2);
            });
          });
          
        }, 3000);
    },
    syncBoboMasterChefInfo() {
      this.boboMasterChef = this.$store.state.drizzle.contracts.BoboMasterChef;
      this.boboMasterChef.methods.userInfoMap(this.boboUsdtPid, this.$store.state.account).call().then(userInfo => {
        this.depositedLPAmount = new BigNumber(userInfo.amount).shiftedBy(-18).toString();
      });
      this.boboMasterChef.methods.pendingBobo(this.boboUsdtPid, this.$store.state.account).call().then(boboAmount => {
        this.lpMinedBoboAmount = this.getReadableNumber(boboAmount, 18, 2);
      });
      this.boboMasterChef.methods.userInfoMap(this.boboPid, this.$store.state.account).call().then(userInfo => {
        this.depositedBoboAmount = this.getReadableNumber(userInfo.amount, 18, 2);
      });
      this.boboMasterChef.methods.pendingBobo(this.boboPid, this.$store.state.account).call().then(boboAmount => {
        this.boboMinedBoboAmount = this.getReadableNumber(boboAmount, 18, 2);
      });
    },
    syncNFTMiningPool() {
      this.boboFarmer4TradeMining.methods.userInfo(0, this.$store.state.account).call().then(userInfo => {
        this.nftTotalWeight = new BigNumber(userInfo.weight).shiftedBy(-6).toString();
      });
      this.boboFarmer4TradeMining.methods.getUserNFTNumber(this.$store.state.account).call().then(nftAmount => {
        this.nftAmount = nftAmount;
      });
      this.boboFarmer4TradeMining.methods.pendingBOBO(0, this.$store.state.account).call().then(boboAmount => {
        this.minedBoboAmount4NFT = this.getReadableNumber(boboAmount, 18, 2);
      });
    },
    syncOnceNFTMiningPool() {
      this.boboFarmer4TradeMining.methods.nftStartTime().call().then(startTime => {
        this.nftStartTime = parseInt(startTime);
        this.nftStartTimeStr = this.getValidTime(startTime);
      });
      this.boboFarmer4TradeMining.methods.nftEndTime().call().then(endTime => {
        this.nftEndTime = parseInt(endTime);
        this.nftEndTimeStr = this.getValidTime(endTime);
      });
      this.boboFarmer4TradeMining.methods.startBlock().call().then(startBlock => {
        this.startBlock = parseInt(startBlock);
      });
      this.boboFarmer4TradeMining.methods.endBlock().call().then(endBlock => {
        this.endBlock = parseInt(endBlock);
      });
    },
    closeLPDepositDialog(v) {
      this.lpDepositedDialogVisible = false;
    },
    closeBoboDepositDialog(v) {
      this.boboDepositedDialogVisible = false;
    },
    closeNFTDepositDialog(v) {
      this.nftDepositedDialogVisible = false;
    },
    closeNFTWithdrawDialog(v) {
      this.nftWithdrawDialogVisible = false;
    },
    claimNFTBobo() {
      this.curStakeId = this.boboFarmer4TradeMining.methods['withdraw'].cacheSend([], { from: this.$store.state.account });
      this.syncTxStatus(
        () => {
          this.toast("success", "成功提取收益");
        },
        () => {
          this.toast("error", "提取收益失败");
        }
      );
    },
    claim(bUsdt) {
      const boboFactory = this.$store.state.drizzle.contracts.BoboFactory;
      const boboPairHelper = this.$store.state.drizzle.contracts.BoboPairHelper;
      this.curStakeId = boboPairHelper.methods['claimBaseToken'].cacheSend(bUsdt ? this.usdtAddr : this.usdcAddr, { from: this.$store.state.account });
      this.syncTxStatus(
        () => {
          this.toast("success", "成功提取收益");
        },
        () => {
          this.toast("error", "提取收益失败");
        }
      );
    },
    claimBobo(bUsdt) {
      const boboFactory = this.$store.state.drizzle.contracts.BoboFactory;
      const boboPairHelper = this.$store.state.drizzle.contracts.BoboPairHelper;
      this.curStakeId = boboPairHelper.methods['claimBoboToken'].cacheSend(bUsdt ? this.usdtAddr : this.usdcAddr, { from: this.$store.state.account });
      this.syncTxStatus(
        () => {
          this.toast("success", "成功提取Bobo");
        },
        () => {
          this.toast("error", "提取Bobo失败");
        }
      );
    },
    withdrawLP() {
      this.curStakeId = this.boboMasterChef.methods['withdraw'].cacheSend(this.boboUsdtPid, 
                                                                          '0x' + new BigNumber(this.depositedLPAmount).shiftedBy(18).toString(16), 
                                                                          { from: this.$store.state.account });
      this.syncTxStatus(
        () => {
          this.toast("success", "成功取回LP");
        },
        () => {
          this.toast("error", "取回LP失败");
        }
      );
    },
    withdrawBobo() {
      this.curStakeId = this.boboMasterChef.methods['withdraw'].cacheSend(this.boboUsdtPid, 
                                                                          0, 
                                                                          { from: this.$store.state.account });
      this.syncTxStatus(
        () => {
          this.toast("success", "成功提取Bobo");
        },
        () => {
          this.toast("error", "提取Bobo失败");
        }
      );
    },
    withdrawAllBobo() {
      this.curStakeId = this.boboMasterChef.methods['withdraw'].cacheSend(this.boboPid, 
                                                                          '0x' + new BigNumber(this.depositedBoboAmount).shiftedBy(18).toString(16), 
                                                                          { from: this.$store.state.account });
      this.syncTxStatus(
        () => {
          this.toast("success", "成功解压Bobo");
        },
        () => {
          this.toast("error", "解压Bobo失败");
        }
      );
    },
    withdrawBoboByBobo() {
      this.curStakeId = this.boboMasterChef.methods['withdraw'].cacheSend(this.boboPid, 
                                                                          0, 
                                                                          { from: this.$store.state.account });
      this.syncTxStatus(
        () => {
          this.toast("success", "成功提取Bobo");
        },
        () => {
          this.toast("error", "提取Bobo失败");
        }
      );
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
    getValidTime(timestamp) {
      var renderTime = new BigNumber(timestamp);
      renderTime = renderTime.shiftedBy(3);
      var date = new Date(renderTime.toNumber());
      return date.format("MM/dd hh:mm"); // +  '.' + (date.getMilliseconds() + 1000 + '').substr(1);
    },
  },
};
</script>
<style lang="scss">
@import "../../assets/styles/Pool/Pool.scss";
</style>