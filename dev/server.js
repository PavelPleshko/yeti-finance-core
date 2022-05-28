const fs = require('fs');
const http = require('http');

const DEFAULT_PORT = 8080;

/**
 * Dev server for serving deployments.json file for FE for now.
 * Later can be extended.
 */
http.createServer((req, res) => {
    fs.readFile(`${process.cwd()}${req.url}`, (err, data) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        if (err) {
            res.writeHead(404);
            res.end(JSON.stringify(err));
            return;
        }
        res.writeHead(200);
        res.end(data);
    });
}).listen(DEFAULT_PORT).once('listening', () => {
    console.log(`Dev server is listening on port ${DEFAULT_PORT}`);
});
