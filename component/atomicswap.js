
const currencyList = require("../js/currencyList")
const bitcoin = require("bitcoinjs-lib")
const storage = require("../js/storage")
const bip39 = require("bip39")
const BigNumber = require('bignumber.js');
const coinUtil = require("../js/coinUtil")

const getPriv = (coinId,change,index,password)=>storage.get("keyPairs").then((cipher)=>{
  const cur = currencyList.get(coinId)
  let seed=
        bip39.mnemonicToSeed(
          bip39.entropyToMnemonic(
            coinUtil.decrypt(cipher.entropy,password)
          )
        )
  const node = bitcoin.HDNode.fromSeedBuffer(seed,cur.network)
  return node
    .deriveHardened(44)
    .deriveHardened(cur.bip44.coinType)
    .deriveHardened(cur.bip44.account)
    .derive(change|0)
    .derive(index|0).keyPair
})
const createScript = (pubKeyRedeem,pubKeyRefund,secretHash,expire,coinId)=>{
  const redeemScript=bitcoin.script.compile([
    bitcoin.opcodes.OP_IF,
    bitcoin.opcodes.OP_HASH160,
    secretHash,
    bitcoin.opcodes.OP_EQUALVERIFY,
    pubKeyRedeem,
    bitcoin.opcodes.OP_ELSE,
    bitcoin.script.number.encode(expire),
    bitcoin.opcodes.OP_NOP3,
    bitcoin.opcodes.OP_DROP, 
    pubKeyRefund,
    bitcoin.opcodes.OP_ENDIF,
    bitcoin.opcodes.OP_CHECKSIG
  ]);
  const scriptPubKey = bitcoin.script.scriptHash.output.encode(bitcoin.crypto.hash160(redeemScript))
  const address = bitcoin.address.fromOutputScript(scriptPubKey,currencyList.get(coinId).network)
  return { redeemScript,scriptPubKey,address }
}
const signClaimTxWithSecret = (txb, coinId, addressIndex, redeemScript, secret, password)=>{
  const cur = currencyList.get(coinId)

  var signatureScript = redeemScript;
  var signatureHash = txb.tx.hashForSignature(0, signatureScript, bitcoin.Transaction.SIGHASH_ALL);
  return getPriv(coinId,0,addressIndex,password).then(pk=>{
    const signature= pk.sign(signatureHash);
    var tx = txb.buildIncomplete();

    var scriptSig = bitcoin.script.compile([
      signature.toScriptSignature(bitcoin.Transaction.SIGHASH_ALL),
      Buffer.from(secret,"utf8"),
      bitcoin.opcodes.OP_TRUE
    ]);

    scriptSig = bitcoin.script.scriptHash.input.encode(scriptSig, redeemScript);
    tx.setInputScript(0, scriptSig);
    return tx;
  })

};
module.exports=require("./atomicswap.html")({
  data(){
    return {
      labels:[],
      coins:[],
      
      addrIndex:0,
      giveCoinId:"mona",
      getCoinId:"mona",

      secret:"",

      secretHash:"",
      pubKeyWithSecret:"",
      pubKeyWOSecret:"",

      myP2SH:null,
      scriptWithSecret:"",
      opponentP2SH:null,
      scriptWithoutSecret:"",

      utxo:"",
      password:"",
      signedTx:""
    }
  },
  methods:{
    getLabels(){
      currencyList.get(this.getCoinId).getLabels().then(res=>{
        this.$set(this,"labels",res)
      })
    },
    getCurrencies(){
      currencyList.eachWithPub(cur=>{
        this.coins.push(cur.coinId)
      })
    },
    generateHash(){
      if(this.secret){
        this.secretHash = bitcoin.crypto.hash160(Buffer.from(this.secret,"utf8")).toString("hex")
      }else{
        this.secretHash =""
      }
      this.getPubKey()
    },
    getPubKey(){
      const pk=currencyList.get(this.getCoinId).getPubKey(0,this.addrIndex|0).toString("hex")
      if(this.secret){
        this.pubKeyWithSecret=pk
        this.pubKeyWOSecret=""
      }else{
        this.pubKeyWithSecret=""
        this.pubKeyWOSecret=pk
      }
      
    },
    generateP2SH(){
      if (this.secret) {
        this.myP2SH=createScript(
          Buffer.from(this.pubKeyWithSecret,"hex"),
          Buffer.from(this.pubKeyWOSecret,"hex"),
          Buffer.from(this.secretHash,"hex"),
          10,
          this.giveCoinId
        );
        this.opponentP2SH = createScript(
          Buffer.from(this.pubKeyWOSecret,"hex"),
          Buffer.from(this.pubKeyWithSecret,"hex"),
          Buffer.from(this.secretHash,"hex"),
          10,
          this.getCoinId
        );
      }else{
        this.myP2SH = createScript(
          Buffer.from(this.pubKeyWOSecret,"hex"),
          Buffer.from(this.pubKeyWithSecret,"hex"),
          Buffer.from(this.secretHash,"hex"),
          10,
          this.giveCoinId
        );
        this.opponentP2SH=createScript(
          Buffer.from(this.pubKeyWithSecret,"hex"),
          Buffer.from(this.pubKeyWOSecret,"hex"),
          Buffer.from(this.secretHash,"hex"),
          10,
          this.getCoinId
        );
        
      }
    },
    getUtxo(){
      currencyList.get(this.getCoinId).getUtxos([this.opponentP2SH.address],true).then(res=>{
        this.$set(this,"utxo",res)
      })
    },
    signTx(){
      const cur =currencyList.get(this.getCoinId)
      const txb = new bitcoin.TransactionBuilder(cur.network)
      txb.addInput(this.utxo.utxos[0].txId,this.utxo.utxos[0].vout)
      txb.addOutput(cur.getAddress(0,this.addrIndex|0),(new BigNumber(this.utxo.utxos[0].value)).minus(35000).round().toNumber())
      signClaimTxWithSecret(txb,this.getCoinId,this.addrIndex|0,this.opponentP2SH.redeemScript,this.secret,this.password).then(tx=>{
        this.signedTx = tx.toHex()
      })
    }
  },
  mounted(){
    this.getCurrencies()
    
  },
  filters:{
    stringify:(j)=>JSON.stringify(j)
  }
  
})
