// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.8.0;

interface IPriceFeedRouter {
    function getAssetPriceETH(address asset) external view returns(int256);

    function getPrice(address base, address quote) external view returns (int256);
}
