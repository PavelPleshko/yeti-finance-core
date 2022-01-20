pragma solidity ^0.8.0;

import {DataTypesYeti} from '../protocol/DataTypesYeti.sol';
import {IAssetInterestStrategy} from './IAssetInterestStrategy.sol';
import {FloatMath} from '../math/FloatMath.sol';

contract SnowballInterestStrategy is IAssetInterestStrategy {

    // minimal interest for borrowing asset in ray
    uint256 immutable _baseInterest;
    uint256 immutable _maxStableUtilization; // in ray
    uint256 immutable _excessUtilization; // in ray
    uint256 immutable _normalSlope; // in ray
    uint256 immutable _jumpSlope; // in ray

    constructor(
        uint256 baseInterest,
        uint256 maxStableUtilization,
        uint256 normalSlope,
        uint256 jumpSlope
    ) {
        _baseInterest = baseInterest;
        _maxStableUtilization = maxStableUtilization;
        _excessUtilization = FloatMath.ray() - maxStableUtilization;
        _normalSlope = normalSlope;
        _jumpSlope = jumpSlope;
    }

    function getAssetRates(
        uint256 availableLiquidity,
        uint256 totalDebt
    ) public override view returns (uint256 utilRate, uint256 borrowRate) {
        uint256 utilRate = getUtilizationRate(availableLiquidity, totalDebt); // ex. 0.3456445

        uint256 borrowRate;
        if (utilRate >= _maxStableUtilization) {
            uint256 utilizationOverflowRate = FloatMath.rDiv(utilRate - _maxStableUtilization, _excessUtilization);
            borrowRate = FloatMath.rMul(_jumpSlope, utilizationOverflowRate) + _baseInterest;
        } else {
            borrowRate = FloatMath.rMul(_normalSlope, utilRate) + _baseInterest;
        }

        return (
            utilRate,
            borrowRate
        );
    }

    function getUtilizationRate(uint256 availableLiquidity, uint256 totalDebt) internal pure returns (uint256) {
        // Utilization rate is 0 when there are no borrows
        if (totalDebt == 0) {
            return 0;
        }
        return FloatMath.rDiv(totalDebt, availableLiquidity + totalDebt);
    }
}
