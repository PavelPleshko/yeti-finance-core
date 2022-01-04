import { expect } from 'chai';
import { utils } from 'ethers';
import { findEventLog, getSignerAccounts, waitForTransaction } from '../../utils/contract-deploy';
import { getInterfaceAtAddress, YetiContracts } from '../../utils/contract-factories';
import { wrapInEnv } from '../setup/tests-setup.spec';

wrapInEnv('Deposit', testEnv => {

    it('should not allow deposit operations with 0 amount', async () => {
        const { addressesProvider, USDC } = testEnv.contracts;
        const lendingProtocol = (await getInterfaceAtAddress(await addressesProvider.getMarketProtocol(), YetiContracts.Yeti)());
        await expect(lendingProtocol.deposit(USDC.address, 0, testEnv.deployer, false)).to.be.revertedWith('Yeti: Amount cannot be 0');
    });

    it('should transfer LP tokens to liquidity provider and deposit tokens to YToken', async () => {
        const { addressesProvider, USDC } = testEnv.contracts;
        const [ signer ] = await getSignerAccounts();

        const amountParsed = utils.parseUnits('100', testEnv.config.assetsConfig['USDC'].decimals);
        const lendingProtocol = (await getInterfaceAtAddress(await addressesProvider.getMarketProtocol(), YetiContracts.Yeti)());

        const assetsStorage = (await getInterfaceAtAddress((await lendingProtocol.getAsset(USDC.address)).yetiToken, YetiContracts.YToken)());
        await waitForTransaction(await USDC.mint(amountParsed, { from: signer.address }));
        await waitForTransaction(await USDC.approve(lendingProtocol.address, amountParsed, { from: signer.address }));

        const tx = await waitForTransaction(await lendingProtocol.deposit(USDC.address, amountParsed, signer.address, false));

        expect(await USDC.balanceOf(assetsStorage.address)).to.be.equal(amountParsed);
        expect(await assetsStorage.balanceOf(signer.address)).to.be.equal(amountParsed);

        const depositEvent = findEventLog(tx.events!, 'Deposit');

        expect(depositEvent?.args?.asset).to.be.equal(USDC.address);
        expect(depositEvent?.args?.assetProvider).to.be.equal(signer.address);
        expect(depositEvent?.args?.amount).to.be.equal(amountParsed);
    });
});
