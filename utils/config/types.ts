import { YetiContracts } from '../contract-factories';


export interface AssetConfig {
    yetiTokenContract: YetiContracts;
    decimals: number;
    borrowingAvailable: boolean;
}


export enum LendingPoolAssets {
    DAI = 'DAI',
    USDC = 'USDC',
}
