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
   if(cur.bip44){
      return node
        .deriveHardened(44)
        .deriveHardened(cur.bip44.coinType)
       .deriveHardened(cur.bip44.account)
       .derive(change).derive(index)
    }
    if(cur.bip49){
      return node
        .deriveHardened(49)
        .deriveHardened(cur.bip49.coinType)
        .deriveHardened(cur.bip49.account)
      .derive(change).derive(index)
    }
})
const atomicSwapContract = (pkhMe/*refund*/,pkhThem/*redeem*/,lockTime,secretHash,disableCSV=false)=>{
  if(!disableCSV){
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
      bitcoin.opcodes.OP_NOP3,
      bitcoin.opcodes.OP_DROP,
      bitcoin.opcodes.OP_DUP,
      bitcoin.opcodes.OP_HASH160,
      pkhMe,
      bitcoin.opcodes.OP_ENDIF,
      bitcoin.opcodes.OP_EQUALVERIFY,
      bitcoin.opcodes.OP_CHECKSIG
    ]);
  }else{
    return bitcoin.script.compile([
      bitcoin.opcodes.OP_IF,
      bitcoin.opcodes.OP_HASH160,
      secretHash,
      bitcoin.opcodes.OP_EQUALVERIFY,
      bitcoin.opcodes.OP_DUP,
      bitcoin.opcodes.OP_HASH160,
      pkhThem,
      bitcoin.opcodes.OP_ELSE,
      bitcoin.opcodes.OP_DUP,
      bitcoin.opcodes.OP_HASH160,
      pkhMe,
      bitcoin.opcodes.OP_ENDIF,
      bitcoin.opcodes.OP_EQUALVERIFY,
      bitcoin.opcodes.OP_CHECKSIG
    ]);
  }
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
    let tx = txb.buildIncomplete();
    txb.inputs.forEach((v,i)=>{
      let signatureScript = redeemScript;
      let signatureHash = txb.tx.hashForSignature(i, signatureScript, bitcoin.Transaction.SIGHASH_ALL);
      
      const signature= pk.sign(signatureHash);
      

      let scriptSig=redeemP2SHContract(redeemScript,signature.toScriptSignature(bitcoin.Transaction.SIGHASH_ALL),Buffer.from(cur.getPubKey(0,addressIndex),"hex"),secret)
      tx.setInputScript(i, scriptSig);
    })
    return tx;
  })

};
const signRefund = (txb, coinId, addressIndex, redeemScript, password)=>{
  const cur = currencyList.get(coinId)

  
  return getPriv(coinId,0,addressIndex,password).then(pk=>{

    let tx = txb.buildIncomplete();
    txb.inputs.forEach((v,i)=>{
      let signatureScript = redeemScript;
      let signatureHash = txb.tx.hashForSignature(i, signatureScript, bitcoin.Transaction.SIGHASH_ALL);
      
      const signature= pk.sign(signatureHash);
      

      let scriptSig=refundP2SHContract(redeemScript,signature.toScriptSignature(bitcoin.Transaction.SIGHASH_ALL),Buffer.from(cur.getPubKey(0,addressIndex),"hex"))
      tx.setInputScript(i, scriptSig);
    })
    return tx;
  })

};
module.exports=require("./atomicswap.html")({
  data(){
    return {
      labels:[],
      refundLabels:[],
      coins:[],
      
      addrIndex:0,
      refundAddrIndex:0,
      giveCoinId:"mona",
      getCoinId:"mona",
      getCoinCPAvailable:false,
      getCoinIsCP:false,
      getCoinDisableCLTV:false,
      giveCoinCPAvailable:false,
      giveCoinIsCP:false,
      giveCoinDisableCLTV:false,

      secret:"",
      lockTime:0, //5min later

      secretHash:"",
      redeemAddressWithSecret:"",
      refundAddressWithSecret:"",
      redeemAddressWOSecret:"",
      refundAddressWOSecret:"",

      myP2SH:null,
      scriptWithSecret:"",
      opponentP2SH:null,
      scriptWithoutSecret:"",

      utxo:"",
      password:"",
      fee:80000,
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
    getRefundLabels(){
      const cur = currencyList.get(this.giveCoinId)
      cur.getLabels().then(res=>{
        this.$set(this,"refundLabels",res)
      })
      this.giveCoinCPAvailable = !!cur.counterpartyEndpoint
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
      this.lockTime=60
    },
    getPubKey(){
      const pk=currencyList.get(this.getCoinId).getAddress(0,this.addrIndex|0)
      const rpk=currencyList.get(this.giveCoinId).getAddress(0,this.refundAddrIndex|0)
      
      if(this.secret){
        this.redeemAddressWithSecret=pk
        this.redeemAddressWOSecret=""
        this.refundAddressWithSecret=rpk
        this.refundAddressWOSecret=""
        
      }else{
        this.redeemAddressWithSecret=""
        this.redeemAddressWOSecret=pk
        this.refundAddressWithSecret=""
        this.refundAddressWOSecret=rpk
      }
      
    },
    generateP2SH(){
      if (this.secret) {
        this.myP2SH=createContract(
          atomicSwapContract(
            bitcoin.address.fromBase58Check(this.refundAddressWithSecret).hash,
            bitcoin.address.fromBase58Check(this.redeemAddressWOSecret).hash,
            this.lockTime,
            Buffer.from(this.secretHash,"hex"),
            this.giveCoinDisableCLTV
          ),
          this.giveCoinId
          
        );
        this.opponentP2SH = createContract(
          atomicSwapContract(
            bitcoin.address.fromBase58Check(this.refundAddressWOSecret).hash,
            bitcoin.address.fromBase58Check(this.redeemAddressWithSecret).hash,
            this.lockTime,
            Buffer.from(this.secretHash,"hex"),
            this.getCoinDisableCLTV
          ),
          this.getCoinId
          
        );
      }else{
        this.opponentP2SH=createContract(
          atomicSwapContract(
            bitcoin.address.fromBase58Check(this.refundAddressWithSecret).hash,
            bitcoin.address.fromBase58Check(this.redeemAddressWOSecret).hash,
            this.lockTime,
            Buffer.from(this.secretHash,"hex"),
            this.getCoinDisableCLTV
          ),
          this.getCoinId
        );
        this.myP2SH =createContract(
          atomicSwapContract(
            bitcoin.address.fromBase58Check(this.refundAddressWOSecret).hash,
            bitcoin.address.fromBase58Check(this.redeemAddressWithSecret).hash,
            this.lockTime,
            Buffer.from(this.secretHash,"hex"),
            this.giveCoinDisableCLTV
          ),
          this.giveCoinId
        );
      }
      if(this.getCoinIsCP){
        this.fee=300
      }
    },

    buildNormalTransaction(inAddr,outAddr,coinId,isRefund){
      const cur =currencyList.get(coinId||this.getCoinId)
      return cur.getUtxos([inAddr],true).then(res=>{
        const txb = new bitcoin.TransactionBuilder(cur.network)
        txb.setVersion(2)
        res.utxos.forEach(v=>{
          const vin =txb.addInput(v.txId, v.vout,isRefund?(this.lockTime|0):0)
        })
        txb.addOutput(outAddr,(new BigNumber(res.balance)).times(100000000).minus(this.fee|0).round().toNumber())
        return txb
      })
    },
    buildCounterpartyTransaction(inAddr,outAddr,coinId,isRefund){
      const title = new Title({
        titleId:"atomicSwap",
        cpCoinId:coinId||this.getCoinId,
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
        const txb = coinUtil.buildBuilderfromPubKeyTx(title.cp.lib.Transaction.fromHex(res.tx_hex),title.cp.network)
        txb.setVersion(2)
        isRefund&&txb.tx.ins.forEach(r=>{
          r.sequence = this.lockTime
        })
        return txb
      })
    },
    signTx(){
      let txbProm;
      if (this.getCoinIsCP) {
        txbProm= this.buildCounterpartyTransaction(this.opponentP2SH.address,currencyList.get(this.getCoinId).getAddress(0,this.addrIndex|0),false)
      }else{
        txbProm=this.buildNormalTransaction(this.opponentP2SH.address,currencyList.get(this.getCoinId).getAddress(0,this.addrIndex|0),false)
      }
      txbProm.then(txb=>{
        signClaimTxWithSecret(
          txb,this.getCoinId
          ,this.addrIndex|0,this.opponentP2SH.redeemScript,
          Buffer.from(this.secret,"utf8"),this.password).then(tx=>{
            this.signedTx = tx.toHex()
            return currencyList.get(this.getCoinId).pushTx(this.signedTx)
          })
      }).catch(e=>{
        this.loading=false
        this.$store.commit("setError",e.message)
      })
    },
    signRefundTx(){
      let txbProm
      if (this.giveCoinIsCP) {
        txbProm= this.buildCounterpartyTransaction(this.myP2SH.address,currencyList.get(this.giveCoinId).getAddress(0,this.refundAddrIndex|0),this.giveCoinId,true)
      }else{
        txbProm=this.buildNormalTransaction(this.myP2SH.address,currencyList.get(this.giveCoinId).getAddress(0,this.refundAddrIndex|0),this.giveCoinId,true)
      }
      txbProm.then(txb=>{
        signRefund(txb,this.giveCoinId,this.refundAddrIndex|0,this.myP2SH.redeemScript,this.password).then(tx=>{
          this.signedTx = tx.toHex()
          return currencyList.get(this.giveCoinId).pushTx(this.signedTx)
        })
      }).catch(e=>{
        this.loading=false
        this.$store.commit("setError",e.message)
      })
    }
  },
  mounted(){
    this.getCurrencies()
    this.getLabels()
    this.getRefundLabels()
  },
  filters:{
    stringify:(j)=>JSON.stringify(j)
  }
  
})
