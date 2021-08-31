<template>
  <div class="seting">
    <div class="seting_1">
      <span>滑点设置</span>
      <el-popover
        placement="top"
        width="200"
        trigger="click"
        content="设置滑点后,如果成交价变化超过设置值,订单将会无法成交。"
      >
        <i class="iconfont icon-help help" slot="reference"></i>
      </el-popover>
    </div>
    <el-input
      placeholder="0.1"
      size="small"
      class="input1"
      v-model.number="sliding_num"
      type="number"
    >
      <template slot="append">%</template>
    </el-input>
    <el-button-group class="btngroup">
      <el-button size="mini" @click="handleClick(0.5)">0.5%</el-button>
      <el-button size="mini" @click="handleClick(1)">1%</el-button>
      <el-button size="mini" @click="handleClick(5)">5%</el-button>
      <el-button size="mini" @click="handleClick(10)">10%</el-button>
    </el-button-group>
    <!-- <div class="seting_1">
      <span>交易超时时间</span>
      <el-popover
        placement="top"
        width="200"
        trigger="click"
        content="设置超时时间后,如果订单超过设置值还未成交,订单将被取消。"
      >
        <i class="iconfont icon-help help" slot="reference"></i>
      </el-popover>
    </div>
    <el-input
      placeholder="20"
      size="small"
      class="input1"
      v-model.number="sliding_time"
      type="number"
    >
      <template slot="append">分钟</template>
    </el-input> -->
    <div class="save" @click="save">保存</div>
  </div>
</template>
<script>
export default {
  name: "SlidingPointDialog",
  props: ["pairInfo"],
  data() {
    return {
      sliding_num: 0.1
    };
  },
  created() {
    this.sliding_num = localStorage.getItem(this.pairInfo.pairAddr + '-slippagePercent');
    if (this.sliding_num == null)
      this.sliding_num = 0.1;
  },
  methods: {
    close() {
      this.$emit("close", this.sliding_num);
    },
    save() {
      localStorage.setItem(this.pairInfo.pairAddr + '-slippagePercent', this.sliding_num);
      this.close();
    },
    handleClick(v) {
      this.sliding_num = v;
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
