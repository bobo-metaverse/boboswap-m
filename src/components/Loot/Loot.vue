<template>
  <div class="loot">
    <div class="pool_item">
      <div class="poll_title">
        <span class="incons">
          <img src="../../assets/images/NFT.png" />
          <span class="asset">Loot</span>
        </span>
        <span class="time_request">{{myLootNFTNumber}} 您当前持有数量</span>
      </div>
      <div class="pool_center">
        <el-select multiple class="nft_selector" v-model="nftIds" @change="selectNftId" placeholder="请选择铸造Loot所需订单(可多选)">
          <el-option
            v-for="item in orderList"
            :key="item.id"
            :label="item.id"
            :value="item.id">
            <span style="float: left">订单NFT-ID:{{ item.id }}[权重:{{ item.weight }}]</span>
          </el-option>
        </el-select>
        <div class="seting_2">
          <span>已选订单总权重: {{getReadableNumber(totalWeight, 6, 2)}} M</span>
        </div>
        <div class="seting_3">
          <span>铸造规则:</span>
          <span>1: 每铸造一个Loot装备, 需燃烧{{mintedOrderNumber}}个订单NFT</span>
          <span>2: 订单NFT总权重越大，铸造出高级别的Loot概率越大</span>
          <span>3: 订单NFT一旦燃烧，便永久销毁</span>
          <span>4: 当前铸造价格(需支付): {{curMintPrice}} {{tokenSymbol}}</span>
          <span>5: 当前销毁价格(可获得): {{curBurnPrice}} {{tokenSymbol}}</span>
        </div>
      </div>
      <div class="pool_btn">
        <div v-if="!approved" class="mining_btn" @click="approve">{{approving ? '授权NFT中...' : '授权NFT -> 铸造Loot'}}</div>
        <div v-else class="mining_btn" @click="mintLoot">铸造Loot</div>
      </div>
    </div>

    <div v-for="tokenInfo in tokenURIs" 
        :key="tokenInfo.svgName"
        class="pool_item">

      <div class="pool_item">
        <div class="poll_title">
          <span class="incons">
            <span class="asset">{{tokenInfo.svgName}}</span>
          </span>
        </div>
        <div class="pool_center">
          <div class="loot"
            v-html="tokenInfo.svgInfo">
          </div>
        </div>
        <div class="pool_btn">
          <div class="mining_btn" @click="burnLoot(tokenInfo.tokenId)">销毁Loot</div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import BigNumber from "bignumber.js";
import { Base64 } from 'js-base64';

const aa = [];
export default {
  name: "Loot",
  props: ["openTrade"],
  data() {
    return {
      myLootNFTNumber: 0,
      mintedOrderNumber: 8,
      orderList: [],
      mintedOrderIds: [],
      boboFactory: this.$store.state.drizzle.contracts.BoboFactory,
      loot: this.$store.state.drizzle.contracts.Loot,
      orderNFT: this.$store.state.drizzle.contracts.OrderNFT,
      boboPairHelper: this.$store.state.drizzle.contracts.BoboPairHelper,
      curMintPrice: 0,
      curBurnPrice: 0,
      tokenSymbol: 'Matic',
      account: this.$store.state.account,
      tokenIds: [],
      tokenURIs: [],
      svgHeader1: 'data:application/json;base64,',
      svgHeader2: 'data:image/svg+xml;base64,',
      approving: false,
      approved: false,
      totalWeight: 0,
      nftId2Weight: {},
      pageSize: 100,
      nftIds: '',
    };
  },
  computed: {
  },
  created() {
    this.orderNFT.methods.isApprovedForAll(this.$store.state.account, this.loot.address).call().then(approved => {
      this.approved = approved;
    });
    this.loot.methods.OrderNumber().call().then(orderNumber => {
      this.mintedOrderNumber = orderNumber;
    });
    this.loot.methods.getCurrentPriceToMint().call().then(curMintPrice => {
      this.curMintPrice = this.getReadableNumber(curMintPrice, 18, 6);
    });
    this.loot.methods.getCurrentPriceToBurn().call().then(curBurnPrice => {
      this.curBurnPrice = this.getReadableNumber(curBurnPrice, 18, 6);
    });
    this.loot.methods.balanceOf(this.account).call().then(balance => {
      this.myLootNFTNumber = parseInt(balance);
      this.tokenIds = [];
      for (var i = 0; i < this.myLootNFTNumber; i++) {
        this.loot.methods.tokenOfOwnerByIndex(this.account, i).call().then(tokenId => {
          this.tokenIds.push(tokenId);
          this.tokenURIs = [];
          this.loot.methods.tokenURI(tokenId).call().then(tokenURI => {
            const outSvgInfo = JSON.parse(Base64.decode(tokenURI.substr(this.svgHeader1.length)));
            const svgName = outSvgInfo.name;
            const svgImg = outSvgInfo.image;
            const svgInfo = Base64.decode(svgImg.substr(this.svgHeader2.length));
            console.log({svgName, svgInfo});
            this.tokenURIs.push({tokenId, svgName, svgInfo});
          });
        });
      }
    });
    this.syncAllDealedOrders();
  },

  methods: {
    syncAllDealedOrders() {
      this.boboFactory.methods.pairNumber().call().then(pairNumber => {
        pairNumber =parseInt(pairNumber);
        for (var i = 0; i < pairNumber; i++) {
          this.boboFactory.methods.allPairs(i).call().then(pairAddr => {
            this.syncDealedOrdersOfOnePair(pairAddr);
          });
        }
      });
    },
    syncDealedOrdersOfOnePair(pairAddr) {
      this.boboPairHelper.methods.getAllDealedOrders(pairAddr, this.$store.state.account, 0, this.pageSize).call().then(orderInfos => {
        console.log(orderInfos);
        const orderList = [];
        for (var i = 0; i < parseInt(orderInfos.count); i++) {
          const nftInfo = orderInfos.nftInfos[i];
          const orderInfo = {id: parseInt(nftInfo.id), weight: nftInfo.weight};
          orderList.push(orderInfo);
          this.nftId2Weight[orderInfo.id] = orderInfo.weight;
        }
        this.orderList = orderList;
      });
    },
    approve() {
      if (this.approving) return;
      this.curStakeId = this.orderNFT.methods['setApprovalForAll'].cacheSend(this.loot.address, 
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
    mintLoot() {
      this.curStakeId = this.loot.methods['mint'].cacheSend(this.mintedOrderIds,
                                                            { from: this.$store.state.account });

      this.syncTxStatus(
        () => {
          this.updateAll();
          this.toast("success", "销毁成功");
        },
        () => {
          this.toast("error", "销毁失败");
        }
      );
    },
    burnLoot(tokenId) {
      this.curStakeId = this.loot.methods['burn'].cacheSend(tokenId,
                                                            { from: this.$store.state.account });

      this.syncTxStatus(
        () => {
          this.updateAll();
          this.toast("success", "销毁成功");
        },
        () => {
          this.toast("error", "销毁失败");
        }
      );
    },
    selectNftId(nftIds) {
      this.totalWeight = 0;
      nftIds.map(id => {
        this.totalWeight += parseInt(this.nftId2Weight[id]);
      })
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
@import "../../assets/styles/Loot/Loot.scss";
</style>