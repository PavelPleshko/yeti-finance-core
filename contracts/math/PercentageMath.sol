pragma solidity ^0.8.0;


library PercentageMath {
    uint256 internal constant PERCENTAGE_FACTOR = 1e4;
    uint256 internal constant HALF_PERCENT = PERCENTAGE_FACTOR / 2;

    /**
    * @return One percent, 1e4
    */
    function percentageFactor() internal pure returns (uint256) {
        return PERCENTAGE_FACTOR;
    }

    function percentMul(uint256 a, uint256 b) pure internal returns (uint256) {
        if (b == 0 || a == 0) {
            return 0;
        }
        return (a * b + HALF_PERCENT) / PERCENTAGE_FACTOR;
    }

    function percentDiv(uint256 a, uint256 b) pure internal returns (uint256) {
        uint256 halfB = b / 2;
        return (a * PERCENTAGE_FACTOR + halfB) / b;
    }
}
