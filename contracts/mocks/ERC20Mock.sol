// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.8.0;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "openzeppelin-solidity/contracts/proxy/utils/UUPSUpgradeable.sol";

contract ERC20Mock is ERC20, UUPSUpgradeable {
    uint8 private _decimals;

    constructor(
        string memory name,
        string memory symbol,
        uint8 decimals
    ) public ERC20(name, symbol) {
        _setupDecimals(decimals);
    }

    /**
     * @dev Function to mint tokens
   * @param value The amount of tokens to mint.
   * @return A boolean that indicates if the operation was successful.
   */
    function mint(uint256 value) public returns (bool) {
        _mint(_msgSender(), value);
        return true;
    }

    function decimals () public view override returns (uint8) {
        return _decimals;
    }

    function _setupDecimals(uint8 decimals) internal {
        _decimals = decimals;
    }

    function _authorizeUpgrade(address newImplementation) internal override {

    }
}
