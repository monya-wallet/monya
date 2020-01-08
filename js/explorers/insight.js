const axios = require("axios");
const qs = require("qs");

module.exports = class InsightExplorer {
  constructor(endpoint, explorer) {
    this.apiEndpoint = endpoint;
    this.explorer = explorer;
  }

  pushTx(hex) {
    return axios({
      url: this.apiEndpoint + "/tx/send",
      data: qs.stringify({
        rawtx: hex
      }),
      method: "POST"
    })
      .then(res => res.data)
      .catch(e => {
        throw e.response.data;
      });
  }

  getTxs(from, to, addrs) {
    return axios({
      url: this.apiEndpoint + "/addrs/txs",
      data: qs.stringify({
        noAsm: 1,
        noScriptSig: 1,
        noSpent: 0,
        from,
        to,
        addrs: addrs.join(",")
      }),
      method: "POST"
    }).then(res => res.data);
  }

  getTx(txId) {
    return axios({
      url: this.apiEndpoint + "/tx/" + txId,
      method: "GET"
    }).then(res => res.data);
  }

  getBlocks() {
    return axios({
      url: this.apiEndpoint + "/blocks?limit=3",
      json: true,
      method: "GET"
    }).then(r => r.data.blocks);
  }

  getUtxos(addressList) {
    return axios({
      url: this.apiEndpoint + "/addrs/" + addressList.join(",") + "/utxo",
      json: true,
      method: "GET"
    }).then(res => res.data);
  }

  getAddressProp(propName, address, noTxList) {
    return axios({
      url:
        this.apiEndpoint +
        "/addr/" +
        address +
        (propName ? "/" + propName : noTxList ? "?noTxList=1" : ""),
      json: true,
      method: "GET"
    }).then(res => res.data);
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
};
