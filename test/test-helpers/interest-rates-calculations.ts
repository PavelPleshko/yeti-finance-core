import BigNumber from 'bignumber.js';

import { rayFactor, SECONDS_ONE_YEAR } from '../../utils/constants';
import { FloatMath, roundDown } from '../misc/ray-math-calculations';


export const calculateCompoundedInterest = (rate: BigNumber, lastUpdateTime: number, currentTime: number): BigNumber => {
    const timeDelta = new BigNumber(currentTime - lastUpdateTime);
    const accumulationSpeedPerSecond = roundDown(rate.div(SECONDS_ONE_YEAR));

    return FloatMath.rPow(accumulationSpeedPerSecond.plus(rayFactor), timeDelta);
};

export const calculateNewBorrowRate = (accruedInterest: BigNumber, currentBorrowRate: BigNumber): BigNumber => {
    return FloatMath.rMul(accruedInterest, currentBorrowRate);
};
