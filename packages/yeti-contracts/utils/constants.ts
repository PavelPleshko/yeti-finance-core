import { BigNumber } from 'bignumber.js';
import { utils } from 'ethers';


export const etherFactor = new BigNumber(utils.parseEther('1').toString());

export const rayFactor = new BigNumber(10).pow(27);
// export const wadFactor = new BigNumber(Math.pow(10, 18));


export const SECONDS_ONE_YEAR = 60 * 60 * 24 * 365; // seconds * minutes * hours * days
