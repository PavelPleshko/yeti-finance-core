import { YetiContracts } from '../contract-factories';


export interface AssetConfig {
    yetiTokenContract: YetiContracts;
    decimals: number;
    borrowingAvailable: boolean;
    commissionFactor: string; // in %
}


export enum LendingPoolAssets {
    DAI = 'DAI',
    USDC = 'USDC',
}
