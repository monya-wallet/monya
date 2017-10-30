const bcLib = require('bitcoinjs-lib')

let monacoinNetwork=exports.monacoinNetwork={
  messagePrefix: '\x19Monacoin Signed Message:\n',
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4
  },
  pubKeyHash: 0x32,
  scriptHash: 0x05,
  wif: 0xb2,
  bech32:"mona"
}

exports.getAddressForTesting=()=>{
  let keyPair = bcLib.ECPair.makeRandom({
    network:monacoinNetwork
  })
  let address = keyPair.getAddress()
  return address;
}
