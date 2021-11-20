import Web3 from "web3";
import OrderNFT from "./abi/OrderNFT.json";
import BoboToken from "./abi/BOBOToken.json";
import BoboFactory from "./abi/BoboFactory.json";
import BoboRouter from "./abi/BoboRouter.json";
import BoboRouterEx from "./abi/BoboRouterEx.json";
import BoboFarmer from "./abi/BoboFarmer.json";
import EXManager from "./abi/EXManager.json";
import StratMaticSushi from "./abi/StratMaticSushi.json";
import BoboMasterChef from "./abi/BoboMasterChef.json";
import BoboFarmer4TradeMining from "./abi/BoboFarmer4TradeMining.json";
import BoboPairHelper from "./abi/BoboPairHelper.json";
import Loot from "./abi/Loot.json";
import USDT from "./abi/USDT.json";


// OrderNFT.networks['137'] = {address: '0x04673384398379a84d05895456AE02fc05B4a509'};
// OrderDetailNFT.networks['137'] = {address: '0x75508A1de2183a1F2Bf1822d6794698c953A1788'};
// BoboBetaToken.networks['137'] = {address: '0x637C6b0eDFB8835aC46B4Afd98d0601e68669da7'};
// BoboFactory.networks['137'] = {address: '0xC3b7119930a94c3a6Cf73C12428732db7440c486'};
// BoboRouter.networks['137'] = {address: '0xe0d6f9636794d03c9Ae4E0630199B9BD1b9CE568'};
// BoboFarmer.networks['137'] = {address: '0xd79Df7Ec6Ff4f5dDc53A3D60ecaf25316a532baD'};
// EXManager.networks['137'] = {address: '0x7a29BefCb6d0c6FEBdD33003Fa08b139C63C2367'};
// StratMaticSushi.networks['137'] = {address: '0xa5C926114617BA582bb28e5A5661fF545524d20C'};

const options = {
  web3: {
    // block: true,
    customProvider: new Web3(window.ethereum),
  },
  contracts: [
    OrderNFT, BoboToken, BoboFactory, BoboRouter, BoboRouterEx, EXManager, 
    StratMaticSushi, BoboFarmer, BoboMasterChef, BoboFarmer4TradeMining, BoboPairHelper, 
    Loot, USDT
  ],
  events: {
  },
  polls: {
    blocks: 10000,
  },
  //syncAlways: true,
};
export default options;