pragma solidity ^0.8.0;

import "openzeppelin-solidity/contracts/proxy/utils/UUPSUpgradeable.sol";
import "../registry/IAddressesProvider.sol";
import "../protocol/YetiStorageLayout.sol";
import "../shared/VersionedInit.sol";


contract YetiMockUpgrade is VersionedInit, UUPSUpgradeable, YetiStorageLayout {
    // next version. Only for tests.
    uint256 private constant YETI_VERSION = 0x2;

    function getVersion() public pure override returns (uint256) {
        return YETI_VERSION;
    }

    function initialize (IAddressesProvider _addressesProvider) external initializer {
        addressesProvider = _addressesProvider;
    }

    function _authorizeUpgrade(address newImplementation) internal override {}
}
