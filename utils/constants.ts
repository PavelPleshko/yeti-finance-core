import { BigNumber } from 'bignumber.js';
import { utils } from 'ethers';


export const etherFactor = new BigNumber(utils.parseEther('1').toString());

export const rayFactor = new BigNumber(Math.pow(10, 27));
export const wadFactor = new BigNumber(Math.pow(10, 18));
