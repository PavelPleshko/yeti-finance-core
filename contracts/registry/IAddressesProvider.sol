pragma solidity ^0.8.0;

interface IAddressesProvider {
    event AddressChanged(bytes32 forId, address newAddress);
    event AdminChanged(address newAddress);
    event MarketProtocolUpdated(address implementation);
    event AssetPoolManagerUpdated(address implementation);
    event ProxyCreated(bytes32 forId, address proxyAddress);

    function setMarketAdmin(address newAddress) external;

    function getMarketAdmin() view external returns(address);

    /**
    * @dev Hard sets address of certain component in the Yeti architecture
    * and emits event.
    * @param forId - The component id. Ex.: MARKET_PROTOCOL.
    * @param newAddress - Address of the new implementation of this component.
    */
    function setAddress(bytes32 forId, address newAddress) external;

    function getMarketProtocol() external view returns(address);

    function setMarketProtocol(address _impl) external;

    function getAssetPoolManager() external view returns(address);

    function setAssetPoolManager(address _impl) external;
}
