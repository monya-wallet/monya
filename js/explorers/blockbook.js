const axios = require('axios');
const qs = require('qs');

module.exports = class BlockbookExplorer {
    constructor(endpoint, explorer) {
        this.apiEndpoint = endpoint;
        this.explorer = explorer;
    }

    pushTx(hex) {
        return 
    }

    getTxs(from, to, addrs) {
        return 
    }

    getTx(txId) {
        return 
    }

    getBlocks() {
        return 
    }

    getUtxos(addressList) {
        return 
    }

    getAddressProp(propName, address, noTxList) {
        return 
    }

    explorerUrls(opt) {
        const urls = [];
        if (opt.txId) {
            urls.push(this.explorer + "/tx/" + opt.txId);
        }
        if (opt.address) {
            urls.push(this.explorer + "/address/" + opt.txId);
        }
        if (opt.blockHash) {
            urls.push(this.explorer + "/block/" + opt.blockHash);
        }
        return urls;
    }
}