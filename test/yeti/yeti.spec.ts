import { BigNumber } from 'bignumber.js';
import { expect } from 'chai';
import { Yeti } from '../../typechain';
import { etherFactor } from '../../utils/constants';

import { findEventLog, getSignerAccounts, waitForTransaction } from '../../utils/contract-deploy';
import { getInterfaceAtAddress, YetiContracts } from '../../utils/contract-factories';
import { wrapInEnv } from '../setup/tests-setup.spec';
import { depositAsset } from '../test-helpers/deposit';

wrapInEnv('Lock collateral', testEnv => {
    let marketProtocol: Yeti;

    beforeEach(async () => {
        const { addressesProvider } = testEnv.contracts;
        marketProtocol = await (getInterfaceAtAddress(await addressesProvider.getMarketProtocol(), YetiContracts.Yeti)());
    });

    it('should not lock collateral if user\'s balance for this token is empty', async () => {
        const { USDC } = testEnv.contracts;

        await expect(marketProtocol.lockCollateral(USDC.address, new BigNumber(300).toString()))
            .to.be.revertedWith('Yeti: Amount to lock exceeds the available free balance for asset.');
    });

    it('should not lock collateral if user\'s balance for this token is less than passed', async () => {
        const { USDC } = testEnv.contracts;

        const toLockAmount = new BigNumber(300);
        const lessThanLockAmount = toLockAmount.minus(1).toString();
        await USDC.mint(lessThanLockAmount);
        await USDC.approve(marketProtocol.address, lessThanLockAmount);

        await marketProtocol.deposit(USDC.address, lessThanLockAmount, testEnv.deployer, false);

        await expect(marketProtocol.lockCollateral(USDC.address, toLockAmount.toString()))
            .to.be.revertedWith('Yeti: Amount to lock exceeds the available free balance for asset.');
    });

    it('should lock correct amount of collateral', async () => {
        const { USDC } = testEnv.contracts;
        const signer = (await getSignerAccounts())[2];

        const toLockAmount = new BigNumber(300).toString();
        await waitForTransaction(await USDC.connect(signer).mint(toLockAmount));
        await waitForTransaction(await USDC.connect(signer).approve(marketProtocol.address, toLockAmount));

        await marketProtocol.connect(signer).deposit(USDC.address, toLockAmount, signer.address, false);
        const lockTx = await waitForTransaction(await marketProtocol.connect(signer).lockCollateral(USDC.address, toLockAmount));

        const lockEvent = findEventLog(lockTx.events || [], 'CollateralStatusChanged');
        expect(lockEvent?.args?.asset).to.be.equal(USDC.address);
        expect(lockEvent?.args?.isLocked).to.be.equal(true);
        expect(lockEvent?.args?.amount).to.be.equal(toLockAmount);

        const lockedAmount = await marketProtocol.getAccountCollateralState(signer.address);
        expect(lockedAmount.find(collateralEntry => collateralEntry.asset === USDC.address)?.amount)
            .to.be.equal(toLockAmount);
    });

    it('should lock asset when depositing if requested by user', async () => {
        const { USDC } = testEnv.contracts;
        const [ , secondaryTestWallet ] = await getSignerAccounts();
        const connectedMarket = marketProtocol.connect(secondaryTestWallet);
        const connectedUSDC = USDC.connect(secondaryTestWallet);
        const depositAmount = new BigNumber(300).toString();
        await waitForTransaction(await connectedUSDC.mint(depositAmount));
        await waitForTransaction(await connectedUSDC.approve(marketProtocol.address, depositAmount));

        const depositTx = await connectedMarket.deposit(USDC.address, depositAmount, secondaryTestWallet.address, true);
        const lockedAmount = await connectedMarket.getAccountCollateralState(secondaryTestWallet.address);
        expect(lockedAmount.find(collateralEntry => collateralEntry.asset === USDC.address)?.amount)
            .to.be.equal(depositAmount);
    });
});


wrapInEnv('Unlock collateral', testEnv => {

    let marketProtocol: Yeti;

    beforeEach(async () => {
        const { addressesProvider } = testEnv.contracts;
        marketProtocol = await (getInterfaceAtAddress(await addressesProvider.getMarketProtocol(), YetiContracts.Yeti)());
    });

    it('should unlock requested amount if the locked amount >= requested and emit event', async () => {
        const { USDC } = testEnv.contracts;
        const [ signer ] = await getSignerAccounts();
        const toLockAmount = new BigNumber(300);

        await depositAsset({
            assetAddress: USDC.address,
            signer,
            amount: toLockAmount.toString(),
            lock: true,
        });

        await expect(marketProtocol.unlockCollateral(USDC.address, toLockAmount.plus(1).toString()))
            .to.be.revertedWith('Yeti: Amount to unlock exceeds the locked amount for asset.');

        const unlockTx = await waitForTransaction(await marketProtocol.unlockCollateral(USDC.address, toLockAmount.toString()));

        const unlockEvent = findEventLog(unlockTx.events || [], 'CollateralStatusChanged');
        expect(unlockEvent?.args?.asset).to.be.equal(USDC.address);
        expect(unlockEvent?.args?.isLocked).to.be.equal(false);
        expect(unlockEvent?.args?.amount).to.be.equal(toLockAmount.toString());
    });
});


wrapInEnv('Borrow Validation', testEnv => {

    let marketProtocol: Yeti;

    before(async () => {
        const { addressesProvider } = testEnv.contracts;
        marketProtocol = await (getInterfaceAtAddress(await addressesProvider.getMarketProtocol(), YetiContracts.Yeti)());
    });

    it('should not allow borrowing without or with collateral value less that requested', async () => {
        const { USDC, feedRegistryMock, DAI } = testEnv.contracts;
        const USDUnitPriceInETH = etherFactor.multipliedBy(2);
        const DAIUnitPriceInETH = etherFactor.multipliedBy(4);
        const [ depositor, borrower ] = await getSignerAccounts();
        const USDCFactor = new BigNumber(10**testEnv.config.assetsConfig['USDC'].decimals);
        const DAIFactor = new BigNumber(10**testEnv.config.assetsConfig['DAI'].decimals);
        const availableLiquidityUSDC = new BigNumber(10).multipliedBy(USDCFactor); // 10 USDC

        await feedRegistryMock.setPriceForAsset(USDC.address, USDUnitPriceInETH.toFixed());
        await feedRegistryMock.setPriceForAsset(DAI.address, DAIUnitPriceInETH.toFixed());
        await depositAsset({
            assetAddress: USDC.address,
            signer: depositor,
            amount: availableLiquidityUSDC.toFixed(),
            lock: true
        });


        await expect(marketProtocol.connect(borrower).borrow(USDC.address, availableLiquidityUSDC.toFixed()))
            .to.be.revertedWith('OpsValidation: Locked collateral is not enough');

        const satisfactoryTotalCollateralPrice = availableLiquidityUSDC.dividedBy(USDCFactor).multipliedBy(USDUnitPriceInETH); // 0.002 ETH
        const daiAssetsToDeposit = satisfactoryTotalCollateralPrice.dividedBy(DAIUnitPriceInETH).multipliedBy(DAIFactor); // 0.002 ETH worth as well

        await depositAsset({
            assetAddress: DAI.address,
            signer: borrower,
            amount: daiAssetsToDeposit.toString(),
            lock: true,
        });

        await expect(marketProtocol.connect(borrower).borrow(USDC.address, availableLiquidityUSDC.toFixed()))
            .to.be.revertedWith('OpsValidation: Locked collateral is not enough');


        await depositAsset({
            assetAddress: DAI.address,
            signer: borrower,
            amount: new BigNumber(1).toFixed(),
            lock: true,
        });

        await marketProtocol.connect(borrower).borrow(USDC.address, availableLiquidityUSDC.toFixed());
    });
});
