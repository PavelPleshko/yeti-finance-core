pragma solidity ^0.8.0;


interface IAssetInterestStrategy {

    function getAssetRates (uint256 availableLiquidity,
        uint256 totalDebt) external view returns(uint256 utilRate, uint256 borrowRate, uint256 liquidityRate);
}
