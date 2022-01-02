pragma solidity ^0.8.0;

import '../registry/IAddressesProvider.sol';
import {DataTypesYeti} from './DataTypesYeti.sol';

/**
* @title Storage layout for {Yeti} contract
* @dev Serves as a base contract that should be inherited by {Yeti} and should
* never change the order of storage variables declaration otherwise will be overriden
* accidentally in inheriting contract.
*/
contract YetiStorageLayout {

    IAddressesProvider internal addressesProvider;

    // asset address to asset data mapping. For ex.: USDC -> struct representing yUSDC token management.
    mapping(address => DataTypesYeti.PoolAssetData) internal _assets;

    mapping(uint256 => address) internal _assetsList;

    uint256 internal _totalAssets;
}
