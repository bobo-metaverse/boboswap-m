<template>
  <div id="app">
    <router-view />
  </div>
</template>
<script>
import Vue from 'vue'
import Web3 from "web3";
import { Drizzle } from "@drizzle/store";
import drizzleOptions from "./assets/contracts/drizzleOptions";
import { myMixins } from "./assets/js/Wallet/ConnectWallet";
export default {
  data() {
    return {
      web3: null,
    };
  },
  mixins: [myMixins],
  async created() {
    console.log(drizzleOptions);
    const drizzle = new Drizzle(drizzleOptions);
    Vue.prototype.$drizzle = drizzle;
    
    this.$store.dispatch("setDrizzle", drizzle);
    await this.connectWallet();
    console.log('App.vue', drizzle);
    this.$store.dispatch("getHangQing");
    // setInterval(() => {
    //   this.$store.dispatch("getHangQing");
    // }, 5000);
  },
  methods: {},
  components: {},
};
</script>


<style lang="scss">
@import "./assets/styles/base.scss";
#app {
  font-family: "Playfair Display SC";
  height: 100%;
}
</style>
