pragma solidity ^0.8.0;

import {DataTypesYeti} from './DataTypesYeti.sol';

/**
 * @title Main interaction point with Yeti protocol. Implementation contract initialized via {UpgradeableProxy}.
 * {AddressesProvider} contract address is provided in initializer function, so it has access to the all components
 * in the scope of protocol.
 * @dev TODO
 * @author YetiCORP
 */
interface IYeti {

    struct CollateralEntry {
        address asset;
        uint256 amount;
    }

    event AssetCreated(
        address indexed asset,
        address token,
        address debtToken
    );

    function createNewAsset(
        address asset,
        address lpTokenProxy,
        address debtTokenProxy,
        address interestRateLogic
    ) external;

    event Deposit(
        address indexed asset,
        address assetProvider,
        uint256 amount
    );

    function deposit(
        address asset,
        uint256 amount,
        address interestReceiver,
        bool lockAsCollateral
    ) external;

    event Withdraw(
        address indexed asset,
        address withdrawer,
        uint256 amount
    );

    function withdraw(address asset, uint256 amount) external;

    event Borrow(
        address indexed asset,
        address indexed borrower,
        uint256 amount,
        uint256 borrowRateAtATime
    );

    function borrow(
        address asset,
        uint256 amount
    ) external;

    event Payback(
        address indexed asset,
        address indexed payer,
        uint256 amount
    );

    function payback(
        address asset,
        uint256 amount
    ) external;

    event CollateralStatusChanged(
        address indexed asset,
        bool isLocked,
        uint256 amount,
        address user
    );

    function lockCollateral(address asset, uint256 amount) external;

    function unlockCollateral(address asset, uint256 amount) external;

    function setAssetConfig(address asset, DataTypesYeti.PoolAssetConfig memory newConfig) external;

    function getAsset(address underlying) external view returns (DataTypesYeti.PoolAssetData memory);

    function getAccountCollateralState(address account) external view returns (CollateralEntry[] memory);

    function getAllAssets() external view returns (DataTypesYeti.PoolAssetData[] memory);
}
