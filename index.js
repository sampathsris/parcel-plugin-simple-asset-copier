const fs = require('fs-extra');
const path = require('path');

const assets = './assets';

function copyAssets(bundler) {
    bundler.on('bundled', async bundle =>
        fs.access(assets, fs.F_OK | fs.R_OK)
            .then(() => {
                let dest = path.dirname(bundle.name);
                
                return fs.copy(assets, dest, {
                    overwrite: true,
                    preserveTimestamps: true
                }).catch(err => {
                    console.error(`Could not copy files from ${assets} to ${dest}: ${err}`);
                });
            })
            .catch(err => {
                console.error(`Could not read assets directory: ${err}`);
            })
    );
}

module.exports = copyAssets;
