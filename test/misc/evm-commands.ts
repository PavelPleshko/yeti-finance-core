import { Block } from '@ethersproject/abstract-provider';
import { DEV_RE } from '../../utils/misc';


export const travelToFuture = async (seconds: number): Promise<void> => {
    await DEV_RE.ethers.provider.send('evm_increaseTime', [seconds]);
    await DEV_RE.ethers.provider.send('evm_mine', []);
};

export const getCurrentBlock = async (): Promise<Block> => {
    const blockNumBefore = await DEV_RE.ethers.provider.getBlockNumber();
    return await DEV_RE.ethers.provider.getBlock(blockNumBefore);
};
