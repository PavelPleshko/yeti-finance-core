import { task } from 'hardhat/config';
import { createEnv } from '../../../utils/env/ioc';
import { setDEV_RE } from '../../../utils/misc';

task('env:setup',
    `Sets up a development runtime object.
     Task needs to run prior to using any functions that make use of hardhat global object.`)
    .setAction(async (args, localBRE) => {
        setDEV_RE(localBRE);
        await createEnv();

        console.log('Env setup successfully.');
    });
