const Title = require("../js/title.js")
const currencyList = require("../js/currencyList")
const bitcoin = require("bitcoinjs-lib")
const storage = require("../js/storage")
const bip39 = require("bip39")
const BigNumber = require('bignumber.js');
const coinUtil = require("../js/coinUtil")
const coinSelect = require('coinselect')
const LOCKTIME = 1
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
    bitcoin.opcodes.OP_HASH160,
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

  return getPriv(coinId,0,addressIndex,password).then(pk=>{
    var tx = txb.buildIncomplete();
    txb.inputs.forEach((v,i)=>{
      var signatureScript = redeemScript;
      var signatureHash = txb.tx.hashForSignature(i, signatureScript, bitcoin.Transaction.SIGHASH_ALL);
      
      const signature= pk.sign(signatureHash);
      

      var scriptSig=redeemP2SHContract(redeemScript,signature.toScriptSignature(bitcoin.Transaction.SIGHASH_ALL),Buffer.from(cur.getPubKey(0,addressIndex),"hex"),secret)
      tx.setInputScript(i, scriptSig);
    })
    return tx;
  })

};
const signRefund = (txb, coinId, addressIndex, redeemScript, password)=>{
  const cur = currencyList.get(coinId)

  
  return getPriv(coinId,0,addressIndex,password).then(pk=>{

    var tx = txb.buildIncomplete();
    txb.inputs.forEach((v,i)=>{
      var signatureScript = redeemScript;
      var signatureHash = txb.tx.hashForSignature(i, signatureScript, bitcoin.Transaction.SIGHASH_ALL);
      
      const signature= pk.sign(signatureHash);
      

      var scriptSig=refundP2SHContract(redeemScript,signature.toScriptSignature(bitcoin.Transaction.SIGHASH_ALL),Buffer.from(cur.getPubKey(0,addressIndex),"hex"))
      tx.setInputScript(i, scriptSig);
    })
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
      getCoinCPAvailable:false,
      getCoinIsCP:false,

      secret:"",
      lockTime:10,

      secretHash:"",
      addressWithSecret:"",
      addressWOSecret:"",

      myP2SH:null,
      scriptWithSecret:"",
      opponentP2SH:null,
      scriptWithoutSecret:"",

      utxo:"",
      password:"",
      fee:50000,
      signedTx:"",

      cpDivisible:false,
      cpAmount:0,
      cpToken:"XMP"
    }
  },
  methods:{
    getLabels(){
      const cur = currencyList.get(this.getCoinId)
      cur.getLabels().then(res=>{
        this.$set(this,"labels",res)
      })
      this.getCoinCPAvailable = !!cur.counterpartyEndpoint
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
            this.lockTime,
            Buffer.from(this.secretHash,"hex")
          ),
          this.giveCoinId
        );
        this.opponentP2SH = createContract(
          atomicSwapContract(
            bitcoin.address.fromBase58Check(this.addressWOSecret).hash,
            bitcoin.address.fromBase58Check(this.addressWithSecret).hash,
            this.lockTime,
            Buffer.from(this.secretHash,"hex")
          ),
          this.getCoinId
        );
      }else{
        this.opponentP2SH=createContract(
          atomicSwapContract(
            bitcoin.address.fromBase58Check(this.addressWithSecret).hash,
            bitcoin.address.fromBase58Check(this.addressWOSecret).hash,
            this.lockTime,
            Buffer.from(this.secretHash,"hex")
          ),
          this.getCoinId
        );
        this.myP2SH = createContract(
          atomicSwapContract(
            bitcoin.address.fromBase58Check(this.addressWOSecret).hash,
            bitcoin.address.fromBase58Check(this.addressWithSecret).hash,
            this.lockTime,
            Buffer.from(this.secretHash,"hex")
          ),
          this.giveCoinId
        );
      }
    },

    buildNormalTransaction(inAddr,outAddr){
      const cur =currencyList.get(this.getCoinId)
      return cur.getUtxos([inAddr],true).then(res=>{
        const txb = new bitcoin.TransactionBuilder(cur.network)
        res.utxos.forEach(v=>{
          txb.addInput(v.txId, v.vout)
        })
        txb.addOutput(outAddr,(new BigNumber(res.balance)).times(100000000).minus(this.fee|0).round().toNumber())
        return txb
      })
    },
    buildCounterpartyTransaction(inAddr,outAddr){
      const title = new Title({
        titleId:"atomicSwap",
        cpCoinId:this.getCoinId,
        titleName:"Atomic Swap",
        apiVer:false
      })

      let qty=(new BigNumber(this.cpAmount))
      if(this.cpDivisible){
        qty=qty.times(100000000)
      }
      return title.createCommand("send",{
        source:inAddr,
        destination:outAddr,
        asset:this.cpToken,
        quantity:qty.toNumber()
      },{
        addressIndex:this.addressIndex|0,
        includeUnconfirmedFunds:true,
        feePerByte:this.fee,
        disableUtxoLocks:true,
        extendedTxInfo:true
      }).then(res=>{
        return coinUtil.buildBuilderfromPubKeyTx(title.cp.lib.Transaction.fromHex(res.tx_hex),title.cp.network)
      })
    },
    signTx(){
      let txbProm;
      if (this.getCoinIsCP) {
        txbProm= this.buildCounterpartyTransaction(this.opponentP2SH.address,currencyList.get(this.getCoinId).getAddress(0,this.addrIndex|0))
      }else{
        txbProm=this.buildNormalTransaction(this.opponentP2SH.address,currencyList.get(this.getCoinId).getAddress(0,this.addrIndex|0))
      }
      txbProm.then(txb=>{
        signClaimTxWithSecret(txb,this.getCoinId,this.addrIndex|0,this.opponentP2SH.redeemScript,
                              Buffer.from(this.secret,"utf8"),this.password).then(tx=>{
                                this.signedTx = tx.toHex()
                              })
      })
    },
    signRefundTx(){
      let txbProm
      if (this.getCoinIsCP) {
        txbProm= this.buildCounterpartyTransaction(this.myP2SH.address,currencyList.get(this.getCoinId).getAddress(0,this.addrIndex|0))
      }else{
        txbProm=this.buildNormalTransaction(this.myP2SH.address,currencyList.get(this.getCoinId).getAddress(0,this.addrIndex|0))
      }
      txbProm.then(txb=>{
        signRefund(txb,this.getCoinId,this.addrIndex|0,this.opponentP2SH.redeemScript,this.password).then(tx=>{
          this.signedTx = tx.toHex()
        })
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
