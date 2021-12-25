pragma solidity ^0.8.0;

import { DataTypesYeti } from './DataTypesYeti.sol';

/**
 * @title Main interaction point with Yeti protocol. Implementation contract initialized via {UpgradeableProxy}.
 * {AddressesProvider} contract address is provided in initializer function, so it has access to the all components
 * in the scope of protocol.
 * @dev TODO
 * @author YetiCORP
 */
interface IYeti {

    event AssetCreated(address indexed asset, address token);

    function createNewAsset(address asset, address lpToken) external;

    function getAsset(address underlying) external view returns (DataTypesYeti.PoolAssetData memory);

    function getAllAssets() external view returns (DataTypesYeti.PoolAssetData[] memory);
}
