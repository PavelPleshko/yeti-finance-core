pragma solidity ^0.8.0;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "openzeppelin-solidity/contracts/proxy/utils/UUPSUpgradeable.sol";
import "../shared/VersionedInit.sol";
import "./IDebtTrackerToken.sol";


contract DebtTrackerToken is IDebtTrackerToken, VersionedInit, ERC20('DebtTracker_TOKEN', 'D'), UUPSUpgradeable {

    event Initialized(
        address underlying,
        address assetPool,
        uint8 debtTokenDecimals,
        string debtTokenName,
        string debtTokenSymbol
    );

    address private _assetPool;
    address private _underlying;
    string private _name;
    string private _symbol;
    uint8 private _decimals;

    // needs to be incremented manually if new implementation needs to be deployed
    uint256 public constant YETI_VERSION = 0x1;

    modifier onlyAssetPool {
        require(msg.sender == _assetPool, 'DebtTrackerToken: Only asset pool can perform this operation.');
        _;
    }

    function getVersion() public pure override returns (uint256) {
        return YETI_VERSION;
    }

    function initialize(
        address underlying,
        address assetPool,
        uint8 debtTokenDecimals,
        string calldata debtTokenName,
        string calldata debtTokenSymbol
    ) external initializer {

        _setName(debtTokenName);
        _setSymbol(debtTokenSymbol);
        _setDecimals(debtTokenDecimals);
        _underlying = underlying;
        _assetPool = assetPool;

        emit Initialized(
            underlying,
            address(assetPool),
            debtTokenDecimals,
            debtTokenName,
            debtTokenSymbol
        );
    }

    function mint(
        address account,
        uint256 amount,
        uint256 borrowRate
    ) external override onlyAssetPool {
        uint256 scaledBorrow = amount / borrowRate;
        require(scaledBorrow > 0, 'DebtTrackerToken: Mint amount should be > 0');
        _mint(account, scaledBorrow);

        emit Mint(account, scaledBorrow, borrowRate);
    }

    function _setName(string memory newName) internal {
        _name = newName;
    }

    function _setSymbol(string memory newSymbol) internal {
        _symbol = newSymbol;
    }

    function _setDecimals(uint8 newDecimals) internal {
        _decimals = newDecimals;
    }

    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyAssetPool {
    }
}
