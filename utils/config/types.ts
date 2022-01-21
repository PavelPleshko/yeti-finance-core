import BigNumber from 'bignumber.js';
import { YetiContracts } from '../contract-factories';

export interface InterestStrategy {
    id: string;
    baseInterest: string;
    maxStableUtilization: string;
    normalSlope: string;
    jumpSlope: string;
}

export interface AssetConfig {
    yetiTokenContract: YetiContracts;
    decimals: number;
    borrowingAvailable: boolean;
    commissionFactor: string; // in %
    interestStrategy: InterestStrategy;
}


export enum LendingPoolAssets {
    DAI = 'DAI',
    USDC = 'USDC',
}
