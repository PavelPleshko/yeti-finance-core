import express from 'express';
import cors from 'cors';
import { getDefaultProvider, Contract } from 'ethers';
import { AddressesProvider, Yeti, YToken } from '../typechain';
import { ADDRESSES_PROVIDER_ABI } from './app/contracts/abis/addresses-provider';
import { MARKET_PROTOCOL_ABI } from './app/contracts/abis/market-protocol';
import { YTOKEN_ABI } from './app/contracts/abis/ytoken';

import { fetchManifest, manifestRouter } from './app/manifest';
import { SERVER_PORT } from './config/constants';
import { getCurrentProcessNetworkConfig } from './config/networks';

const app = express();

const currentConfig = getCurrentProcessNetworkConfig();
const web3Provider = getDefaultProvider(currentConfig!.url);

// setup middleware over here
app.use(cors());

app.use('/protocol-manifest', manifestRouter);

// TODO move to feature protocol stats
app.get('/total-liquidity', async (req, res) => {
    const manifest = await fetchManifest();

    const addressesProvider = new Contract(
        manifest['hardhat.AddressesProvider'],
        ADDRESSES_PROVIDER_ABI,
    ).connect(web3Provider) as AddressesProvider;
    const marketProtocolAddress = await addressesProvider.getMarketProtocol();
    const marketProtocol = new Contract(marketProtocolAddress, MARKET_PROTOCOL_ABI)
        .connect(web3Provider) as Yeti;
    const allAssets = await marketProtocol.getAllAssets();
    const allBalances = Promise.all(allAssets.map(({ yetiToken }) => {
        return (new Contract(yetiToken, YTOKEN_ABI) as YToken).connect(web3Provider).totalSupply();
    }));


    res.send(await allBalances);
});

app.use((req, res) => {
    // TODO add nicer 404 handling
    res.status(404).send('Sorry, that route doesn\'t exist. Have a nice day :)');
});

app.listen(SERVER_PORT, () => {
    console.log(`Yeti Server is listening on port ${ SERVER_PORT }`);
});
