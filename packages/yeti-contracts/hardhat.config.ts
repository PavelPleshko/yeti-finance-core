import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { HardhatUserConfig } from 'hardhat/config';
import '@nomiclabs/hardhat-etherscan';
import '@nomiclabs/hardhat-waffle';
import '@typechain/hardhat';
import 'hardhat-gas-reporter';
import 'solidity-coverage';

dotenv.config();

const SKIP_TASKS_LOAD = process.env.SKIP_TASKS_LOAD === 'true';

if (!SKIP_TASKS_LOAD) {
    // load tasks first so hardhat can see their definitions
    const TASKS_PATH = path.join(__dirname, 'tasks/deployments');

    ['migrations', 'setup'].forEach(folderName => {
        fs.readdirSync(path.join(TASKS_PATH, folderName)).forEach(fileName => {
            // we need only ts files because they contain tasks definitions
            if (fileName.endsWith('.ts')) {
                require(path.join(TASKS_PATH, folderName, fileName));
            }
        });
    });
}

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const config: HardhatUserConfig = {
    solidity: '0.8.4',
    networks: {
        ropsten: {
            url: process.env.ROPSTEN_URL || '',
            accounts:
                process.env.PRIVATE_KEY !== undefined ? [ process.env.PRIVATE_KEY ] : [],
        },
        // when contracts deployed on local hardhat node
        node: {
            url: 'http://127.0.0.1:8545',
        },
    },
    gasReporter: {
        enabled: true,
        currency: 'USD',
    },
    etherscan: {
        apiKey: process.env.ETHERSCAN_API_KEY,
    },
};

export default config;
