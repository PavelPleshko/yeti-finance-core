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

    event AssetCreated(address indexed asset, address token);

    event Deposit(
        address indexed asset,
        address assetProvider,
        uint256 amount
    );

    event CollateralStatusChanged(
        address indexed asset,
        bool isLocked,
        uint256 amount,
        address user
    );

    function createNewAsset(
        address asset,
        address lpToken,
        address assetManagerAddress
    ) external;

    function lockCollateral (address asset, uint256 amount) external;

    function unlockCollateral (address asset, uint256 amount) external;

    function setAssetConfig(address asset, DataTypesYeti.PoolAssetConfig memory newConfig) external;

    function getAsset(address underlying) external view returns (DataTypesYeti.PoolAssetData memory);

    function getAccountCollateralState(address account) external view returns (CollateralEntry[] memory);

    function getAllAssets() external view returns (DataTypesYeti.PoolAssetData[] memory);
}
