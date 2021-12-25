pragma solidity ^0.8.0;

import "openzeppelin-solidity/contracts/access/Ownable.sol";
import "openzeppelin-solidity/contracts/proxy/utils/UUPSUpgradeable.sol";
import "./YetiStorageLayout.sol";
import "../registry/IAddressesProvider.sol";
import "../shared/VersionedInit.sol";
import "./IYeti.sol";
import {DataTypesYeti} from './DataTypesYeti.sol';

/**
 * @title Main interaction point with Yeti protocol. Implementation contract initialized via {UpgradeableProxy}.
 * {AddressesProvider} contract address is provided in initializer function, so it has access to the all components
 * in the scope of protocol.
 * @dev TODO
 * @author YetiCORP
 */
contract Yeti is IYeti, VersionedInit, UUPSUpgradeable, YetiStorageLayout {

    uint256 private constant YETI_VERSION = 0x1;

    function getVersion() public pure override returns (uint256) {
        return YETI_VERSION;
    }

    modifier onlyAssetPoolManager {
        _onlyAssetPoolManager();
        _;
    }

    function initialize(IAddressesProvider provider) public initializer {
        addressesProvider = provider;
    }

    function createNewAsset(address asset, address lpToken) external override onlyAssetPoolManager {
        require(_assets[asset].yetiToken == address(0), 'Yeti: Asset has been already created');
        DataTypesYeti.PoolAssetData memory data = DataTypesYeti.PoolAssetData({
            id : _totalAssets++,
            yetiToken : lpToken
        });
        _assets[asset] = data;

        _assetsList[_totalAssets - 1] = asset;

        emit AssetCreated(asset, lpToken);
    }

    function getAsset(address underlying) external view override returns (DataTypesYeti.PoolAssetData memory) {
        return _assets[underlying];
    }

    function getAllAssets() external view override returns (DataTypesYeti.PoolAssetData[] memory) {
        DataTypesYeti.PoolAssetData[] memory result = new DataTypesYeti.PoolAssetData[](_totalAssets);

        for (uint256 i = 0; i < _totalAssets; i++) {
            address assetAddress = _assetsList[i];
            result[i] = _assets[assetAddress];
        }

        return result;
    }

    function _onlyAssetPoolManager() internal view {
        require(
            addressesProvider.getAssetPoolManager() == msg.sender,
            'Yeti: Can be called only by AssetPoolManager'
        );
    }

    /**
    * @dev part of UUPS-proxy upgrade flow. Should be called by the owner of this contract (proxy itself).
    */
    function _authorizeUpgrade(address newImplementation) internal override {
        require(msg.sender == address(addressesProvider), 'Yeti: Needs to be upgraded only via addresses provider contract.');
    }
}
