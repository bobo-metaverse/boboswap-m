<template>
  <div class="loot">
    <div class="pool_item">
      <div class="poll_title">
        <span class="incons">
          <img src="../../assets/images/NFT.png" />
          <span class="asset">Loot装备</span>
        </span>
        <span class="time_request">{{myLootNFTNumber}} 当前持有数量</span>
      </div>
      <div class="pool_center">
        <el-select multiple class="nft_selector" v-model="nftIds" @change="selectNftId" placeholder="请选择需要铸造所需订单(可多选)">
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
        </div>
        <div class="seting_3">
          <span>铸造规则:</span>
          <span>1: 每铸造一个Loot, 需燃烧8个订单NFT</span>
          <span>2: 订单NFT总权重越大，铸造出高级别的Loot概率越大</span>
          <span>3: 订单NFT一旦燃烧，便永久销毁</span>
        </div>
      </div>
      <div class="pool_btn">
        <div class="mining_btn" @click="mineLoot">铸造Loot</div>
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
          <img src="../../assets/images/NFT.png" />
          <span class="asset">Loot机器人</span>
        </span>
        <span class="time_request">{{myLootNFTNumber}} 当前持有数量</span>
      </div>
      <div class="pool_center">
        <el-select multiple class="nft_selector" v-model="nftIds" @change="selectNftId" placeholder="请选择需要铸造所需订单(可多选)">
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
        </div>
        <div class="seting_3">
          <span>铸造规则:</span>
          <span>1: 每铸造一个Loot, 需燃烧12个订单NFT</span>
          <span>2: 订单NFT总权重越大，铸造出高级别的Loot概率越大</span>
          <span>3: 订单NFT一旦燃烧，便永久销毁</span>
        </div>
      </div>
      <div class="pool_btn">
        <div class="mining_btn" @click="mineLoot">铸造Loot</div>
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
  </div>
</template>
<script>
import axios from 'axios';

const aa = [];
export default {
  name: "Loot",
  props: ["openTrade"],
  data() {
    return {
      myLootNFTNumber: 0,
      nftIds: [],

    };
  },
  computed: {
  },
  async created() {
  },

  methods: {
    mineLoot() {

    },
    selectNftId() {

    }
  },
};
</script>
<style lang="scss">
@import "../../assets/styles/Loot/Loot.scss";
</style>