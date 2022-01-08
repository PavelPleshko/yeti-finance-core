import { BigNumber } from 'ethers';
import { expect } from 'chai';
import { Yeti } from '../../typechain';

import { findEventLog, getSignerAccounts, waitForTransaction } from '../../utils/contract-deploy';
import { getInterfaceAtAddress, YetiContracts } from '../../utils/contract-factories';
import { wrapInEnv } from '../setup/tests-setup.spec';

wrapInEnv('Lock collateral', testEnv => {
    let marketProtocol: Yeti;

    beforeEach(async () => {
        const { addressesProvider } = testEnv.contracts;
        marketProtocol = await (getInterfaceAtAddress(await addressesProvider.getMarketProtocol(), YetiContracts.Yeti)());
    });

    it('should not lock collateral if user\'s balance for this token is empty', async () => {
        const { USDC } = testEnv.contracts;

        await expect(marketProtocol.lockCollateral(USDC.address, BigNumber.from(300)))
            .to.be.revertedWith('Yeti: Amount to lock exceeds the available free balance for asset.');
    });

    it('should not lock collateral if user\'s balance for this token is less than passed', async () => {
        const { USDC } = testEnv.contracts;

        const toLockAmount = BigNumber.from(300);
        const lessThanLockAmount = toLockAmount.sub(1);
        await USDC.mint(lessThanLockAmount);
        await USDC.approve(marketProtocol.address, lessThanLockAmount);

        await marketProtocol.deposit(USDC.address, lessThanLockAmount, testEnv.deployer, false);

        await expect(marketProtocol.lockCollateral(USDC.address, toLockAmount))
            .to.be.revertedWith('Yeti: Amount to lock exceeds the available free balance for asset.');
    });

    it('should lock correct amount of collateral', async () => {
        const { USDC } = testEnv.contracts;
        const signer = (await getSignerAccounts())[2];

        const toLockAmount = BigNumber.from(300);
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
        const depositAmount = BigNumber.from(300);
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
        const toLockAmount = BigNumber.from(300);

        await waitForTransaction(await USDC.mint(toLockAmount));
        await waitForTransaction(await USDC.approve(marketProtocol.address, toLockAmount));
        await marketProtocol.deposit(USDC.address, toLockAmount, testEnv.deployer, true);

        await expect(marketProtocol.unlockCollateral(USDC.address, toLockAmount.add(1)))
            .to.be.revertedWith('Yeti: Amount to unlock exceeds the locked amount for asset.');

        const unlockTx = await waitForTransaction(await marketProtocol.unlockCollateral(USDC.address, toLockAmount));

        const unlockEvent = findEventLog(unlockTx.events || [], 'CollateralStatusChanged');
        expect(unlockEvent?.args?.asset).to.be.equal(USDC.address);
        expect(unlockEvent?.args?.isLocked).to.be.equal(false);
        expect(unlockEvent?.args?.amount).to.be.equal(toLockAmount);
    });
});
