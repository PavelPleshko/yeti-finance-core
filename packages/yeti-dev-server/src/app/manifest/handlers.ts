import express from 'express';

import { fetchManifest } from './operations';

export const manifestRouter = express.Router();

manifestRouter.get('/', async (req, res) => {
    const manifest = await fetchManifest();
    res.send(manifest);
});
