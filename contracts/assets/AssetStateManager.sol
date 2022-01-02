pragma solidity ^0.8.0;

import {DataTypesYeti} from '../protocol/DataTypesYeti.sol';
import {IYToken} from '../tokens/IYToken.sol';
import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";

library AssetStateManager {

//    using AssetStateManager for DataTypesYeti.PoolAssetData;

    function updateRates (
        DataTypesYeti.PoolAssetData storage asset,
        address assetAddress,
        uint256 addedAmount,
        uint256 takenAmount
) internal {
        uint256 totalBorrows = IYToken(asset.yetiToken).totalBorrows();
        uint256 availableLiquidity = IERC20(assetAddress).balanceOf(asset.yetiToken) + addedAmount - takenAmount;
        uint256 utilizationRate = totalBorrows == 0 ? 0 : (totalBorrows / (availableLiquidity + totalBorrows));
        asset.liquidityIndex = totalBorrows * utilizationRate;
    }
}
