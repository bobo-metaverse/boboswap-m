import * as TYPES from "./types";
import * as API from "../assets/js/Common/API"
import axios from 'axios'
import BigNumber from 'bignumber.js'
import BoboPair from "../assets/contracts/abi/BoboPair.json";
import AllPairsInfo from "../assets/js/Common/assetInfo.json";

const mutations = {
  [TYPES.CHANGE_SKIN](state, v) {
		state.skin = v;
		localStorage.setItem("Skin", v);
	},
	[TYPES.CHANGE_HEADER](state, v) {
		state.header = v;
	},
	[TYPES.SET_ACCOUNT](state, v) {
		state.account = v;
	},
	[TYPES.SET_ISCONNECTED](state, v) {
		state.isConnected = v;
	},
	[TYPES.SET_CHAINID](state, v) {
		state.chainId = v;
	},
	[TYPES.SET_WEB3](state, v) {
		state.web3 = v;
	},
	[TYPES.SET_DRIZZLE](state, v) {
		state.drizzle = v;

		console.log('TYPES.SET_DRIZZLE', v);
	},
	[TYPES.GET_HANGQING](state) {
		state.hangqing = {};
		let chainId = state.chainId.toString()

		const pairsOnChain = AllPairsInfo[chainId];
		let assets = {};	
		pairsOnChain.assets.map(asset => {
			assets[asset.address] = asset;
		});	

		var baseTokenFirstName;
		var baseTokenFirstAddr;
		var quoteAddrsOfFirst;
		var baseTokenSecondName;
		var baseTokenSecondAddr;
		var quoteAddrsOfSecond;
		for (var i = 0; i < pairsOnChain.pairs.length; i++) {
			const pairBaseInfo = pairsOnChain.pairs[i];
			if (i == 0) {
				baseTokenFirstName = pairBaseInfo.baseTokenName;
				baseTokenFirstAddr = pairBaseInfo.baseTokenAddr;
				quoteAddrsOfFirst = pairBaseInfo.quoteTokens;
			} else if (i == 1) {
				baseTokenSecondName = pairBaseInfo.baseTokenName;
				baseTokenSecondAddr = pairBaseInfo.baseTokenAddr;
				quoteAddrsOfSecond = pairBaseInfo.quoteTokens;
			}
			for (var j = 0; j < pairBaseInfo.quoteTokens.length; j++) {
				const peerAddr = pairBaseInfo.quoteTokens[j];
				//var pairInfo = assets[peerAddr];
				if (assets[peerAddr] == null) {
					console.log(peerAddr + ' has no token info.')
					return;
				}
				const pairInfo = JSON.parse(JSON.stringify(assets[peerAddr]));
				pairInfo.baseTokenAddr = pairBaseInfo.baseTokenAddr;
				pairInfo.baseTokenName = pairBaseInfo.baseTokenName;
				pairInfo.coingecko_currency = pairBaseInfo.coingecko_currency;
				state.hangqing[pairInfo.symbol + '-' + pairInfo.baseTokenName] = pairInfo;				
			}
		}

		let coingeckoIds = '';
		pairsOnChain.assets.map(asset => {
			if(asset.address != baseTokenFirstAddr && asset.address != baseTokenSecondAddr)
				coingeckoIds += asset.coingeckoId + ',';
		});

		const getPairInfoFromCoingeck = () => {
			let url = API.getRiseFall + "vs_currency=usd&ids=" + coingeckoIds;
			axios.get(url).then((coinInfos) => {
				if (coinInfos.data != null && coinInfos.data.length > 0) {
					for (var i = 0; i < coinInfos.data.length; i++) {
						const coinInfo = coinInfos.data[i];
						for (var j = 0; j < pairsOnChain.pairs.length; j++) {
							const pairBaseInfo = pairsOnChain.pairs[j];
							const pairKey = coinInfo.symbol.toUpperCase() + '-' + pairBaseInfo.baseTokenName;
							console.log(pairKey, state.hangqing[pairKey]);
							if (state.hangqing[pairKey] == null) {
								continue;
							}
							state.hangqing[pairKey].price24HPercent = coinInfo.price_change_percentage_24h.toFixed(2);
							state.hangqing[pairKey].high24H = coinInfo.high_24h.toFixed(2);
							state.hangqing[pairKey].low24H = coinInfo.low_24h.toFixed(2);
							state.hangqing[pairKey].currentPrice = coinInfo.current_price.toFixed(2);
						}
					}
				}				
			});
		}
		var intervalId1 = 0;
		const getPriceAndVolumn = () => {
			const boboFactory = state.drizzle.contracts.BoboFactory;
			const boboPairHelper = state.drizzle.contracts.BoboPairHelper;
			const boboRouter = state.drizzle.contracts.BoboRouter;
			if (boboFactory == null) {
				console.log('null factory');
				return;
			}
			clearInterval(intervalId1);
			boboPairHelper.methods.getPairInfo(boboFactory.address, boboRouter.address, quoteAddrsOfFirst, baseTokenFirstAddr, quoteAddrsOfSecond, baseTokenSecondAddr).call().then(result => {
				// uint256[] memory pricesOfUsdt, uint256[] memory volumnsOfUsdt, uint256[] memory pricesOfUsdc, uint256[] memory volumnsOfUsdc
				for (var i = 0; i < quoteAddrsOfFirst.length; i++) {
					const assetInfo = assets[quoteAddrsOfFirst[i]];
					const pairKey = assetInfo.symbol + '-' + baseTokenFirstName;
					if (state.hangqing[pairKey] == null) {
						console.log(pairKey, " not exist in contract!");
						continue;
					}
					if (new BigNumber(result.pricesOfUsdt[i]).shiftedBy(-6).toNumber() != 0)
						state.hangqing[pairKey].currentPrice = new BigNumber(result.pricesOfUsdt[i]).shiftedBy(-6);
					state.hangqing[pairKey].volumnOf24Hours = new BigNumber(result.volumnsOfUsdt[i]).shiftedBy(-6);
				}
				for (var j = 0; j < quoteAddrsOfSecond.length; j++) {
					const assetInfo = assets[quoteAddrsOfSecond[j]];
					const pairKey = assetInfo.symbol + '-' + baseTokenSecondName;
					if (state.hangqing[pairKey] == null) {
						console.log(pairKey, " not exist in contract!");
						continue;
					}
					if (new BigNumber(result.pricesOfUsdc[i]).shiftedBy(-6).toNumber() != 0)
						state.hangqing[pairKey].currentPrice = new BigNumber(result.pricesOfUsdc[i]).shiftedBy(-6);
					state.hangqing[pairKey].volumnOf24Hours = new BigNumber(result.volumnsOfUsdc[i]).shiftedBy(-6);
				}
			})
		}

		var intervalId2 = 0;
		const getPairAddressList = () => {
			const boboFactory = state.drizzle.contracts.BoboFactory;
			const boboPairHelper = state.drizzle.contracts.BoboPairHelper;
			if (boboFactory == null) {
				console.log('null factory');
				return;
			}
			clearInterval(intervalId2);
			boboPairHelper.methods.getPairAddressList(boboFactory.address, quoteAddrsOfFirst, baseTokenFirstAddr, quoteAddrsOfSecond, baseTokenSecondAddr).call().then(result => {
				for (var i = 0; i < quoteAddrsOfFirst.length; i++) {
					const assetInfo = assets[quoteAddrsOfFirst[i]];
					const pairKey = assetInfo.symbol + '-' + baseTokenFirstName;
					if (state.hangqing[pairKey] == null) {
						console.log(pairKey, " not exist in contract!");
						continue;
					}
					state.hangqing[pairKey].pairAddr = result.pairAddressListOfUsdt[i];
				}
				for (var j = 0; j < quoteAddrsOfSecond.length; j++) {
					const assetInfo = assets[quoteAddrsOfSecond[j]];
					const pairKey = assetInfo.symbol + '-' + baseTokenSecondName;
					if (state.hangqing[pairKey] == null) {
						console.log(pairKey, " not exist in contract!");
						continue;
					}
					state.hangqing[pairKey].pairAddr = result.pairAddressListOfUsdc[i];
				}
			})
		}

		getPairInfoFromCoingeck();
		intervalId1 = setInterval(() => {
			getPriceAndVolumn();
		}, 1000);
		intervalId2 = setInterval(() => {
			getPairAddressList();
		}, 1000);

		getPriceAndVolumn();
		setInterval(() => {
			console.log("update");
			getPairInfoFromCoingeck();
			getPriceAndVolumn();
		}, 15000);
	},
	[TYPES.GET_TRADEINFO](state) {
		
	}
}
export default mutations