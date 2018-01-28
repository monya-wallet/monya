
const currencyList = require("../js/currencyList")
const bitcoin = require("bitcoinjs-lib")
const storage = require("../js/storage")
const bip39 = require("bip39")
const BigNumber = require('bignumber.js');
const coinUtil = require("../js/coinUtil")
const LOCKTIME = 100
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
const atomicSwapContract = (pkhMe,pkhThem,lockTime,secretHash)=>{
  return bitcoin.script.compile([
    bitcoin.opcodes.OP_IF,
    bitcoin.opcodes.OP_SHA256,
    secretHash,
    bitcoin.opcodes.OP_EQUALVERIFY,
    bitcoin.opcodes.OP_DUP,
    bitcoin.opcodes.OP_HASH160,
    pkhThem,
    bitcoin.opcodes.OP_ELSE,
    bitcoin.script.number.encode(lockTime),
    bitcoin.opcodes.OP_CHECKLOCKTIMEVERIFY,
    bitcoin.opcodes.OP_DROP,
    bitcoin.opcodes.OP_DUP,
    bitcoin.opcodes.OP_HASH160,
    pkhMe,
    bitcoin.opcodes.OP_ENDIF,
    bitcoin.opcodes.OP_EQUALVERIFY,
    bitcoin.opcodes.OP_CHECKSIG
  ]);
}

const createContract=(contract,coinId)=>{
  return {
    address:bitcoin.address.toBase58Check(bitcoin.crypto.hash160(contract),currencyList.get(coinId).network.scriptHash),
    redeemScript:contract
  }
}
const redeemP2SHContract = (contract,sig,pubKey,secret)=>{
  return bitcoin.script.compile([
    sig,
    pubKey,
    secret,
    bitcoin.opcodes.OP_TRUE,
    contract
  ]);
}

const refundP2SHContract = (contract,sig,pubKey)=>{
  return bitcoin.script.compile([
    sig,
    pubKey,
    bitcoin.script.OP_FALSE,
    contract
  ]);
}

const signClaimTxWithSecret = (txb, coinId, addressIndex, redeemScript, secret, password)=>{
  const cur = currencyList.get(coinId)

  var signatureScript = redeemScript;
  var signatureHash = txb.tx.hashForSignature(0, signatureScript, bitcoin.Transaction.SIGHASH_ALL);
  return getPriv(coinId,0,addressIndex,password).then(pk=>{
    const signature= pk.sign(signatureHash);
    var tx = txb.buildIncomplete();

    var scriptSig=redeemP2SHContract(redeemScript,signature.toScriptSignature(bitcoin.Transaction.SIGHASH_ALL),Buffer.from(cur.getPubKey(0,addressIndex),"hex"),Buffer.from(secret,"utf8"))
    tx.setInputScript(0, scriptSig);
    return tx;
  })

};
const signRefund = (txb, coinId, addressIndex, redeemScript, password)=>{
  const cur = currencyList.get(coinId)

  var signatureScript = redeemScript;
  var signatureHash = txb.tx.hashForSignature(0, signatureScript, bitcoin.Transaction.SIGHASH_ALL);
  return getPriv(coinId,0,addressIndex,password).then(pk=>{
    const signature= pk.sign(signatureHash);
    var tx = txb.buildIncomplete();

    var scriptSig=refundP2SHContract(redeemScript,signature.toScriptSignature(bitcoin.Transaction.SIGHASH_ALL),Buffer.from(cur.getPubKey(0,addressIndex),"hex"))
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
      addressWithSecret:"",
      addressWOSecret:"",

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
        this.secretHash = bitcoin.crypto.sha256(Buffer.from(this.secret,"utf8")).toString("hex")
      }else{
        this.secretHash =""
      }
      this.getPubKey()
    },
    getPubKey(){
      const pk=currencyList.get(this.getCoinId).getAddress(0,this.addrIndex|0)
      if(this.secret){
        this.addressWithSecret=pk
        this.addressWOSecret=""
      }else{
        this.addressWithSecret=""
        this.addressWOSecret=pk
      }
      
    },
    generateP2SH(){
      if (this.secret) {
        this.myP2SH=createContract(
          atomicSwapContract(
            bitcoin.address.fromBase58Check(this.addressWithSecret).hash,
            bitcoin.address.fromBase58Check(this.addressWOSecret).hash,
            LOCKTIME,
            Buffer.from(this.secretHash,"hex")
          ),
          this.giveCoinId
        );
        this.opponentP2SH = createContract(
          atomicSwapContract(
            bitcoin.address.fromBase58Check(this.addressWOSecret).hash,
            bitcoin.address.fromBase58Check(this.addressWithSecret).hash,
            LOCKTIME,
            Buffer.from(this.secretHash,"hex")
          ),
          this.getCoinId
        );
      }else{
        this.opponentP2SH=createContract(
          atomicSwapContract(
            bitcoin.address.fromBase58Check(this.addressWithSecret).hash,
            bitcoin.address.fromBase58Check(this.addressWOSecret).hash,
            LOCKTIME,
            Buffer.from(this.secretHash,"hex")
          ),
          this.getCoinId
        );
        this.myP2SH = createContract(
          atomicSwapContract(
            bitcoin.address.fromBase58Check(this.addressWOSecret).hash,
            bitcoin.address.fromBase58Check(this.addressWithSecret).hash,
            LOCKTIME,
            Buffer.from(this.secretHash,"hex")
          ),
          this.giveCoinId
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
      signClaimTxWithSecret(txb,this.getCoinId,this.addrIndex|0,this.opponentP2SH.redeemScript,
                            Buffer.from(this.secret,"utf8"),this.password).then(tx=>{
        this.signedTx = tx.toHex()
      })
    },
    signRefundTx(){
      const cur =currencyList.get(this.getCoinId)
      const txb = new bitcoin.TransactionBuilder(cur.network)
      txb.addInput(this.utxo.utxos[0].txId,this.utxo.utxos[0].vout)
      txb.addOutput(cur.getAddress(0,this.addrIndex|0),(new BigNumber(this.utxo.utxos[0].value)).minus(35000).round().toNumber())
      signRefund(txb,this.getCoinId,this.addrIndex|0,this.opponentP2SH.redeemScript,this.password).then(tx=>{
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
