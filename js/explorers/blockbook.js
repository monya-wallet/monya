const axios = require('axios');
const bitcoin = require('bitcoinjs-lib');
const BigNumber = require('bignumber.js');
const qs = require('qs');

module.exports = class BlockbookExplorer {
    constructor(endpoint, explorer) {
        this.apiEndpoint = endpoint;
        this.explorer = explorer;
    }

    pushTx(hex) {
        return axios({
            url: this.apiEndpoint + "/sendtx",
            data: hex,
            method: "POST"
        }).then(res => ({
            txid: res.data.result
        }));
    }

    getTxs(from, to, addrs) {
        throw new Error('Missing implementation: getTxs');
    }

    getTx(txId) {
        return axios({
            url: this.apiEndpoint + "/tx/" + txId,
            method: "GET"
        }).then(res => res.data).then(data => {
            // diff <(wget -qO- https://blockbook.electrum-mona.org/api/tx/ae3fda4b6ec6bb87c9df003f558e4391a00320de2350d8cb0954c9bdb5a85cd5 | jq -S) <(wget -qO- https://mona.chainsight.info/api/tx/ae3fda4b6ec6bb87c9df003f558e4391a00320de2350d8cb0954c9bdb5a85cd5 | jq -S) -u
            const tx = bitcoin.Transaction.fromHex(data.hex);
            // add sizes
            data.size = tx.byteLength();
            data.vsize = tx.virtualSize();
            // copy time
            data.time = data.blocktime;
            // convert valueOut, valueIn, fees to decimal
            data.valueOut = +data.valueOut;
            data.valueIn = +data.valueIn;
            data.fees = +data.fees;
            for (let vin of data.vin) {
                // choose address
                vin.addr = vin.addresses[0];
                // add asm
                vin.scriptSig.asm = bitcoin.script.toASM(Buffer.from(vin.scriptSig.hex, 'hex'));
                // convert value to satoshis/watanabes
                data.valueSat = +new BigNumber(data.value).times(100000000);
                // and to decimal
                data.value = +data.value;
            }
            for (let vout of data.vout) {
                // add asm
                vout.scriptPubKey.asm = bitcoin.script.toASM(Buffer.from(vout.scriptPubKey.hex, 'hex'));
            }
        });
    }

    getBlocks() {
        const blockAmount = 4;
        return axios({
            url: this.apiEndpoint + "/",
            method: "GET"
        }).then(res => res.data.blockbook.bestHeight).then(highest => {
            const hashPromise = [];
            for (let i = 0; i < blockAmount; i++) {
                hashPromise.push(
                    axios({
                        url: this.apiEndpoint + "/block-index/" + (highest - i),
                        method: "GET"
                    }).then(res => res.data.blockHash)
                );
            }
            return Promise.all(hashPromise);
        }).then(hashes => {
            const blockPromise = [];
            for (let i = 0; i < blockAmount; i++) {
                blockPromise.push(
                    axios({
                        url: this.apiEndpoint + "/block/" + hashes[i],
                        method: "GET"
                    }).then(res => res.data)
                );
            }
            // that's ok: all required keys set in this step
            return Promise.all(blockPromise);
        });
    }

    getUtxos(addressList) {
        const eachUtxoPromise = [];
        for (let addr of addressList) {
            const addr_ = addr;
            eachUtxoPromise.push(
                axios({
                    url: this.apiEndpoint + "/utxo/" + addr,
                    method: "GET"
                }).then(res => res.data).then(data => {
                    // add address
                    data.address = addr_;
                    // have amount in float
                    data.amount = +new BigNumber(data.amount).dividedBy(100000000);
                })
            );
        }
        return Promise.all(eachUtxoPromise).then(arrays =>
            Array.prototype.concat.apply([], arrays)
        );
    }

    getAddressProp(propName, address, noTxList) {
        return axios({
            url: this.apiEndpoint + "/address/" + address,
            method: "GET"
        }).then(res => res.data).then(data => {
            if (propName) {
                return data[propName];
            } else {
                if (noTxList) {
                    delete data.transactions;
                }
                return data;
            }
        });
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