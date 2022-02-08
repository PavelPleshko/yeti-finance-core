import BigNumber from 'bignumber.js';
import { expect } from 'chai';
import { utils } from 'ethers';
import { rayFactor } from '../../utils/constants';
import { getSignerAccounts } from '../../utils/contract-deploy';
import { getInterfaceAtAddress, getMarketProtocol, YetiContracts } from '../../utils/contract-factories';
import { getCurrentBlock, travelToFuture } from '../misc/evm-commands';
import { wrapInEnv } from '../setup/tests-setup.spec';
import { depositAsset } from '../test-helpers/deposit';
import {
    calculateCompoundedInterest,
    calculateNewBorrowIndex,
    calculateNewLiquidityIndex,
    calculateSimpleInterest
} from '../test-helpers/interest-rates-calculations';
import { fulfillBorrowRequirements } from '../test-helpers/users';

wrapInEnv('InterestRates', testEnv => {

    it('should adjust the borrow rate in asset pool on borrow action', async () => {
        const { USDC } = testEnv.contracts;
        const USDCConfig = testEnv.config.assetsConfig['USDC'];

        const [ borrower ] = await getSignerAccounts();
        await fulfillBorrowRequirements(
            20,
            'USDC',
            borrower,
        );
        const marketProtocol = await getMarketProtocol();
        const assetPool = await marketProtocol.getAsset(USDC.address);

        const prevBorrowRate = new BigNumber(assetPool.currentBorrowRate.toString());
        expect(prevBorrowRate.isEqualTo(USDCConfig.interestStrategy.baseInterest));

        expect(assetPool.currentBorrowRate.toString() === '0', 'When there are no borrows, borrow rate should be 0');

        const borrowAmount = utils.parseUnits('20', USDCConfig.decimals);
        await (await getMarketProtocol(borrower)).borrow(USDC.address, borrowAmount);

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
        const { USDC } = testEnv.contracts;
        const USDCConfig = testEnv.config.assetsConfig['USDC'];
        const baseBorrowRate = new BigNumber(USDCConfig.interestStrategy.baseInterest);
        const [ , borrower ] = await getSignerAccounts();
        const marketProtocol = await getMarketProtocol();

        const allowedToBorrow = await fulfillBorrowRequirements(
          50000,
          'USDC',
          borrower,
        );

        await marketProtocol.connect(borrower).borrow(USDC.address, allowedToBorrow.dividedBy(2).toFixed());
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

        await fulfillBorrowRequirements(
            availableLiquidity.div(10 ** assetInfo.config.currencyDecimals).toNumber(),
            'USDC',
            borrower,
        );

        await marketProtocol.connect(borrower).borrow(USDC.address, availableLiquidity);

        const borrowRateWithDepletedResource = (await marketProtocol.getAsset(USDC.address)).currentBorrowRate.toString();

        const expectedBorrowRateWithDepletedResource = new BigNumber(USDCConfig.interestStrategy.jumpSlope).plus(baseBorrowRate);

        expect(borrowRateWithDepletedResource.toString()).to.be.equal(expectedBorrowRateWithDepletedResource.toFixed());
    });
});


wrapInEnv('Accrued interests', testEnv => {

    it('should accrue interests over time', async () => {
        const { USDC } = testEnv.contracts;
        const USDCConfig = testEnv.config.assetsConfig['USDC'];
        const marketProtocol = await getMarketProtocol();
        const [ investor, borrower ] = await getSignerAccounts();

        const borrowAmount = await fulfillBorrowRequirements(
            1000,
            'USDC',
            borrower,
        );

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
        const accruedDebt = calculateCompoundedInterest(
            new BigNumber(assetInfo.currentBorrowRate.toString()),
            assetInfo.lastUpdated.toNumber(),
            currentBlock.timestamp,
        );
        const expectedBorrowIndex = calculateNewBorrowIndex(accruedDebt, new BigNumber(assetInfo.currentBorrowIndex.toString()));
        expect(newAssetInfo.currentBorrowIndex.toString()).to.equal(expectedBorrowIndex.toFixed());

        const accruedInterest = calculateSimpleInterest(
            new BigNumber(assetInfo.currentLiquidityRate.toString()),
            assetInfo.lastUpdated.toNumber(),
            currentBlock.timestamp,
        );
        const expectedLiquidityIndex = calculateNewLiquidityIndex(accruedInterest, new BigNumber(assetInfo.currentLiquidityIndex.toString()));
        expect(newAssetInfo.currentLiquidityIndex.toString()).to.equal(expectedLiquidityIndex.toFixed());
    });
});
