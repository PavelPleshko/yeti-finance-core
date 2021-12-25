pragma solidity ^0.8.0;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "openzeppelin-solidity/contracts/proxy/utils/UUPSUpgradeable.sol";
import "../shared/VersionedInit.sol";

// name and symbol will be set by the LiquidityPoolConfig in initialize function
// since every underlying token requires its own Yeti token implementation since they overlying:underlying ratio
// must be 1:1
contract YToken is VersionedInit, ERC20('Yeti_TOKEN', 'Y'), UUPSUpgradeable {

    event Initialized(
        address underlying,
        address assetPool,
        uint8 yetiTokenDecimals,
        string yetiTokenName,
        string yetiTokenSymbol
    );

    address private _assetPool;
    address private _underlying;
    string private _name;
    string private _symbol;
    uint8 private _decimals;


    // needs to be incremented manually if new implementation needs to be deployed
    uint256 public constant YETI_VERSION = 0x1;

    function getVersion() public pure override returns (uint256) {
        return YETI_VERSION;
    }

    function initialize(
        address underlying,
        address assetPool,
        uint8 yetiTokenDecimals,
        string calldata yetiTokenName,
        string calldata yetiTokenSymbol
    ) external initializer {

        _setName(yetiTokenName);
        _setSymbol(yetiTokenSymbol);
        _setDecimals(yetiTokenDecimals);
        _underlying = underlying;
        _assetPool = assetPool;

        emit Initialized(
            underlying,
            address(assetPool),
            yetiTokenDecimals,
            yetiTokenName,
            yetiTokenSymbol
        );
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

    function _authorizeUpgrade(address newImplementation) internal override {
        require(msg.sender == _assetPool, 'YToken: Upgrade should happen via AssetPool');
    }
}
