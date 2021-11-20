<template>
  <div class="trade">
    <div class="trade_view">
      <div class="view_left">
        <!-- <img :src="theme == 'dark' ? view_img1 : view_img2" /> -->
        <span class="assets">{{pairInfo.symbol}}/{{pairInfo.baseTokenName}}</span>
        <span class="rate">{{ pairInfo.price24HPercent > 0 ? "+" : null }}{{ pairInfo.price24HPercent }}%</span>
      </div>
      <div class="view_right">
        <img src="../../assets/images/view_img2.png" @click="chart" />
        <i class="iconfont icon-more more"  @click="updateAll"></i>
      </div>
    </div>
    <div class="trade_view2">
      <div class="view2_left">
        <div class="btns">
          <span :class="buy_sell ? 'buy' : null" @click="clickBuyBtn"
            >买入</span
          >
          <span :class="!buy_sell ? 'sell' : null" @click="clickSellBtn"
            >卖出</span
          >
        </div>
        <div class="input_i">
          <el-select
            v-model="delegateType"
            size="medium"
            popper-class="select_down"
            style="width: 100%; height: auto"
            placeholder="请选择委托类型"
          >
            <el-option
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </div>
        <div v-if="delegateType == 'limitedDelegate'">
          <el-input-number
          size="medium"
          v-model="limitedPrice"
          :precision="2"
          :step="0.01"
          :max="100000"
          style="width: 100%"
        ></el-input-number>
        </div>
        <div v-else class="market_tip">
          <span class="position">
            <el-input
              class="tip"
              style="font-size: 12px"
              
              placeholder="通过聚合交易获取最佳收益"
            ></el-input>
          </span>
        </div>
      </div>
      <div class="view2_right">
        <div class="title">
          <span>价格</span>
          <span>数量</span>
        </div>
        <div class="amount_item">
          <span class="sell_price">{{sellList[4].price}}</span>
          <span class="orderAmount">{{this.getReadableNumber(sellList[4].amount, 18, 3)}}</span>
          <div class="bg"></div>
        </div>
        <div class="amount_item">
          <span class="sell_price">{{sellList[3].price}}</span>
          <span class="orderAmount">{{this.getReadableNumber(sellList[3].amount, 18, 3)}}</span>
          <div class="bg" style="width: 30%"></div>
        </div>
        <div class="amount_item">
          <span class="sell_price">{{sellList[2].price}}</span>
          <span class="orderAmount">{{this.getReadableNumber(sellList[2].amount, 18, 3)}}</span>
          <div class="bg" style="width: 40%"></div>
        </div>
        <div class="amount_item">
          <span class="sell_price">{{sellList[1].price}}</span>
          <span class="orderAmount">{{this.getReadableNumber(sellList[1].amount, 18, 3)}}</span>
          <div class="bg" style="width: 50%"></div>
        </div>
        <div class="amount_item">
          <span class="sell_price">{{sellList[0].price}}</span>
          <span class="orderAmount">{{this.getReadableNumber(sellList[0].amount, 18, 3)}}</span>
          <div class="bg" style="width: 80%"></div>
        </div>
      </div>
    </div>
    <div class="view_cny"></div>
    <div class="shuliang">
      <span class="position">
        <el-input
          placeholder="数量"
          class="shuliang_input"
          style="font-size: 12px"
          v-model="inTokenAmount"
          @input="changeSlider"
        ></el-input>
        <span class="peer_token">{{buy_sell ? pairInfo.baseTokenName : pairInfo.symbol}}</span>
      </span>
      <div class="shuliang_right">
        <span class="text_num">{{currentPrice}}</span>
      </div>
    </div>
    <div class="slide_box">
      <div class="slide_left">
        <el-slider
          class="slide_content"
          v-model="sliderValue"
          :step="20"
          show-stops
          @change="changeInput"
          style="width: 100%"
        ></el-slider>
        <div class="edu">
          <span>可用额度</span>
          <span>
            {{ buy_sell ? (baseTokenAmount + ' ' + pairInfo.baseTokenName) : (quoteTokenAmount + ' ' + pairInfo.symbol) }}</span
          >
        </div>
        <div class="edu">
          <span>预计获得</span>
          <span>
            {{ buy_sell ? (delegateType == 'limitedDelegate' ? (inTokenAmount / limitedPrice).toFixed(6) : this.evaluatedAmountOut + ' ' + pairInfo.symbol)
                        : (delegateType == 'limitedDelegate' ? (inTokenAmount * limitedPrice).toFixed(6) : this.evaluatedAmountOut + ' ' + pairInfo.baseTokenName) }}
          </span
          >
        </div>
        <div class="edu">
          <span class="huadian"
            >滑点限制<i
              class="iconfont icon-sysseting"
              @click="centerDialogVisible = true"
            ></i
          ></span>
          <span>{{slippagePercent}} %</span>
        </div>
      </div>
      <div class="view2_right">
        <div class="amount_item">
          <span class="buy_price">{{buyList[0].price}}</span>
          <span class="orderAmount">{{this.getReadableNumber(buyList[0].amount, 18, 2)}}</span>
          <div class="bg"></div>
        </div>
        <div class="amount_item">
          <span class="buy_price">{{buyList[1].price}}</span>
          <span class="orderAmount">{{this.getReadableNumber(buyList[1].amount, 18, 2)}}</span>
          <div class="bg" style="width: 30%"></div>
        </div>
        <div class="amount_item">
          <span class="buy_price">{{buyList[2].price}}</span>
          <span class="orderAmount">{{this.getReadableNumber(buyList[2].amount, 18, 2)}}</span>
          <div class="bg" style="width: 40%"></div>
        </div>
        <div class="amount_item">
          <span class="buy_price">{{buyList[3].price}}</span>
          <span class="orderAmount">{{this.getReadableNumber(buyList[3].amount, 18, 2)}}</span>
          <div class="bg" style="width: 50%"></div>
        </div>
        <div class="amount_item">
          <span class="buy_price">{{buyList[4].price}}</span>
          <span class="orderAmount">{{this.getReadableNumber(buyList[4].amount, 18, 2)}}</span>
          <div class="bg" style="width: 80%"></div>
        </div>
      </div>
    </div>
    <div v-if="executingTx" :class="buy_sell ? 'buy_peer_token' : 'sell_peer_token'">
      交易中...
    </div>
    <div v-else :class="buy_sell ? 'buy_peer_token' : 'sell_peer_token'" @click="makeOrder">
      {{buy_sell ? (baseTokenApproved ? '买入' + pairInfo.symbol : '授权' + pairInfo.baseTokenName)
                 : (quoteTokenApproved ? '卖出' + pairInfo.symbol : '授权' + pairInfo.symbol)}}
    </div>
    <!-- <div class="waring_tips">
      <img src="../../assets/images/waring_icon.png" />
      <span>本产品处于试运营阶段</span>
    </div> -->
    <div class="line_box"></div>
    <div class="list_box">
      <div class="list_nav">
        <span
          :class="listInde ? 'list_nav_active' : null"
          @click="listInde = !listInde"
          >当前委托</span
        ><span
          :class="!listInde ? 'list_nav_active' : null"
          @click="listInde = !listInde"
          >成交记录</span
        >
      </div>
      <CurrentEntrust v-if="listInde"
        :pairInfo="pairInfo"
        :key="refresh"
        @update="updateAll"/>
      <TransactionRecord v-else :pairInfo="pairInfo"/>
      <el-dialog
        title="交易设置"
        :visible="centerDialogVisible"
        width="90%"
        center
        @close="centerDialogVisible = false"
      >
        <SlidingPointDialog :pairInfo="pairInfo" @close="closeSlidingDialog"/>
      </el-dialog>
    </div>
  </div>
</template>

<script>
let view_img1 = require("../../assets/images/view_img1.png");
let view_img2 = require("../../assets/images/view_img3.png");
import CurrentEntrust from "./CurrentEntrust";
import TransactionRecord from "./TransactionRecord";
import SlidingPointDialog from "./SlidingPointSetingDialog";
import ERC20 from "../../assets/contracts/abi/ERC20.json";
import BoboPair from "../../assets/contracts/abi/BoboPair.json";
import BigNumber from "bignumber.js";

export default {
  name: "Trade",
  data() {
    return {
      buy_sell: true,
      listInde: true,
      currentPrice: 0,
      view_img1: view_img1,
      view_img2: view_img2,
      inTokenAmount: "",
      limitedPrice: 1,
      sliderValue: 0,
      slippagePercent: 0.1,
      centerDialogVisible: false,
      options: [
        {
          value: "marketDelegate",
          label: "市价委托",
        },
        {
          value: "limitedDelegate",
          label: "限价委托",
        },
      ],
      delegateType: 'limitedDelegate',
      pairInfo: {},
      pairIntervalId: 0,
      baseTokenAmount: 0,
      quoteTokenAmount: 0,
      inTokenSymbol: '',
      curPairContract: null,
      sellList: [{amount:0, price:0}, {amount:0, price:0}, {amount:0, price:0}, {amount:0, price:0}, {amount:0, price:0}, {amount:0, price:0}],
      buyList: [{amount:0, price:0}, {amount:0, price:0}, {amount:0, price:0}, {amount:0, price:0}, {amount:0, price:0}, {amount:0, price:0}],
      baseTokenContract: null,
      quoteTokenContract: null,
      curStakeId: null,
      baseTokenApproved: true,
      quoteTokenApproved: true,
      orderSize: 10,
      orderListedSize: 6,
      executingTx: false,
      refresh: true,
      boboRouter: this.$store.state.drizzle.contracts.BoboRouter,
      evaluatedAmountOut: 0
    };
  },
  created:function() {
    this.pairInfo = JSON.parse(localStorage.getItem("CurPairInfo"))[this.$store.state.chainId];
    this.limitedPrice = this.pairInfo.currentPrice;
    this.currentPrice = this.pairInfo.currentPrice;
    this.inTokenSymbol = this.pairInfo.symbol;
    this.slippagePercent = localStorage.getItem(this.pairInfo.pairAddr + '-slippagePercent');
    if (this.slippagePercent == null || this.slippagePercent == '') {
      this.slippagePercent = 0.1;
    }

    // 每15秒更新一次价格和涨跌幅
    this.pairIntervalId = setInterval(() => {
      let pairInfo = this.$store.state.hangqing[this.pairInfo.symbol + '-' + this.pairInfo.baseTokenName];//.filter(pairInfo => (pairInfo.symbol == this.pairInfo.symbol) && (pairInfo.baseTokenName == this.pairInfo.baseTokenName));
      this.pairInfo.price24HPercent =  pairInfo.price24HPercent;
      this.currentPrice = pairInfo.currentPrice;
    }, 15000);

    // 获取baseToken合约对象
    if (this.$store.state.drizzle.contracts[this.pairInfo.baseTokenName] == null) {
      var baseTokenContract = {
        contractName: this.pairInfo.baseTokenName,
        web3Contract: new this.$store.state.web3.eth.Contract(ERC20.abi, this.pairInfo.baseTokenAddr)
      }
      this.$store.state.drizzle.addContract(baseTokenContract, []);
    }
    this.baseTokenContract = this.$store.state.drizzle.contracts[this.pairInfo.baseTokenName];

    // 获取当前交易合约对象
    if (this.$store.state.drizzle.contracts[this.pairInfo.pairAddr] == null) {
      var pairContract = {
        contractName: this.pairInfo.pairAddr,
        web3Contract: new this.$store.state.web3.eth.Contract(BoboPair.abi, this.pairInfo.pairAddr)
      }
      this.$store.state.drizzle.addContract(pairContract, []);
    }
    this.curPairContract = this.$store.state.drizzle.contracts[this.pairInfo.pairAddr];

    if (this.$store.state.drizzle.contracts[this.pairInfo.symbol] == null) {
      var quoteTokenContract = {
        contractName: this.pairInfo.symbol,
        web3Contract: new this.$store.state.web3.eth.Contract(ERC20.abi, this.pairInfo.address)
      }
      this.$store.state.drizzle.addContract(quoteTokenContract, []);
    }
    this.quoteTokenContract = this.$store.state.drizzle.contracts[this.pairInfo.symbol];

    this.updateTokenAmount();
    this.updateOrderList();

    const bSellReturn = localStorage.getItem("bSell");
    if (bSellReturn != null && bSellReturn != 0) {
      bSellReturn == 1 ? this.clickSellBtn() : this.clickBuyBtn();
      localStorage.setItem("bSell", 0);
    }
  },
  beforeUnmount() {
    clearInterval(this.pairIntervalId);
  },
  computed: {
    theme() {
      return this.$store.state.skin;
    },
  },
  components: { CurrentEntrust, TransactionRecord, SlidingPointDialog },
  methods: {
    changeInput(value) {
      //sliderChage
      this.inTokenAmount = (this.buy_sell ? this.baseTokenAmount : this.quoteTokenAmount) * value / 100;
    },
    changeSlider(value) {
      //inputChange
      this.sliderValue = Number(value);
    },
    chart() {
      this.$store.dispatch("chageHeader", false);
      this.$router.push("/chart");
    },
    clickBuyBtn() {
      if (!this.buy_sell) {
        this.buy_sell = !this.buy_sell;
        this.updateInTokenSymbol(this.delegateType);
      }
    },
    clickSellBtn() {
      if (this.buy_sell) {
        this.buy_sell = !this.buy_sell;
        this.updateInTokenSymbol(this.delegateType);
      }
    },
    closeSlidingDialog(v) {
      this.centerDialogVisible = false;
      this.slippagePercent = v;
    },
    makeOrder() {
      if (this.inTokenAmount == null || this.inTokenAmount == '') {
        this.toast("error", "请输入数量");
        return;
      }
      if (this.delegateType == 'limitedDelegate' && (this.limitedPrice == '' || this.limitedPrice == null)) {
        this.toast("error", "请输入价格");
        return;
      }
      if (this.buy_sell) {   // 买单
        if (!this.baseTokenApproved) {  // 授权
          this.curStakeId = this.baseTokenContract.methods['approve'].cacheSend(this.pairInfo.pairAddr, 
                                                                                '0x' + new BigNumber(1).shiftedBy(30).toString(16),
                                                                                { from: this.$store.state.account });
          this.syncTxStatus(
            () => {
              this.baseTokenApproved = true;
              this.toast("success", "授权成功，请再次点击按钮下单");
            },
            () => {
              this.toast("error", "授权失败");
            }
          );
        } else {
          if (this.delegateType == 'limitedDelegate') {  // 限价买单
            this.curStakeId = this.curPairContract.methods['addLimitedOrder'].cacheSend(
                                                                                    this.boboRouter.address,
                                                                                    true,
                                                                                    '0x' + new BigNumber(this.limitedPrice).shiftedBy(6).toString(16),
                                                                                    '0x' + new BigNumber(this.inTokenAmount).shiftedBy(6).toString(16),
                                                                                    { from: this.$store.state.account });
            this.syncTxStatus(
              () => {
                this.updateAll();
                this.toast("success", "下单成功");
              },
              () => {
                this.toast("error", "交易失败");
              }
            );
          } else {  // 市价买单
            const minOutAmount = '0x' + new BigNumber(this.evaluatedAmountOut).shiftedBy(this.pairInfo.decimals - 2).multipliedBy(100 - this.slippagePercent).toString(16);
            this.curStakeId = this.curPairContract.methods['addMarketOrder'].cacheSend(
                                                                                    this.boboRouter.address,
                                                                                    true,
                                                                                    '0x' + new BigNumber(this.inTokenAmount).shiftedBy(6).toString(16),
                                                                                    minOutAmount,
                                                                                    { from: this.$store.state.account });

            this.syncTxStatus(
              () => {
                this.updateAll();
                this.toast("success", "交易成功");
              },
              () => {
                this.toast("error", "交易失败");
              }
            );
          }

        }
      } else {  // 卖单
        if (!this.quoteTokenApproved) {  // 授权
          this.curStakeId = this.quoteTokenContract.methods['approve'].cacheSend(this.pairInfo.pairAddr, 
                                                                                '0x' + new BigNumber(1).shiftedBy(30).toString(16), 
                                                                                { from: this.$store.state.account });
          this.syncTxStatus(
            () => {
              this.quoteTokenApproved = true;
              this.toast("success", "授权成功，请再次点击按钮下单");
            },
            () => {
              this.toast("error", "授权失败");
            }
          );
        } else {  // 下单
          if (this.delegateType == 'limitedDelegate') {  // 限价单
            this.curStakeId = this.curPairContract.methods['addLimitedOrder'].cacheSend(
                                                                                      this.boboRouter.address,
                                                                                      false,
                                                                                      '0x' + new BigNumber(this.limitedPrice).shiftedBy(6).toString(16),
                                                                                      '0x' + new BigNumber(this.inTokenAmount).shiftedBy(this.pairInfo.decimals).toString(16),
                                                                                      { from: this.$store.state.account });
            this.syncTxStatus(
              () => {
                this.updateAll();
                this.toast("success", "下单成功");
              },
              () => {
                this.toast("error", "交易失败");
              }
            );
          } else {   // 市价单
            const inAmount = '0x' + new BigNumber(this.inTokenAmount).shiftedBy(this.pairInfo.decimals).toString(16);
            const minOutAmount = '0x' + new BigNumber(this.evaluatedAmountOut).shiftedBy(6 - 2).multipliedBy(100 - this.slippagePercent).integerValue().toString(16);            
            this.curStakeId = this.curPairContract.methods['addMarketOrder'].cacheSend(
                                                                                    this.boboRouter.address,
                                                                                    false,
                                                                                    inAmount,
                                                                                    minOutAmount,
                                                                                    { from: this.$store.state.account });

            this.syncTxStatus(
              () => {
                this.updateAll();
                this.toast("success", "交易成功");
              },
              () => {
                this.toast("error", "交易失败");
              }
            );
          }
        }
      }
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
    updateTokenAmount() {
      this.$store.state.drizzle.contracts[this.pairInfo.baseTokenName]
        .methods.balanceOf(this.$store.state.account)
        .call()
        .then(v => {
          this.baseTokenAmount = this.getReadableNumber(v, 6, 6);
      });

      this.$store.state.drizzle.contracts[this.pairInfo.symbol]
        .methods.balanceOf(this.$store.state.account)
        .call()
        .then(v => {
          this.quoteTokenAmount = this.getReadableNumber(v, this.pairInfo.decimals, 6);
      });
    },
    updateInTokenSymbol() {
      if (this.buy_sell) {
        this.inTokenSymbol = this.pairInfo.baseTokenName;
      } else {
        this.inTokenSymbol = this.pairInfo.symbol;
      }
      this.inTokenAmount = 0;
    },
    updateOrderList() {
      var pairContract = this.$store.state.drizzle.contracts[this.pairInfo.pairAddr];
      this.buyList.map(v => {
        v.price = 0;
        v.amount = 0;
      });
      pairContract.methods.getTotalOrderNumber(true).call().then(number => {
        console.log("buy list number:", number);
        number = parseInt(number);
        if (number == 0) return;
        pairContract.methods.getOrderInfos(true, 0, number > this.orderSize ? this.orderSize : number).call().then(orderInfos => {
          console.log('buyOrder', orderInfos);
          const length = orderInfos.length;
          var i = 0;
          var lastIndex = 0;
          while(i < length && lastIndex < this.orderListedSize) {
            const amount = new BigNumber(orderInfos[i].minOutAmount);
            const price = this.getReadableNumber(orderInfos[i].spotPrice, 6, 2);
            if (lastIndex > 0 && this.buyList[lastIndex - 1].price == price) {
              this.buyList[lastIndex - 1].amount = this.buyList[lastIndex - 1].amount.plus(amount);
            } else {
              this.buyList[lastIndex].price = price;
              this.buyList[lastIndex].amount = amount;
              lastIndex++;
            }
            i++;
          }
        });
      });
      this.sellList.map(v => {
        v.price = 0;
        v.amount = 0;
      });
      pairContract.methods.getTotalOrderNumber(false).call().then(number => {
        console.log("sell list number:", number);
        number = parseInt(number);
        if (number == 0) return;
        pairContract.methods.getOrderInfos(false, 0, number > this.orderSize ? this.orderSize : number).call().then(orderInfos => {
          console.log('sellOrder', orderInfos);
          const length = orderInfos.length;
          var i = 0;
          var lastIndex = 0;
          while(i < length && lastIndex < this.orderListedSize) {
            const amount = new BigNumber(orderInfos[i].inAmount);
            const price = this.getReadableNumber(orderInfos[i].spotPrice, 6, 2);
            if (lastIndex > 0 && this.sellList[lastIndex - 1].price == price) {
              this.sellList[lastIndex - 1].amount = this.sellList[lastIndex - 1].amount.plus(amount);
            } else {
              this.sellList[lastIndex].price = price;
              this.sellList[lastIndex].amount = amount;
              lastIndex++;
            }
            i++;
          }
        });
      });
    },
    updateAll() {
      console.log("update all");
      // this.$forceUpdate();
      this.updateTokenAmount();
      this.updateOrderList();
      this.refresh= !this.refresh;
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
    checkBalanceEnough() {
      if (this.buy_sell) {
        if (this.inTokenAmount - this.baseTokenAmount > 0)
            return false;
      } else {
        if (this.inTokenAmount - this.quoteTokenAmount > 0)
            return false;
      }
      return true;
    },
    checkERC20Approved() {
      if (this.buy_sell) {
        this.baseTokenContract.methods.allowance(this.$store.state.account, this.pairInfo.pairAddr).call().then(v => {
          if (v - this.inTokenAmount * 1000000 < 0) {
            this.baseTokenApproved = false;
          }
        });
      } else {
        this.quoteTokenContract.methods.allowance(this.$store.state.account, this.pairInfo.pairAddr).call().then(v => {
          if (v - this.inTokenAmount * 1000000 < 0) {
            this.quoteTokenApproved = false;
          }
        });
      }
    },
    updateOutTokenAmount() {
      if (this.inTokenAmount == null || this.inTokenAmount == '0' || this.inTokenAmount == '') return;
      if (this.delegateType == 'limitedDelegate') return;

      const inToken = this.buy_sell ? this.pairInfo.baseTokenAddr : this.pairInfo.address;
      const outToken = this.buy_sell ? this.pairInfo.address : this.pairInfo.baseTokenAddr;
      const inTokenAmount = '0x' + new BigNumber(this.inTokenAmount).shiftedBy(this.buy_sell ? 6 : this.pairInfo.decimals).toString(16);
      this.boboRouter.methods.getBestSwapPath(inToken, outToken, inTokenAmount).call().then(result => {
        this.evaluatedAmountOut = this.getReadableNumber(result.bestResultInfo.totalAmountOut, this.buy_sell ? this.pairInfo.decimals : 6, 6);
        console.log(this.evaluatedAmountOut)
      });
    }
  },
  watch: {
    "delegateType": function () {
      this.updateInTokenSymbol();
    },
    "limitedPrice": function () {

    },
    "inTokenAmount": function () {
      if (!this.checkBalanceEnough()) {
        this.toast("error", "您的余额不足");
      }
      this.checkERC20Approved();
      this.updateOutTokenAmount();
    },
    "currentPrice": function () {
      this.updateOutTokenAmount();
    }
  }
};
</script>
<style  lang="scss">
@import "../../assets/styles/Trade/Trade";
</style>
