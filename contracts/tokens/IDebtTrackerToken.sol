pragma solidity ^0.8.0;

import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";


interface IDebtTrackerToken is IERC20 {

    event Mint(address indexed to, uint256 amount, uint256 borrowRate);

    function mint(
        address account,
        uint256 amount,
        uint256 borrowRate
    ) external;
}
