pragma solidity ^0.8.0;

import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";


interface IYToken is IERC20 {

    function mint(
        address account,
        uint256 amount
    ) external;

    function accruedFees() external view returns(uint256);

    function totalBorrows() external view returns(uint256);

    function transferUnderlyingAsset(address to, uint256 amount) external;
}
