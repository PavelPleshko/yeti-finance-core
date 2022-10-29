import BigNumber from 'bignumber.js';

import { rayFactor, SECONDS_ONE_YEAR } from '../../utils/constants';
import { FloatMath, roundDown } from '../misc/ray-math-calculations';


export const calculateSimpleInterest = (rate: BigNumber, lastUpdateTime: number, currentTime: number): BigNumber => {
    const timeDelta = new BigNumber(currentTime - lastUpdateTime);
    const accumulated = rate.multipliedBy(timeDelta).dividedBy(SECONDS_ONE_YEAR);

    return roundDown(accumulated).plus(rayFactor);
};

export const calculateCompoundedInterest = (rate: BigNumber, lastUpdateTime: number, currentTime: number): BigNumber => {
    const timeDelta = new BigNumber(currentTime - lastUpdateTime);
    const accumulationSpeedPerSecond = roundDown(rate.div(SECONDS_ONE_YEAR));

    return FloatMath.rPow(accumulationSpeedPerSecond.plus(rayFactor), timeDelta);
};

export const calculateNewBorrowIndex = (accruedInterest: BigNumber, currentBorrowIndex: BigNumber): BigNumber => {
    return FloatMath.rMul(accruedInterest, currentBorrowIndex);
};

export const calculateNewLiquidityIndex = (accruedInterest: BigNumber, currentLiquidityIndex: BigNumber): BigNumber => {
    return FloatMath.rMul(accruedInterest, currentLiquidityIndex);
};
