import { HardhatRuntimeEnvironment } from 'hardhat/types';


export let DEV_RE: HardhatRuntimeEnvironment;

/**
 *  Sets the dev runtime environment in global scope for
 *  availability.
 */
export const setDEV_RE = (_HRE: HardhatRuntimeEnvironment): void => {
    DEV_RE = _HRE;
};

export const IOC_SYMBOL = Symbol('Dependencies of env');
