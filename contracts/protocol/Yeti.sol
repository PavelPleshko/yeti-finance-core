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
import {IPriceFeedRouter} from '../price-oracle/IPriceFeedRouter.sol';
import {OpsValidationLib} from "./OpsValidationLib.sol";
import "../tokens/IDebtTrackerToken.sol";
import "../math/FloatMath.sol";
import {SafeERC20} from "openzeppelin-solidity/contracts/token/ERC20/utils/SafeERC20.sol";

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
        // TODO rethink how to transfer it safely
        address interestReceiver,
        bool lockAsCollateral
    ) public override {
        // TODO move to validation
        require(amount > 0, 'Yeti: Amount cannot be 0');
        DataTypesYeti.PoolAssetData storage poolAsset = _assets[asset];

        AssetStateManager.accrueInterest(poolAsset);
        AssetStateManager.updateRates(poolAsset, asset, amount, 0);

        address yToken = poolAsset.yetiToken;

        SafeERC20.safeTransferFrom(IERC20(asset), msg.sender, yToken, amount);
        IYToken(yToken).mint(msg.sender, amount);

        if (lockAsCollateral) {
            lockCollateral(asset, amount);
        }

        emit Deposit(asset, msg.sender, amount);
    }

    function withdraw(
        address asset,
        uint256 amount
    ) external override {
        DataTypesYeti.PoolAssetData storage poolAsset = _assets[asset];
        DataTypesYeti.AccountData storage accountData = _accounts[msg.sender];
        uint256 lockedCollateralForAsset = accountData.assetsLocked[asset];
        address yToken = poolAsset.yetiToken;

        OpsValidationLib.validateWithdrawOperation(
            asset,
            amount,
            msg.sender,
            poolAsset
        );

        if (lockedCollateralForAsset > 0) {
            uint256 totalBalance = IYToken(yToken).balanceOf(msg.sender);

            uint256 removeFromCollateral = totalBalance - lockedCollateralForAsset > amount ?
            0 :
            amount - (totalBalance - lockedCollateralForAsset);

            if (removeFromCollateral > 0) {
                accountData.assetsLocked[asset] -= removeFromCollateral;
            }
        }

        AssetStateManager.accrueInterest(poolAsset);
        AssetStateManager.updateRates(poolAsset, asset, 0, amount);
        IYToken(yToken).burn(msg.sender, msg.sender, amount);

        emit Withdraw(asset, msg.sender, amount);
    }

    function borrow(
        address asset,
        uint256 amount
    ) public override {
        DataTypesYeti.PoolAssetData storage poolAsset = _assets[asset];
        DataTypesYeti.AccountData storage accountData = _accounts[msg.sender];

        IPriceFeedRouter priceFeedRouter = IPriceFeedRouter(addressesProvider.getPriceFeed());

        // oracle should estimate how much in ETH borrower wants to borrow
        uint256 priceInETH = (uint256(priceFeedRouter.getAssetPriceETH(asset)) * amount) / (10 ** poolAsset.config.currencyDecimals);

        // validate if the operation can be performed given new state
        OpsValidationLib.validateBorrowOperation(
            asset,
            amount,
            priceInETH,
            poolAsset,
            _assetsList,
            _totalAssets,
            accountData,
            _assets,
            priceFeedRouter
        );
        AssetStateManager.accrueInterest(poolAsset);

        // mint debt tokens
        IDebtTrackerToken(poolAsset.debtTrackerToken).mint(msg.sender, amount, poolAsset.currentBorrowRate);

        // update liquidity, borrow rates
        AssetStateManager.updateRates(poolAsset, asset, 0, amount);

        // issue loan
        IYToken(poolAsset.yetiToken).transferUnderlyingAsset(msg.sender, amount);

        if (!accountData.borrowing[asset]) {
            accountData.borrowing[asset] = true;
        }

        // emit borrow event
        emit Borrow(
            asset,
            msg.sender,
            amount,
            poolAsset.currentBorrowRate
        );
    }

    function payback(address asset, uint256 amount) external override {
        DataTypesYeti.PoolAssetData storage poolAsset = _assets[asset];
        uint256 accountDebt = IDebtTrackerToken(poolAsset.debtTrackerToken).balanceOf(msg.sender);
        OpsValidationLib.validatePaybackOperation(asset, amount, accountDebt);

        uint256 amountToPay = amount < accountDebt ? amount : accountDebt;

        AssetStateManager.accrueInterest(poolAsset);

        IDebtTrackerToken(poolAsset.debtTrackerToken).burn(msg.sender, amountToPay);

        SafeERC20.safeTransferFrom(IERC20(asset), msg.sender, poolAsset.yetiToken, amountToPay);

        AssetStateManager.updateRates(poolAsset, asset, amountToPay, 0);

        if (amountToPay >= accountDebt) {
            DataTypesYeti.AccountData storage accountData = _accounts[msg.sender];
            accountData.borrowing[asset] = false;
        }

        emit Payback(
            asset,
            msg.sender,
            amountToPay
        );
    }

    function lockCollateral(address asset, uint256 amount) public override {
        DataTypesYeti.PoolAssetData memory assetPool = _assets[asset];

        DataTypesYeti.AccountData storage accountData = _accounts[msg.sender];
        uint256 userBalance = IYToken(assetPool.yetiToken).balanceOf(msg.sender);
        uint256 availableToLock = userBalance == 0 ? 0 : userBalance - accountData.assetsLocked[asset];
        require(availableToLock >= amount, 'Yeti: Amount to lock exceeds the available free balance for asset.');

        accountData.assetsLocked[asset] = accountData.assetsLocked[asset] + amount;

        emit CollateralStatusChanged(asset, true, userBalance, msg.sender);
    }

    function unlockCollateral(address asset, uint256 amount) public override {
        DataTypesYeti.PoolAssetData memory assetPool = _assets[asset];

        DataTypesYeti.AccountData storage accountData = _accounts[msg.sender];
        uint256 availableToUnlock = accountData.assetsLocked[asset];
        require(availableToUnlock >= amount, 'Yeti: Amount to unlock exceeds the locked amount for asset.');

        accountData.assetsLocked[asset] = accountData.assetsLocked[asset] - amount;

        emit CollateralStatusChanged(asset, false, amount, msg.sender);
    }

    function getAccountSummary(address account) view external returns (uint256, uint256) {
        return OpsValidationLib.getAccountSummary(
            account,
            _totalAssets,
            _assetsList,
            _assets,
            _accounts[account],
            IPriceFeedRouter(addressesProvider.getPriceFeed())
        );
    }

    function createNewAsset(
        address asset,
        address lpTokenProxy,
        address debtTokenProxy,
        address interestRateLogic
    ) external override onlyAssetPoolManager {
        require(_assets[asset].yetiToken == address(0), 'Yeti: Asset has been already created');
        DataTypesYeti.PoolAssetData storage newAsset = _assets[asset];
        newAsset.id = _totalAssets++;
        newAsset.yetiToken = lpTokenProxy;
        newAsset.debtTrackerToken = debtTokenProxy;
        newAsset.currentBorrowIndex = FloatMath.ray();
        newAsset.currentLiquidityIndex = FloatMath.ray();
        newAsset.config.interestStrategy = interestRateLogic;

        _assetsList[_totalAssets - 1] = asset;

        emit AssetCreated(asset, lpTokenProxy, debtTokenProxy);
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
