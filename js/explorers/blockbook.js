const axios = require("axios");
const bitcoin = require("bitcoinjs-lib");
const BigNumber = require("bignumber.js");

module.exports = class BlockbookExplorer {
  constructor(endpoint, explorer) {
    this.apiEndpoint = endpoint;
    this.explorer = explorer;
  }

  pushTx(hex) {
    return axios({
      url: this.apiEndpoint + "/sendtx/" + hex,
      method: "GET"
    })
      .then(res => ({
        txid: res.data.result
      }))
      .catch(e => Promise.reject(e.response.data));
  }

  // third parameter should be:
  // {
  //   addresses: [...list of address...]
  //   xpub: "xpub..."
  // }
  getTxs(from, to, { xpub }) {
    const pageSize = to - from;
    const page = Math.floor(from / pageSize) + 1;
    return axios({
      url: `${this.apiEndpoint}/xpub/${xpub}?page=${page}&pageSize=${pageSize}&details=txs`,
      method: "GET"
    })
      .then(res => res.data)
      .then(data => {
        const items = (data.txs || []).map(this.__transformTransaction);
        return {
          items,
          totalItems:
            typeof data.txAppearances === "number"
              ? data.txAppearances + data.unconfirmedTxApperances
              : items.length,
          from,
          to
        };
      });
  }

  getTx(txId) {
    return axios({
      url: this.apiEndpoint + "/tx/" + txId,
      method: "GET"
    })
      .then(res => res.data)
      .then(this.__transformTransaction);
  }

  getBlocks() {
    const blockAmount = 3;
    return axios({
      url: this.apiEndpoint + "/",
      method: "GET"
    })
      .then(res => res.data.blockbook.bestHeight)
      .then(highest => {
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
      })
      .then(hashes => {
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
        })
          .then(res => res.data)
          .then(data => {
            for (let out of data) {
              // add address
              out.address = addr_;
              // have amount in float
              out.amount = +new BigNumber(out.satoshis).dividedBy(100000000);
            }
            return data;
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
    })
      .then(res => res.data)
      .then(data => {
        if (propName) {
          if (propName === "balance") {
            return new BigNumber(data[propName]).times(100000000).toNumber();
          } else {
            return data[propName];
          }
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

  __transformTransaction(data) {
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
      vin.scriptSig.asm =
        vin.scriptSig.hex &&
        bitcoin.script.toASM(Buffer.from(vin.scriptSig.hex, "hex"));
      // convert value to satoshis/watanabes
      data.valueSat = +new BigNumber(vin.value).times(100000000);
      // and to decimal
      data.value = +vin.value;
    }
    for (let vout of data.vout) {
      // add asm
      vout.scriptPubKey.asm = bitcoin.script.toASM(
        Buffer.from(vout.scriptPubKey.hex, "hex")
      );
    }
    return data;
  }
};
