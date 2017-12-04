const bcLib = require('bitcoinjs-lib')
const bip39 = require("bip39")
const crypto = require('crypto');

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
let currentKeyPair;

exports.makeEncryptedPriv = (option)=> new Promise((resolve, reject) => {
  let seed;
  if(option.entropy){
    seed=bip39.mnemonicToSeed(bip39.entropyToMnemonic(option.entropy))
  }else if(option.mnemonic){
    seed=bip39.mnemonicToSeed(this.$store.state.entropy)
  }else if(option.seed){
    seed= option.seed
  }
  const node = bcLib.HDNode.fromSeedBuffer(seed)
  const b58= node.toBase58()
  
  const cipher = crypto.createCipher('aes256', option.password);
  let encrypted = cipher.update(b58, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  resolve(encrypted)
});
exports.decryptAndRestore=(cipher,password)=> new Promise((resolve, reject) => {
  const decipher = crypto.createDecipher('aes256', password);
  let decrypted = decipher.update(cipher, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  currentKeyPair = bcLib.HDNode.fromBase58(decrypted,monacoinNetwork)
  resolve()
});
exports.getMonaAddress = (index)=>{
  return currentKeyPair.derivePath("m/44'/22'/0'/0/"+(index||0)).getAddress()//BIP 44
}
