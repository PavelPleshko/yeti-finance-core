pragma solidity ^0.8.0;

import {DataTypesYeti} from '../protocol/DataTypesYeti.sol';
import {IYToken} from '../tokens/IYToken.sol';
import {IDebtTrackerToken} from '../tokens/IDebtTrackerToken.sol';
import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";
import {IAssetInterestStrategy} from '../interest-strategy/IAssetInterestStrategy.sol';
import "../interest-strategy/IAssetInterestStrategy.sol";


library AssetStateManager {

    function updateRates (
        DataTypesYeti.PoolAssetData storage asset,
        address assetAddress,
        uint256 addedAmount,
        uint256 takenAmount
) internal {
        uint256 totalBorrows = IDebtTrackerToken(asset.debtTrackerToken).totalSupply();
        uint256 availableLiquidity = IERC20(assetAddress).balanceOf(asset.yetiToken) + addedAmount - takenAmount;
        IAssetInterestStrategy interestStrategy = IAssetInterestStrategy(asset.config.interestStrategy);
        (uint256 utilRate, uint256 borrowRate) = interestStrategy.getAssetRates(availableLiquidity, totalBorrows);
        asset.currentBorrowRate = borrowRate;
    }
}
