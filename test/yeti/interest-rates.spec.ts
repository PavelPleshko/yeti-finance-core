import BigNumber from 'bignumber.js';
import { expect } from 'chai';
import { utils } from 'ethers';
import { getSignerAccounts } from '../../utils/contract-deploy';
import { getMarketProtocol } from '../../utils/contract-factories';
import { wrapInEnv } from '../setup/tests-setup.spec';
import { depositAsset } from '../test-helpers/deposit';

wrapInEnv('InterestRates', testEnv => {

    it('should adjust the borrow rate in asset pool on borrow action', async () => {
        const { USDC, DAI } = testEnv.contracts;
        const USDCConfig = testEnv.config.assetsConfig['USDC'];

        const [ user1, user2 ] = await getSignerAccounts();
        const amountUSDC = utils.parseUnits('100', USDCConfig.decimals);
        await depositAsset({ assetAddress: USDC.address, amount: amountUSDC, signer: user1, lock: false });
        const marketProtocol = await getMarketProtocol();

        const assetPool = await marketProtocol.getAsset(USDC.address);
        const prevBorrowRate = new BigNumber(assetPool.currentBorrowRate.toString());
        expect(prevBorrowRate.isEqualTo(USDCConfig.interestStrategy.baseInterest));

        expect(assetPool.currentBorrowRate.toString() === '0', 'When there are no borrows, borrow rate should be 0');

        const amountDAI = utils.parseUnits('100', testEnv.config.assetsConfig['DAI'].decimals);
        await depositAsset({ assetAddress: DAI.address, amount: amountDAI, signer: user2, lock: true });

        const borrowAmount = utils.parseUnits('20', USDCConfig.decimals);
        await (await getMarketProtocol(user2)).borrow(USDC.address, borrowAmount);

        // here we need to see if the borrow rate has been adjusted
        const newAssetState = await marketProtocol.getAsset(USDC.address);
        expect(new BigNumber(assetPool.currentBorrowRate.toString()).isLessThan(new BigNumber(newAssetState.currentBorrowRate.toString())),
            'Borrow rate should increase with less resources available');
    });
});
