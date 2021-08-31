// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;
pragma experimental ABIEncoderV2;

import "./BoboFactory.sol";
import "./BoboFarmer.sol";
import "./BoboPair.sol";
import "./StratMaticSushi.sol";
import "./manager/EXManager.sol";
import "./common/orderNFT.sol";
import "./common/orderDetailNFT.sol";


contract BatchCreatOrders {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;
    using EnumerableSet for EnumerableSet.UintSet;
    using EnumerableSet for EnumerableSet.AddressSet;
    
    
    address public constant USDT = 0xc2132D05D31c914a87C6611C10748AEb04B58e8F;
    address public constant USDC = 0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174;
    address public constant WMATIC = 0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270;
    
    address public constant BoboRouter = 0xe0d6f9636794d03c9Ae4E0630199B9BD1b9CE568;
    address public constant BoboBetaToken = 0x637C6b0eDFB8835aC46B4Afd98d0601e68669da7;
    
                
    BoboFactoryOnMatic public boboFactory = BoboFactoryOnMatic(0x08De1049878d5320a8d33c606bCD833e64Ae2Dfd);
    BoboFarmer public boboFarmer = BoboFarmer(0xd79Df7Ec6Ff4f5dDc53A3D60ecaf25316a532baD);
    StratMaticSushi public strat;
    
    
    EXManager public exManager = EXManager(0x7a29BefCb6d0c6FEBdD33003Fa08b139C63C2367);
    OrderNFT public orderNFT = OrderNFT(0x04673384398379a84d05895456AE02fc05B4a509);
    OrderDetailNFT public orderDetailNFT = OrderDetailNFT(0x75508A1de2183a1F2Bf1822d6794698c953A1788);
    
    constructor () public {  
    }
    
    function setAddrs(address _factory, address _farmer, address _exManager, address _orderNFT, address _orderDetailNFT) public {
        boboFactory = BoboFactoryOnMatic(_factory);
        boboFarmer = BoboFarmer(_farmer);
        exManager = EXManager(_exManager);
        orderNFT = OrderNFT(_orderNFT);
        orderDetailNFT = OrderDetailNFT(_orderDetailNFT);
    }
    
    function createOneOrder(address _quoteToken, address _baseToken, bool _bBuyQuoteToken, uint256 _spotPrice, uint256 _amountIn, uint256 _slippagePercent) public {
        address pairAddr = boboFactory.getPair(_quoteToken, _baseToken);
        
        IERC20(_bBuyQuoteToken ? _baseToken : _quoteToken).approve(pairAddr, uint256(-1));
        BoboPair(pairAddr).addLimitedOrder(_bBuyQuoteToken, _spotPrice, _amountIn, _slippagePercent);
    }
    
    function batchCreateOrders(address _quoteToken, address _baseToken, bool _bBuyQuoteToken, uint256 _startSpotPrice, uint256 _stepPrice, uint256 _amountIn, uint256 _orderNum) public {
        address pairAddr = boboFactory.getPair(_quoteToken, _baseToken);
        IERC20(_bBuyQuoteToken ? _baseToken : _quoteToken).approve(pairAddr, uint256(-1));
        for (uint256 i= 0; i < _orderNum; i++) {
            uint256 spotPrice = _bBuyQuoteToken ? (_startSpotPrice - _stepPrice * i) : (_startSpotPrice + _stepPrice * i);
            createOneOrder(_quoteToken, _baseToken, _bBuyQuoteToken, spotPrice, _amountIn, 100);
        }
    }
    
    
    function cancelMyOrder(address _quoteToken, address _baseToken, uint256 _orderId) public {
        address pairAddr = boboFactory.getPair(_quoteToken, _baseToken);
        BoboPair(pairAddr).cancelOrder(_orderId);
    }
    
    function batchCancelOrders(address _quoteToken, address _baseToken) public {
        address pairAddr = boboFactory.getPair(_quoteToken, _baseToken);
        uint orderLength = BoboPair(pairAddr).getUserHangingOrderNumber(address(this));
        for (uint i = 0; i< orderLength; i++) {
            uint256 id = BoboPair(pairAddr).getUserHangingOrderId(address(this), i);
            cancelMyOrder(_quoteToken, _baseToken, id);
        }
    }
    
    function getOrderListNumber(address _quoteToken, address _baseToken) view public returns(uint256 buyOrderNumber, uint256 sellOrderNumber) {
        address pairAddr = boboFactory.getPair(_quoteToken, _baseToken);
        buyOrderNumber = BoboPair(pairAddr).getTotalOrderNumber(true);
        sellOrderNumber = BoboPair(pairAddr).getTotalOrderNumber(false);
    }
    
    function getOrderListInfo(address _quoteToken, address _baseToken, bool _bBuyQuoteToken, uint256 _fromIndex, uint256 _toIndex) 
        view public returns(NFTInfo[] memory orderInfos) {
        address pairAddr = boboFactory.getPair(_quoteToken, _baseToken);
        orderInfos = BoboPair(pairAddr).getOrderInfos(_bBuyQuoteToken, _fromIndex, _toIndex);
    }
    
    function withdraw(address _erc20) public {
        ERC20(_erc20).transfer(msg.sender, ERC20(_erc20).balanceOf(address(this)));
    }
}