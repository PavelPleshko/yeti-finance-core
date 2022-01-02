// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.8.0;

library DataTypesYeti {

    struct PoolAssetConfig {
        uint256 commissionFactor; // in %
    }

    struct PoolAssetData {
        //the sequential id of the asset
        uint256 id;
        //LP token
        address yetiToken;

        uint256 liquidityIndex;

        PoolAssetConfig config;
    }
}
