pragma solidity ^0.8.0;


library FloatMath {
    uint256 internal constant RAY = 1e27;
    uint256 internal constant HALF_RAY = RAY / 2;
    uint256 internal constant MAX_UINT256 = 2**256 - 1;

    /**
    * @return One ray, 1e27
    */
    function ray() internal pure returns (uint256) {
        return RAY;
    }

    function rMul (uint256 a, uint256 b) pure internal returns(uint256) {
        if (b == 0 || a == 0) {
            return 0;
        }
        require(a <= (MAX_UINT256 - HALF_RAY) / b, 'FloatMath: multiplication overflow');
        return (a * b + HALF_RAY) / RAY;
    }

    function rDiv (uint256 a, uint256 b) pure internal returns(uint256) {
        uint256 halfB = b / 2;

        require(a <= (MAX_UINT256 - halfB) / RAY, 'FloatMath: multiplication overflow');
        return (a * RAY + halfB) / b;
    }
}
