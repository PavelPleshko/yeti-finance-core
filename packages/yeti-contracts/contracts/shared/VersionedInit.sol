pragma solidity ^0.8.0;

abstract contract VersionedInit {
    /**
     * @dev Indicates that the contract is in the process of being initialized.
     */
    bool private _initializing;

    uint256 private _initializedVersion = 0;

    /**
     * @dev Modifier to protect an initializer function from being invoked twice with
     * the same version
     */
    modifier initializer {
        uint256 currentVer = getVersion();
        require(currentVer > _initializedVersion && !_initializing, 'VersionedInit: This version has been already initialized.');

        bool isTopLevelCall = !_initializing;

        if (isTopLevelCall) {
            _initializing = true;
            _initializedVersion = currentVer;
        }

        _;

        if (isTopLevelCall) {
            _initializing = false;
        }
    }

    function getVersion() public pure virtual returns (uint256);

    // get some extra space for layout so when inheriting it does not corrupt/overwrite the storage layout by accident
    uint256[50] private _____placeholder;
}
