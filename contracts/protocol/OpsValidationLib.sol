pragma solidity ^0.8.0;

import {DataTypesYeti} from './DataTypesYeti.sol';
import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";

library OpsValidationLib {

    function validateBorrowOperation (
        address asset,
        uint256 amount,
        uint256 amountInETH,
        DataTypesYeti.PoolAssetData storage assetData,
        DataTypesYeti.AccountData storage accountData
    ) internal view {
        require(amount > 0, 'OpsValidation: Amount should be more than 0');
        require(IERC20(asset).balanceOf(assetData.yetiToken) > amount, 'OpsValidation: Requested amount is more than available');


        // TODO We need to loop through all assets and check if the locked or borrowing
        // amount is more than 0. In this case we continue looping.
        // We get the unit price of currently requested asset via oracle.
        // We then get the current balance of yToken of the user and validate that it is
        // more or equal to the locked as collateral. Then we calculate the total price of locked
        // collateral for asset in current iteration((price * totalLockedAsCollateral) / 10**decimals).
        // we add this number to total locked collateral in ETH.
        // If the current iteration asset is being borrowed by user -> we need total balance of debt tokens
        // associated with the asset. We calculate the value of debt in ETH for asset: ((price * totalDebtAmount) / 10**decimals).
        // We then take these two results and totalCollateralInETH / totalDebtAmount  should be more than 0 for borrow to be validated.
        // Once we get the total debt of the user in ETH value and whether he can borrow more we calculate how much of the
        // collateral needed taking into account the debt and the requested borrow in ETH equivalent.
        // if the amount of needed collateral is more than the amount that is currently locked by user then we throw.
        //
        // We should also forbid the borrowing if borrowed asset is used as collateral or if the amount requested is more
        // than 10% of total liquidity in the pool.
    }
}
