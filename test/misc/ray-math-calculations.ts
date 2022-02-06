import BigNumber from 'bignumber.js';

import { rayFactor } from '../../utils/constants';

/**
 * In solidity floats are rounded down, this is a helper
 * to make certain operations behave as in solidity.
 */
export const roundDown = (num: BigNumber): BigNumber => {
    return num.decimalPlaces(0, BigNumber.ROUND_DOWN);
};

const halfRay = roundDown(rayFactor.div(2));

/**
 * A set of functions that imitate calculation operations used in
 * smart contracts where the arguments are represented in RAY.
 */
export class FloatMath {

    static rMul (a: BigNumber, b: BigNumber): BigNumber {
        const result = halfRay.plus(a.multipliedBy(b)).div(rayFactor);
        return roundDown(result);
    }

    static rDiv (a: BigNumber, b: BigNumber): BigNumber {
        const halfB = roundDown(b.div(2));
        const result = halfB.plus(a.multipliedBy(rayFactor)).div(b);
        return roundDown(result);
    }

    static rPow (a: BigNumber, exp: BigNumber): BigNumber {
        let z = !exp.modulo(2).eq(0) ? a : new BigNumber(rayFactor);
        let x = new BigNumber(a)
        for (exp = roundDown(exp.div(2)); !exp.eq(0); exp = roundDown(exp.div(2))) {
            x = FloatMath.rMul(x, x);

            if (!exp.modulo(2).eq(0)) {
                z = FloatMath.rMul(z, x);
            }
        }
        return z;
    }
}
