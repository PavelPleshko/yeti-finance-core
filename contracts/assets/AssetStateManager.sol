pragma solidity ^0.8.0;

import {DataTypesYeti} from '../protocol/DataTypesYeti.sol';
import {IYToken} from '../tokens/IYToken.sol';
import {IDebtTrackerToken} from '../tokens/IDebtTrackerToken.sol';
import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";
import {IAssetInterestStrategy} from '../interest-strategy/IAssetInterestStrategy.sol';
import "../interest-strategy/IAssetInterestStrategy.sol";
import {FloatMath} from "../math/FloatMath.sol";

library AssetStateManager {

    uint256 internal constant ONE_YEAR = 365 days;

    function accrueInterest (DataTypesYeti.PoolAssetData storage asset) internal {
        uint256 pureTotalDebt = IDebtTrackerToken(asset.debtTrackerToken).totalSupply();
        uint256 prevLiquidityIndex = asset.currentLiquidityIndex;
        uint256 prevBorrowIndex = asset.currentBorrowIndex;

        if (prevLiquidityIndex > 0) {
            uint256 accruedInterest = getSimpleInterest(asset.currentLiquidityRate, asset.lastUpdated);
            asset.currentLiquidityIndex = FloatMath.rMul(accruedInterest, asset.currentLiquidityIndex);

            if (pureTotalDebt > 0) {
                uint256 accruedBorrowInterest = getCompoundedInterest(asset.currentBorrowRate, asset.lastUpdated);
                asset.currentBorrowIndex = FloatMath.rMul(accruedBorrowInterest, asset.currentBorrowIndex);
            }
        }
        asset.lastUpdated = uint256(block.timestamp);
    }

    function updateRates(
        DataTypesYeti.PoolAssetData storage asset,
        address assetAddress,
        uint256 addedAmount,
        uint256 takenAmount
    ) internal {
        uint256 totalBorrows = IDebtTrackerToken(asset.debtTrackerToken).totalSupply();
        uint256 availableLiquidity = IERC20(assetAddress).balanceOf(asset.yetiToken) + addedAmount - takenAmount;

        IAssetInterestStrategy interestStrategy = IAssetInterestStrategy(asset.config.interestStrategy);
        (uint256 utilRate, uint256 newBorrowRate, uint256 newLiquidityRate) = interestStrategy.getAssetRates(availableLiquidity, totalBorrows);

        asset.currentBorrowRate = newBorrowRate;
        asset.currentLiquidityRate = newLiquidityRate;
    }

    function getSimpleInterest(uint256 liquidityRate, uint256 timeOfLastUpdate) view internal returns(uint256) {
        uint256 timeDelta = block.timestamp - timeOfLastUpdate;

        return (liquidityRate * timeDelta) / ONE_YEAR + FloatMath.ray(); // 1.---
    }

    function getCompoundedInterest (uint256 rate, uint256 timeOfLastUpdate) view internal returns(uint256) {
        uint256 timeDelta = block.timestamp - timeOfLastUpdate;

        uint256 accumulationSpeedPerSecond = rate / ONE_YEAR;

        return FloatMath.rPow(accumulationSpeedPerSecond + FloatMath.ray(), timeDelta);
    }
}
