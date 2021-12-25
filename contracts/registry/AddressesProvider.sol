pragma solidity ^0.8.0;

import "openzeppelin-solidity/contracts/access/Ownable.sol";
import {Address} from "openzeppelin-solidity/contracts/utils/Address.sol";
import "openzeppelin-solidity/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import "./IAddressesProvider.sol";

contract AddressesProvider is Ownable, IAddressesProvider {
    using Address for address;

    mapping(bytes32 => address) private _addresses;

    bytes32 private constant MARKET_PROTOCOL = 'MARKET_PROTOCOL';
    bytes32 private constant ASSET_POOL_MANAGER = 'ASSET_POOL_MANAGER';
    bytes32 private constant MARKET_ADMIN = 'MARKET_ADMIN';

    function setMarketAdmin (address admin) external override onlyOwner {
        require(admin != address(0), 'Admin must not be zero address');
        _addresses[MARKET_ADMIN] = admin;
        emit AdminChanged(admin);
    }

    function getMarketAdmin () external view override returns (address) {
        return _addresses[MARKET_ADMIN];
    }

    /**
    * @dev Hard sets address of certain component in the Yeti architecture
    * and emits event.
    * @param forId - The component id. Ex.: MARKET_PROTOCOL.
    * @param newAddress - Address of the new implementation of this component.
    */
    function setAddress(bytes32 forId, address newAddress) external override onlyOwner {
        _addresses[forId] = newAddress;
        emit AddressChanged(forId, newAddress);
    }

    function getMarketProtocol() external view override returns (address){
        return _addresses[MARKET_PROTOCOL];
    }

    function setMarketProtocol(address _impl) external override onlyOwner {
        _updateImplementation(MARKET_PROTOCOL, _impl);
        emit MarketProtocolUpdated(_impl);
    }

    function getAssetPoolManager() external view override returns (address){
        return _addresses[ASSET_POOL_MANAGER];
    }

    function setAssetPoolManager(address _impl) external override onlyOwner {
        _updateImplementation(ASSET_POOL_MANAGER, _impl);
        emit AssetPoolManagerUpdated(_impl);
    }

    /**
   * @dev Updates the implementation of component in the Yeti architecture.
   * Component is assumed to be a proxy so the corresponding update function is called.
    */
    function _updateImplementation(bytes32 id, address newImpl) internal {
        address storedProxy = _addresses[id];
        bytes memory initParams = abi.encodeWithSignature('initialize(address)', address(this));

        if (storedProxy == address(0)) {
            ERC1967Proxy newProxy = new ERC1967Proxy(newImpl, initParams);
            _addresses[id] = address(newProxy);
            emit ProxyCreated(id, address(newProxy));
        } else {
            // if there is some implementation already then just call initialize(address) function on it after updating
            bytes memory upgradeCallSignature = abi.encodeWithSignature("upgradeToAndCall(address,bytes)", newImpl, initParams);
            address(storedProxy).functionCall(upgradeCallSignature);
        }
    }
}
