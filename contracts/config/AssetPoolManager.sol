pragma solidity ^0.8.0;

import "openzeppelin-solidity/contracts/access/Ownable.sol";
import "openzeppelin-solidity/contracts/proxy/utils/UUPSUpgradeable.sol";
import "openzeppelin-solidity/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";
import "../registry/IAddressesProvider.sol";
import "../protocol/IYeti.sol";
import "../shared/VersionedInit.sol";

contract AssetPoolManager is VersionedInit, Ownable, UUPSUpgradeable {
    IAddressesProvider internal addressesProvider;

    struct CreatePositionInput {
        address yTokenImpl;
        string yTokenName;
        string yTokenSymbol;
        uint8 underlyingDecimals;
        address underlying;
        address piggyBank;
        string underlyingName;
        bytes params;
    }

    uint256 private constant ASSET_POOL_VERSION = 0x1;

    function getVersion() public pure override returns (uint256) {
        return ASSET_POOL_VERSION;
    }

    modifier onlyMarketAdmin {
        require(addressesProvider.getMarketAdmin() == msg.sender, 'AssetPoolManager: call was not performed by gateway owner');
        _;
    }

    function initialize(IAddressesProvider _addressesProvider) public initializer {
        addressesProvider = _addressesProvider;
    }

    function initPosition(CreatePositionInput calldata input) external onlyMarketAdmin {
        // TODO init tokens here and put into market protocol
        require(input.underlying != input.yTokenImpl, 'AssetPoolManager: Asset and LP token addresses can not be equal');
        IYeti assetPool = IYeti(addressesProvider.getMarketProtocol());

        address yetiTokenProxy = _initializeTokenWithProxy(
            input.yTokenImpl,
            abi.encodeWithSignature('initialize(address,address,uint8,string,string)',
                input.underlying, address(this), input.underlyingDecimals, input.yTokenName, input.yTokenSymbol)
        );

        assetPool.createNewAsset(
            input.underlying,
            yetiTokenProxy
        );
    }

    function _initializeTokenWithProxy(address tokenImpl, bytes memory initData) internal returns (address) {
        ERC1967Proxy tokenProxy = new ERC1967Proxy(tokenImpl, initData);

        return address(tokenProxy);
    }

    /**
    * @dev part of UUPS-proxy upgrade flow. Should be called by the owner of this contract (proxy itself).
    */
    function _authorizeUpgrade(address newImplementation) internal override {}
}
