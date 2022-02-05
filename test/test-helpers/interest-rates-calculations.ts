import BigNumber from 'bignumber.js';

import { rayFactor, SECONDS_ONE_YEAR } from '../../utils/constants';
import { FloatMath } from '../misc/ray-math-calculations';


export const calculateCompoundedInterest = (rate: BigNumber, lastUpdate: number, currentTime: number): BigNumber => {
    const timeDelta = new BigNumber(currentTime - lastUpdate);
    const accumulationSpeedPerSecond = rate
        .div(SECONDS_ONE_YEAR)
        .decimalPlaces(0, BigNumber.ROUND_DOWN);

    return FloatMath.rPow(accumulationSpeedPerSecond.plus(rayFactor), timeDelta);
};

export const calculateNewBorrowRate = (accruedInterest: BigNumber, currentBorrowRate: BigNumber): BigNumber => {
    return FloatMath.rMul(accruedInterest, currentBorrowRate);
};
