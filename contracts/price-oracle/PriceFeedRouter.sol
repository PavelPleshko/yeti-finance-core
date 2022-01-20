// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/interfaces/FeedRegistryInterface.sol";
import "@chainlink/contracts/src/v0.8/Denominations.sol";

import {IPriceFeedRouter} from './IPriceFeedRouter.sol';


contract PriceFeedRouter is IPriceFeedRouter {

    FeedRegistryInterface internal registry;

    constructor(address _registry) {
        registry = FeedRegistryInterface(_registry);
    }

    function getAssetPriceETH(address asset) external override view returns (int256) {
        return getPrice(asset, Denominations.ETH);
    }

    /**
   * Returns the latest price
   */
    function getPrice(address asset, address quote) public override view returns (int256) {
        (,int256 price,,,) = registry.latestRoundData(asset, quote);
        require(price > 0, 'PriceFeedRouter: Asset price is not known or 0.');
        return price;
    }
}
