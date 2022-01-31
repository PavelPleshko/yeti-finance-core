// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.8.0;

library DataTypesYeti {

    struct PoolAssetConfig {
        uint256 commissionFactor; // in %
        uint8 currencyDecimals; // 18 for ETH
        address interestStrategy;
    }

    struct PoolAssetData {
        //the sequential id of the asset
        uint256 id;
        //LP token
        address yetiToken;

        address debtTrackerToken;

        uint256 currentLiquidityIndex;

        uint256 currentBorrowIndex;

        uint256 currentBorrowRate;

        uint256 currentLiquidityRate;

        uint256 lastUpdated;

        PoolAssetConfig config;
    }

    struct AccountData {
        mapping(address => uint256) assetsLocked;
        mapping(address => bool) borrowing;
    }
}
