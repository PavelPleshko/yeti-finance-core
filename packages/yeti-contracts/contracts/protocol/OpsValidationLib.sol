pragma solidity ^0.8.0;

import {DataTypesYeti} from './DataTypesYeti.sol';
import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";
import "../price-oracle/IPriceFeedRouter.sol";
import "../tokens/IDebtTrackerToken.sol";
import "../tokens/IYToken.sol";


library OpsValidationLib {

    function validateBorrowOperation(
        address asset,
        uint256 amount,
        uint256 amountInETH,
        DataTypesYeti.PoolAssetData storage borrowingAsset,
        mapping(uint256 => address) storage assetList,
        uint256 totalAssets,
        DataTypesYeti.AccountData storage accountData,
        mapping(address => DataTypesYeti.PoolAssetData) storage allAssets,
        IPriceFeedRouter oracle
    ) internal view {
        require(amount > 0, 'OpsValidation: Amount should be more than 0');
        require(IERC20(asset).balanceOf(borrowingAsset.yetiToken) >= amount, 'OpsValidation: Requested amount is more than available');


        (uint256 totalAmountLockedInETH, uint256 totalDebt) = getAccountSummary(
            msg.sender,
            totalAssets,
            assetList,
            allAssets,
            accountData,
            oracle
        );

        require(totalAmountLockedInETH > (amountInETH + totalDebt), 'OpsValidation: Locked collateral is not enough');

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

    function validateWithdrawOperation(
        address asset,
        uint256 amount,
        address account,
        DataTypesYeti.PoolAssetData storage assetData
    ) internal view {
        require(amount > 0, 'OpsValidation: amount cannot be 0');
        address yToken = assetData.yetiToken;

        require(IERC20(asset).balanceOf(yToken) >= amount, 'OpsValidation: Not enough liquidity in the pool');
        require(IYToken(yToken).balanceOf(account) >= amount, 'OpsValidation: Not enough balance');
    }

    function validatePaybackOperation(
        address asset,
        uint256 amount,
        uint256 debt
    ) internal view {
        require(amount > 0, 'OpsValidation: amount cannot be 0');
        require(debt > 0, 'OpsValidation: amount of debt cannot be 0');
    }

    struct AccountSummaryLocals {
        address currentAsset;
        DataTypesYeti.PoolAssetData assetData;
        uint256 assetPrice;
        uint256 assetsLocked;
        uint256 assetsBorrowed;
    }

    function getAccountSummary(
        address account,
        uint256 totalAssets,
        mapping(uint256 => address) storage assetList,
        mapping(address => DataTypesYeti.PoolAssetData) storage allAssets,
        DataTypesYeti.AccountData storage accountData,
        IPriceFeedRouter oracle
    ) view internal returns (uint256, uint256) {
        uint256 totalAmountLockedInETH;
        uint256 totalDebtInETH;
        AccountSummaryLocals memory locals;

        for (uint256 i = 0; i < totalAssets; i++) {
            locals.currentAsset = assetList[i];
            locals.assetData = allAssets[locals.currentAsset];
            locals.assetPrice = uint256(oracle.getAssetPriceETH(locals.currentAsset));

            if (!accountData.borrowing[locals.currentAsset]) {
                locals.assetsLocked = accountData.assetsLocked[locals.currentAsset];
                if (locals.assetsLocked > 0) {
                    totalAmountLockedInETH += ((locals.assetsLocked * locals.assetPrice) / (10 ** locals.assetData.config.currencyDecimals));
                }
            } else {
                locals.assetsBorrowed = IDebtTrackerToken(locals.assetData.debtTrackerToken).balanceOf(account);
                if (locals.assetsBorrowed > 0) {
                    totalDebtInETH += ((locals.assetsBorrowed * locals.assetPrice) / (10 ** locals.assetData.config.currencyDecimals));
                }

            }

        }
        return (
        totalAmountLockedInETH,
        totalDebtInETH
        );
    }
}
