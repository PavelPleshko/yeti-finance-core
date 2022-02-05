import BigNumber from 'bignumber.js';
import { expect } from 'chai';
import { utils } from 'ethers';
import { rayFactor } from '../../utils/constants';
import { getSignerAccounts } from '../../utils/contract-deploy';
import { getInterfaceAtAddress, getMarketProtocol, YetiContracts } from '../../utils/contract-factories';
import { getCurrentBlock, travelToFuture } from '../misc/evm-commands';
import { wrapInEnv } from '../setup/tests-setup.spec';
import { depositAsset } from '../test-helpers/deposit';
import { calculateCompoundedInterest, calculateNewBorrowRate } from '../test-helpers/interest-rates-calculations';

wrapInEnv('InterestRates', testEnv => {

    it('should adjust the borrow rate in asset pool on borrow action', async () => {
        const { USDC, DAI } = testEnv.contracts;
        const USDCConfig = testEnv.config.assetsConfig['USDC'];

        const [ user1, user2 ] = await getSignerAccounts();
        const amountUSDC = utils.parseUnits('100', USDCConfig.decimals);
        await depositAsset({ assetAddress: USDC.address, amount: amountUSDC.toString(), signer: user1, lock: false });
        const marketProtocol = await getMarketProtocol();

        const assetPool = await marketProtocol.getAsset(USDC.address);
        const prevBorrowRate = new BigNumber(assetPool.currentBorrowRate.toString());
        expect(prevBorrowRate.isEqualTo(USDCConfig.interestStrategy.baseInterest));

        expect(assetPool.currentBorrowRate.toString() === '0', 'When there are no borrows, borrow rate should be 0');

        const amountDAI = utils.parseUnits('100', testEnv.config.assetsConfig['DAI'].decimals);
        await depositAsset({ assetAddress: DAI.address, amount: amountDAI.toString(), signer: user2, lock: true });

        const borrowAmount = utils.parseUnits('20', USDCConfig.decimals);
        await (await getMarketProtocol(user2)).borrow(USDC.address, borrowAmount);

        // here we need to see if the borrow rate has been adjusted
        const newAssetState = await marketProtocol.getAsset(USDC.address);
        expect(new BigNumber(assetPool.currentBorrowRate.toString()).isLessThan(new BigNumber(newAssetState.currentBorrowRate.toString())),
            'Borrow rate should increase with less resources available');
    });
});


wrapInEnv('Borrow rate', testEnv => {

    it('should have base borrow rate if nobody is borrowing', async () => {
        const { USDC } = testEnv.contracts;
        const USDCConfig = testEnv.config.assetsConfig['USDC'];
        const baseBorrowRate = USDCConfig.interestStrategy.baseInterest;
        const marketProtocol = await getMarketProtocol();
        const [ investor ] = await getSignerAccounts();
        await depositAsset({
            assetAddress: USDC.address,
            signer: investor,
            amount: new BigNumber(1000 * (10 ** USDCConfig.decimals)).toFixed(),
            lock: false,
        });

        const assetInfo = await marketProtocol.getAsset(USDC.address);

        expect(assetInfo.currentBorrowRate).to.be.equal(baseBorrowRate);
    });

    it('should adjust borrow rate for asset based on snowball strategy', async () => {
        const { USDC, DAI } = testEnv.contracts;
        const USDCConfig = testEnv.config.assetsConfig['USDC'];
        const baseBorrowRate = new BigNumber(USDCConfig.interestStrategy.baseInterest);
        const [ , borrower ] = await getSignerAccounts();
        const marketProtocol = await getMarketProtocol();

        const amountDAI = utils.parseUnits('1000', testEnv.config.assetsConfig['DAI'].decimals);
        await depositAsset({ assetAddress: DAI.address, amount: amountDAI.toString(), signer: borrower, lock: true });

        const borrowAmount = new BigNumber(500 * (10 ** USDCConfig.decimals));
        await marketProtocol.connect(borrower).borrow(USDC.address, borrowAmount.toFixed());
        const assetInfo = await marketProtocol.getAsset(USDC.address);

        const debtToken = await getInterfaceAtAddress(assetInfo.debtTrackerToken, YetiContracts.DebtToken)();
        const totalDebt = await debtToken.totalSupply();
        const availableLiquidity = await USDC.balanceOf(assetInfo.yetiToken);

        const totalResources = availableLiquidity.add(totalDebt);
        const utilRate = new BigNumber(totalDebt.toString()).dividedBy(new BigNumber(totalResources.toString()));
        expect(utilRate.toNumber() < +USDCConfig.interestStrategy.maxStableUtilization).to.be.true;


        const expectedBorrowRate = utilRate.multipliedBy(USDCConfig.interestStrategy.normalSlope)
            .dividedBy(USDCConfig.interestStrategy.maxStableUtilization).plus(baseBorrowRate.dividedBy(rayFactor));

        const actualBorrowRate = (await marketProtocol.getAsset(USDC.address)).currentBorrowRate.toString();
        expect(expectedBorrowRate.toFixed()).to.be.equal(new BigNumber(actualBorrowRate).dividedBy(rayFactor).toFixed());
    });

    it('should adjust borrow rate correspondingly for asset when utilisation is above threshold', async () => {
        const { USDC } = testEnv.contracts;
        const USDCConfig = testEnv.config.assetsConfig['USDC'];
        const baseBorrowRate = new BigNumber(USDCConfig.interestStrategy.baseInterest);
        const [ , borrower ] = await getSignerAccounts();
        const marketProtocol = await getMarketProtocol();

        const assetInfo = await marketProtocol.getAsset(USDC.address);
        const availableLiquidity = await USDC.balanceOf(assetInfo.yetiToken);

        await marketProtocol.connect(borrower).borrow(USDC.address, availableLiquidity);

        const borrowRateWithDepletedResource = (await marketProtocol.getAsset(USDC.address)).currentBorrowRate.toString();

        const expectedBorrowRateWithDepletedResource = new BigNumber(USDCConfig.interestStrategy.jumpSlope).plus(baseBorrowRate);

        expect(borrowRateWithDepletedResource.toString()).to.be.equal(expectedBorrowRateWithDepletedResource.toFixed());
    });
});


wrapInEnv('Accrued interests', testEnv => {

    it('should accrue debt over time', async () => {
        const { USDC, DAI } = testEnv.contracts;
        const USDCConfig = testEnv.config.assetsConfig['USDC'];
        const marketProtocol = await getMarketProtocol();
        const [ investor, borrower ] = await getSignerAccounts();

        await depositAsset({
            assetAddress: USDC.address,
            signer: investor,
            amount: new BigNumber(1000 * (10 ** USDCConfig.decimals)).toFixed(),
            lock: false,
        });

        const amountDAI = utils.parseUnits('1000', testEnv.config.assetsConfig['DAI'].decimals);
        await depositAsset({ assetAddress: DAI.address, amount: amountDAI.toString(), signer: borrower, lock: true });

        const borrowAmount = new BigNumber(500 * (10 ** USDCConfig.decimals));
        await marketProtocol.connect(borrower).borrow(USDC.address, borrowAmount.toFixed());
        const assetInfo = await marketProtocol.getAsset(USDC.address);

        expect(assetInfo.currentBorrowIndex.toString()).to.be.equal(rayFactor.toFixed());

        const timePassed = 60 * 60 * 24 * 100; // 10 days
        await travelToFuture(timePassed);

        // trigger updates on reserve indexes
        await depositAsset({
            assetAddress: USDC.address,
            signer: investor,
            amount: new BigNumber(10 * (10 ** USDCConfig.decimals)).toFixed(),
            lock: false,
        });

        const newAssetInfo = await marketProtocol.getAsset(USDC.address);

        const currentBlock = await getCurrentBlock();
        const accruedInterest = calculateCompoundedInterest(
            new BigNumber(assetInfo.currentBorrowRate.toString()),
            assetInfo.lastUpdated.toNumber(),
            currentBlock.timestamp,
        );
        const expectedBorrowRate = calculateNewBorrowRate(accruedInterest, new BigNumber(assetInfo.currentBorrowIndex.toString()));
        expect(newAssetInfo.currentBorrowIndex.toString()).to.equal(expectedBorrowRate.toFixed());
    });
});
