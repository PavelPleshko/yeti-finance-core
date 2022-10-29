import BigNumber from 'bignumber.js';
import { rayFactor } from '../constants';
import { InterestStrategy } from './types';


export const stableStrategy: InterestStrategy = {
    id: '1',
    baseInterest: new BigNumber(0.04).multipliedBy(rayFactor).toFixed(),
    maxStableUtilization: new BigNumber(0.85).multipliedBy(rayFactor).toFixed(),
    normalSlope: new BigNumber(0.04).multipliedBy(rayFactor).toFixed(),
    jumpSlope: new BigNumber(0.5).multipliedBy(rayFactor).toFixed()
};

export const stableStrategy2: InterestStrategy = {
    id: '2',
    baseInterest: new BigNumber(0.02).multipliedBy(rayFactor).toFixed(),
    maxStableUtilization: new BigNumber(0.7).multipliedBy(rayFactor).toFixed(),
    normalSlope: new BigNumber(0.04).multipliedBy(rayFactor).toFixed(),
    jumpSlope: new BigNumber(0.5).multipliedBy(rayFactor).toFixed(),
};
