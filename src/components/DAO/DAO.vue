<template>
  <div class="dao">
    <span>
    项目将通过抵押Bobo和消耗订单NFT进行治理
    </span>
  </div>
</template>
<script>
import axios from 'axios';

const aa = [];
export default {
  name: "DAO",
  props: ["openTrade"],
  data() {
    return {
      TypeList: [],
      intervalId: 0,
      activeIndex: 0, //1:自选，2：HT,3:USDT
      syncCount: 0
    };
  },
  computed: {
  },
  async created() {
  },

  methods: {
    
  },
};
</script>
<style lang="scss">
@import "../../assets/styles/DAO/DAO.scss";
</style>