pragma solidity ^0.8.0;

import "openzeppelin-solidity/contracts/access/Ownable.sol";
import "openzeppelin-solidity/contracts/proxy/utils/UUPSUpgradeable.sol";
import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";
import "./YetiStorageLayout.sol";
import "../registry/IAddressesProvider.sol";
import "../shared/VersionedInit.sol";
import "./IYeti.sol";
import {DataTypesYeti} from './DataTypesYeti.sol';
import '../tokens/IYToken.sol';
import {AssetStateManager} from '../assets/AssetStateManager.sol';

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

    function deposit(
        address asset,
        uint256 amount,
        address interestReceiver,
        bool lockAsCollateral
    ) public {
        require(amount > 0, 'Yeti: Amount cannot be 0');
        DataTypesYeti.PoolAssetData storage poolAsset = _assets[asset];
        // TODO update liquidity, interest rates

        AssetStateManager.updateRates(poolAsset, asset, amount, 0);
        address yToken = poolAsset.yetiToken;

        IERC20(asset).transferFrom(interestReceiver, yToken, amount);
        IYToken(yToken).mint(interestReceiver, amount);

        emit Deposit(asset, interestReceiver, amount);

        if (lockAsCollateral) {
            lockCollateral(asset, amount);
        }
    }

    function lockCollateral (address asset, uint256 amount) public override {
        DataTypesYeti.PoolAssetData memory assetPool = _assets[asset];

        DataTypesYeti.AccountData storage accountData = _accounts[msg.sender];
        uint256 userBalance = IYToken(assetPool.yetiToken).balanceOf(msg.sender);
        uint256 availableToLock = userBalance == 0 ? 0 : userBalance - accountData.assetsLocked[asset];
        require(availableToLock >= amount, 'Yeti: Amount to lock exceeds the available free balance for asset.');

        accountData.assetsLocked[asset] = accountData.assetsLocked[asset] + amount;

        emit CollateralStatusChanged(asset, true, userBalance, msg.sender);
    }

    function unlockCollateral (address asset, uint256 amount) public override {
        DataTypesYeti.PoolAssetData memory assetPool = _assets[asset];

        DataTypesYeti.AccountData storage accountData = _accounts[msg.sender];
        uint256 availableToUnlock = accountData.assetsLocked[asset];
        require(availableToUnlock >= amount, 'Yeti: Amount to unlock exceeds the locked amount for asset.');

        accountData.assetsLocked[asset] = accountData.assetsLocked[asset] - amount;

        emit CollateralStatusChanged(asset, false, amount, msg.sender);
    }

    function createNewAsset(
        address asset,
        address lpToken,
        address assetManagerAddress
    ) external override onlyAssetPoolManager {
        require(_assets[asset].yetiToken == address(0), 'Yeti: Asset has been already created');
        DataTypesYeti.PoolAssetData storage newAsset = _assets[asset];
        newAsset.id = _totalAssets++;
        newAsset.yetiToken = lpToken;

        _assetsList[_totalAssets - 1] = asset;

        emit AssetCreated(asset, lpToken);
    }

    function setAssetConfig(address asset, DataTypesYeti.PoolAssetConfig memory newConfig) public override onlyAssetPoolManager {
        _assets[asset].config = newConfig;
    }

    function getAsset(address underlying) external view override returns (DataTypesYeti.PoolAssetData memory) {
        return _assets[underlying];
    }

    function getAccountCollateralState(address account) external view override returns (CollateralEntry[] memory) {
        mapping(address => uint256) storage accountCollateralInfo = _accounts[account].assetsLocked;

        CollateralEntry[] memory result = new CollateralEntry[](_totalAssets);
        for (uint256 i = 0; i < _totalAssets; i++) {
            address assetAddress = _assetsList[i];
            result[i] = CollateralEntry(assetAddress, accountCollateralInfo[assetAddress]);
        }

        return result;
    }

    function getAllAssets() external view override returns (DataTypesYeti.PoolAssetData[] memory) {
        DataTypesYeti.PoolAssetData[] memory result = new DataTypesYeti.PoolAssetData[](_totalAssets);

        for (uint256 i = 0; i < _totalAssets; i++) {
            address assetAddress = _assetsList[i];
            result[i] = _assets[assetAddress];
        }

        return result;
    }

//    // TODO move to lib
//    function _setExchangeRateInternal(IERC20 underlying, DataTypesYeti.PoolAssetData storage asset) internal returns (uint256) {
//        uint256 exchangeRate;
//        IYToken yToken = IYToken(asset.yetiToken);
//
//        if (yToken.totalSupply() == 0) {
//            asset.currentExchangeRate = 1;
//        } else {
//            uint256 totalUnderlyingAvailable = underlying.balanceOf(asset.yetiToken);
//            uint256 totalBorrows = yToken.totalBorrows();
//            asset.currentExchangeRate = (totalUnderlyingAvailable + totalBorrows) / yToken.totalSupply();
//        }
//        return asset.currentExchangeRate;
//    }

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
