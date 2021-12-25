import { expect } from 'chai';
import { constants, utils } from 'ethers';
import {
    deployAddressesProvider,
    deployYetiMockProtocol,
    deployYetiProtocol,
    findEventLog,
    getRecognizedEvents,
    getSignerAccounts,
    waitForTransaction
} from '../../utils/contract-deploy';


describe('Addresses Provider Upgradeability', () => {

    it('should allow upgrading the implementation proxies', async () => {
        const addressesProvider = await deployAddressesProvider();
        const firstImplementation = await deployYetiProtocol();

        await addressesProvider.setMarketProtocol(firstImplementation.address);

        const initialProxy = await addressesProvider.getMarketProtocol();
        expect(initialProxy !== constants.AddressZero, 'Implementation have not been set');
        const secondImplementation = await deployYetiMockProtocol();
        await addressesProvider.setMarketProtocol(secondImplementation.address);

        expect(await addressesProvider.getMarketProtocol() === initialProxy,
            'Proxy address should not be changed when upgraded implementation');
    });

    it('should not allow upgrading the implementation proxies if they are of the same version', async () => {
        const addressesProvider = await deployAddressesProvider();
        const firstImplementation = await deployYetiProtocol();

        await addressesProvider.setMarketProtocol(firstImplementation.address);

        await addressesProvider.getMarketProtocol();

        const secondImplementation = await deployYetiProtocol();
        await expect(addressesProvider.setMarketProtocol(secondImplementation.address)).to.be.revertedWith(
            'VersionedInit: This version has been already initialized.'
        );
    });

    it('should not allow upgrading if not admin', async () => {
        const [ , nonOwnerAccount ] = await getSignerAccounts();
        const yeti = await deployYetiProtocol();
        const addressesProvider = await deployAddressesProvider();

        await expect(
            addressesProvider.connect(nonOwnerAccount).setAddress(utils.formatBytes32String('RANDOM_VALUE_ID'), yeti.address)
        ).to.be.revertedWith('Ownable: caller is not the owner');

        await expect(
            addressesProvider.connect(nonOwnerAccount).setMarketProtocol(yeti.address)
        ).to.be.revertedWith('Ownable: caller is not the owner');
    });

    it('should revert upgrade if called by non-proxy address/without delegate call', async () => {
        const yetiImpl = await deployYetiProtocol();
        const addressesProvider = await deployAddressesProvider();

        await addressesProvider.setMarketProtocol(yetiImpl.address);

        const anotherImpl = await deployYetiProtocol();
        await expect(yetiImpl.upgradeTo(anotherImpl.address)).to.be.revertedWith('Function must be called through delegatecall');
    });

    it('should emit events with correct args when creating/upgrading proxy', async () => {
        const yeti = await deployYetiProtocol();
        const addressesProvider = await deployAddressesProvider();
        const txLog = await waitForTransaction(
            await addressesProvider.setMarketProtocol(yeti.address)
        );
        const [ proxyCreation, marketProtocolUpdate ] = getRecognizedEvents(txLog.events!);

        const proxyAddress = await addressesProvider.getMarketProtocol();

        // check if events were emitted
        expect(proxyCreation.event).to.be.equal('ProxyCreated');
        expect(marketProtocolUpdate.event).to.be.equal('MarketProtocolUpdated');

        // check if events have correct args
        expect(proxyCreation.args?.proxyAddress).to.be.equal(proxyAddress);
        expect(marketProtocolUpdate.args?.implementation).to.be.equal(yeti.address);

        // deploy new instance in the same test
        const newYetiImpl = await deployYetiMockProtocol();
        const txLogUpdateImpl = await waitForTransaction(
            await addressesProvider.setMarketProtocol(newYetiImpl.address)
        );
        expect(findEventLog(txLogUpdateImpl.events || [], 'ProxyCreated')).to.be.equal(undefined);

        // compare implementation addresses
        const marketProtocolSecondUpdate = findEventLog(txLogUpdateImpl.events!, 'MarketProtocolUpdated');
        expect(marketProtocolUpdate.args?.implementation !== marketProtocolSecondUpdate!.args?.implementation,
            'implementations should change');
    });
});
