const Title = require("../js/title.js")
const currencyList = require("../js/currencyList")
const bitcoin = require("bitcoinjs-lib")
const storage = require("../js/storage")
const bip39 = require("@missmonacoin/bip39-eng")
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
  const node = cur.lib.HDNode.fromSeedBuffer(seed,cur.network)
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
const atomicSwapContract = (pkhMe/*refund*/,pkhThem/*redeem*/,lockTime,secretHash,enableCLTV=true,secretSize)=>{
  if(enableCLTV){
    return bitcoin.script.compile([
      bitcoin.opcodes.OP_IF,
      bitcoin.opcodes.OP_SIZE,
      bitcoin.script.number.encode(secretSize),
      bitcoin.opcodes.OP_EQUALVERIFY,
      bitcoin.opcodes.OP_HASH160,
      secretHash,
      bitcoin.opcodes.OP_EQUALVERIFY,
      bitcoin.opcodes.OP_DUP,
      bitcoin.opcodes.OP_HASH160,
      pkhThem,
      bitcoin.opcodes.OP_ELSE,
      bitcoin.script.number.encode(lockTime),
      bitcoin.opcodes.OP_NOP2,
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
      bitcoin.opcodes.OP_DROP,
      bitcoin.opcodes.OP_HASH160,
      secretHash,
      bitcoin.opcodes.OP_EQUALVERIFY,
      bitcoin.opcodes.OP_DUP,
      bitcoin.opcodes.OP_HASH160,
      pkhThem,
      bitcoin.opcodes.OP_EQUALVERIFY,
      bitcoin.opcodes.OP_CHECKSIG
    ]);
  }
}

const createContract=(contract,coinId)=>{
  const cur = currencyList.get(coinId)
  return {
    address:cur.lib.address.toBase58Check(bitcoin.crypto.hash160(contract),cur.network.scriptHash),
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
      let signatureHash;
      let scriptSig;
      if(cur.libName==="bch"){
        signatureHash = txb.tx.hashForCashSignature(i, signatureScript, v.value, cur.lib.Transaction.SIGHASH_ALL | cur.lib.Transaction.SIGHASH_BITCOINCASHBIP143);
        const signature= pk.sign(signatureHash);
        scriptSig=redeemP2SHContract(redeemScript,signature.toScriptSignature(cur.lib.Transaction.SIGHASH_ALL | cur.lib.Transaction.SIGHASH_BITCOINCASHBIP143),Buffer.from(cur.getPubKey(0,addressIndex),"hex"),secret)
      }else if(cur.libName==="btg"){
        signatureHash = txb.tx.hashForGoldSignature(i, signatureScript, v.value, cur.lib.Transaction.SIGHASH_ALL | cur.lib.Transaction.SIGHASH_BITCOINCASHBIP143);
        const signature= pk.sign(signatureHash);
        scriptSig=redeemP2SHContract(redeemScript,signature.toScriptSignature(cur.lib.Transaction.SIGHASH_ALL | cur.lib.Transaction.SIGHASH_BITCOINCASHBIP143),Buffer.from(cur.getPubKey(0,addressIndex),"hex"),secret)
      }else{
        signatureHash = txb.tx.hashForSignature(i, signatureScript, cur.lib.Transaction.SIGHASH_ALL);
        const signature= pk.sign(signatureHash);
        scriptSig=redeemP2SHContract(redeemScript,signature.toScriptSignature(cur.lib.Transaction.SIGHASH_ALL),Buffer.from(cur.getPubKey(0,addressIndex),"hex"),secret)
      }
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
      let signatureHash;
      let scriptSig;
      if(cur.libName==="bch"){
        signatureHash = txb.tx.hashForCashSignature(i, signatureScript, v.value, cur.lib.Transaction.SIGHASH_ALL | cur.lib.Transaction.SIGHASH_BITCOINCASHBIP143);
        const signature= pk.sign(signatureHash);
        scriptSig=refundP2SHContract(redeemScript,signature.toScriptSignature(cur.lib.Transaction.SIGHASH_ALL | cur.lib.Transaction.SIGHASH_BITCOINCASHBIP143),Buffer.from(cur.getPubKey(0,addressIndex),"hex"))
      }else if(cur.libName==="btg"){
        signatureHash = txb.tx.hashForGoldSignature(i, signatureScript, v.value, cur.lib.Transaction.SIGHASH_ALL | cur.lib.Transaction.SIGHASH_BITCOINCASHBIP143);
        const signature= pk.sign(signatureHash);
        scriptSig=refundP2SHContract(redeemScript,signature.toScriptSignature(cur.lib.Transaction.SIGHASH_ALL | cur.lib.Transaction.SIGHASH_BITCOINCASHBIP143),Buffer.from(cur.getPubKey(0,addressIndex),"hex"))
      }else{
        signatureHash = txb.tx.hashForSignature(i, signatureScript, cur.lib.Transaction.SIGHASH_ALL);
        const signature= pk.sign(signatureHash);
        scriptSig=refundP2SHContract(redeemScript,signature.toScriptSignature(cur.lib.Transaction.SIGHASH_ALL),Buffer.from(cur.getPubKey(0,addressIndex),"hex"))
      }
      tx.setInputScript(i, scriptSig);
    })
    return tx;
  })

};

module.exports=require("../js/lang.js")({ja:require("./ja/atomicswap.html"),en:require("./en/atomicswap.html")})({
  data(){
    return {
      labels:[],
      refundLabels:[],
      coins:[],
      
      addrIndex:0,
      refundAddrIndex:0,
      giveCoinId:"",
      getCoinId:"",
      getCoinCPAvailable:false,
      getCoinIsCP:false,
      giveCoinCPAvailable:false,
      giveCoinIsCP:false,

      secret:"",

      manual:false,
      lockTime:0,
      secretHash:"",
      secretSize:0,
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
      cpToken:"XMP",

      isRefund:0,

      contractType:"cltv",

      strToRecv:""
    }
  },
  methods:{
    save(){
      const saveData={
        addrIndex:this.addrIndex,refundAddrIndex:this.refundAddrIndex,giveCoinId:this.giveCoinId,getCoinId:this.getCoinId,getCoinIsCP:this.getCoinIsCP,giveCoinIsCP:this.giveCoinIsCP,secret:this.secret,secretSize:this.secretSize,lockTime:this.lockTime,secretHash:this.secretHash,redeemAddressWithSecret:this.redeemAddressWithSecret,refundAddressWithSecret:this.refundAddressWithSecret,redeemAddressWOSecret:this.redeemAddressWOSecret,refundAddressWOSecret:this.refundAddressWOSecret,fee:this.fee,cpDivisible:this.cpDivisible,cpAmount:this.cpAmount,cpToken:this.cpToken
      }
      storage.set("swapData",saveData)
    },
    reset(){
      Object.assign(this,{
        addrIndex:0,
        refundAddrIndex:0,
        giveCoinId:"",
        getCoinId:"",
        getCoinIsCP:false,
        giveCoinIsCP:false,

        secret:"",
        secretSize:"",
        lockTime:"",
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
        cpToken:"XMP",

        isRefund:0
      })
      this.getLabels()
      this.getRefundLabels()
    },
    restore(){
      storage.get("swapData").then(d=>{
        Object.assign(this,d||{})
        this.getLabels()
        this.getRefundLabels()
      })
    },
    getLabels(){
      if (!this.getCoinId) {
        return
      }
      const cur = currencyList.get(this.getCoinId)
      cur.getLabels().then(res=>{
        this.$set(this,"labels",res)
      })
      this.getCoinCPAvailable = !!cur.counterpartyEndpoint
    },
    getRefundLabels(){
      if (!this.giveCoinId) {
        return
      }

      const cur = currencyList.get(this.giveCoinId)
      cur.getLabels().then(res=>{
        this.$set(this,"refundLabels",res)
      })
      this.giveCoinCPAvailable = !!cur.counterpartyEndpoint
    },
    getCurrencies(){
      currencyList.eachWithPub(cur=>{
        this.coins.push({coinId:cur.coinId,name:cur.coinScreenName})
      })
    },
    generateHash(){
      if(this.secret){
        const b = Buffer.from(this.secret,"utf8")
        this.secretHash = bitcoin.crypto.hash160(b).toString("hex")
        this.secretSize=b.length
        this.lockTime=Math.floor(Date.now()/1000)+60*60*24
      }else{
        this.secretHash =""
        this.secretSize = ""
      }
      this.getPubKey()
      
    },
    getPubKey(){
      const pk=currencyList.get(this.getCoinId).getAddress(0,this.addrIndex|0)
      const rpk=currencyList.get(this.giveCoinId).getAddress(0,this.refundAddrIndex|0)
      
      if(this.secret){
        this.redeemAddressWithSecret=pk
        this.refundAddressWithSecret=rpk        
      }else{
        this.redeemAddressWOSecret=pk
        this.refundAddressWOSecret=rpk
      }
      
    },
    generateP2SH(){
      const giveCur=currencyList.get(this.giveCoinId)
      const getCur=currencyList.get(this.getCoinId)
      if (this.secret) {
        this.myP2SH=createContract(
          atomicSwapContract(
            giveCur.lib.address.fromBase58Check(this.refundAddressWithSecret).hash,
            giveCur.lib.address.fromBase58Check(this.redeemAddressWOSecret).hash,
            this.lockTime,
            Buffer.from(this.secretHash,"hex"),
            this.contractType,
            this.secretSize
          ),
          this.giveCoinId
          
        );
        this.opponentP2SH = createContract(
          atomicSwapContract(
            getCur.lib.address.fromBase58Check(this.refundAddressWOSecret).hash,
            getCur.lib.address.fromBase58Check(this.redeemAddressWithSecret).hash,
            this.lockTime,
            Buffer.from(this.secretHash,"hex"),
            this.contractType,
            this.secretSize
          ),
          this.getCoinId
          
        );
      }else{
        this.opponentP2SH=createContract(
          atomicSwapContract(
            getCur.lib.address.fromBase58Check(this.refundAddressWithSecret).hash,
            getCur.lib.address.fromBase58Check(this.redeemAddressWOSecret).hash,
            this.lockTime,
            Buffer.from(this.secretHash,"hex"),
            this.contractType,
            this.secretSize
          ),
          this.getCoinId
        );
        this.myP2SH =createContract(
          atomicSwapContract(
            giveCur.lib.address.fromBase58Check(this.refundAddressWOSecret).hash,
            giveCur.lib.address.fromBase58Check(this.redeemAddressWithSecret).hash,
            this.lockTime,
            Buffer.from(this.secretHash,"hex"),
            this.contractType,
            this.secretSize
          ),
          this.giveCoinId
        );
      }
      if(this.getCoinIsCP){
        this.fee=400
      }
    },

    buildNormalTransaction(inAddr,outAddr,coinId,isRefund){
      const cur =currencyList.get(coinId||this.getCoinId)
      return cur.getUtxos([inAddr],true).then(res=>{
        const txb = new cur.lib.TransactionBuilder(cur.network)
        if(this.contractType==="csv"){
          txb.setVersion(2)
          res.utxos.forEach(v=>{
            const vin =txb.addInput(v.txId, v.vout,isRefund?(this.lockTime|0):0)
            txb.inputs[vin].value=v.value
          })
        }else if(this.contractType==="cltv"){
          isRefund&&txb.setLockTime(parseInt(this.lockTime))
          res.utxos.forEach(v=>{
            const vin =txb.addInput(v.txId, 0,isRefund?0:null)
            txb.inputs[vin].value=v.value
          })
        }else{
          res.utxos.forEach(v=>{
            const vin =txb.addInput(v.txId, v.vout)
            txb.inputs[vin].value=v.value
          })
        }
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
        if(this.contractType==="csv"){
          txb.setVersion(2)
          isRefund&&txb.tx.ins.forEach(r=>{
            r.sequence = this.lockTime
          })
        }else if(this.contractType==="cltv"){
          isRefund&&txb.setLockTime(parseInt(this.lockTime))
          isRefund&&txb.tx.ins.forEach(r=>{
            r.sequence = 0
          })
        }
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
        txb.setLockTime(this.lockTime|0)
        return signClaimTxWithSecret(
          txb,this.getCoinId
          ,this.addrIndex|0,this.opponentP2SH.redeemScript,
          Buffer.from(this.secret,"utf8"),this.password)
      }).then(tx=>{
        this.signedTx = tx.toHex()
        return currencyList.get(this.getCoinId).pushTx(this.signedTx)
      }).then(t=>{
        this.$ons.notification.alert("Successfully sent transaction.Transaction ID is: "+t.txid)
      }).catch(e=>{
        if(e.request){
          this.$store.commit("setError",e.request.responseText||"Network Error.Please try again")
          
        }else{
          this.$store.commit("setError",e.message)
        }
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
        return signRefund(txb,this.giveCoinId,this.refundAddrIndex|0,this.myP2SH.redeemScript,this.password)
      }).then(tx=>{
        this.signedTx = tx.toHex()
        return currencyList.get(this.giveCoinId).pushTx(this.signedTx)
      }).then(t=>{
        this.$ons.notification.alert("Successfully sent transaction.Transaction ID is: "+t.txid)
      }).catch(e=>{
        this.$store.commit("setError",(e.resopnse&&e.response.data)||e.message)
      })
    },
    applyStr(){
      try{
      const parsed=JSON.parse(this.strToRecv)
      this.getCoinIsCP=parsed.giveCoinIdIsCP
      this.giveCoinIsCP=parsed.getCoinIsCP
      this.secretHash=parsed.secretHash
      this.secretSize=parsed.secretSize
      this.redeemAddressWithSecret=parsed.redeemAddressWithSecret
      this.refundAddressWithSecret=parsed.refundAddressWithSecret
      this.redeemAddressWOSecret=parsed.redeemAddressWOSecret
      this.refundAddressWOSecret=parsed.refundAddressWOSecret
        this.lockTime=parsed.lockTime
      }catch(e){
        return
      }
    }
  },
  computed:{
    strToSend(){
      if(this.redeemAddressWithSecret||this.redeemAddressWOSecret){
        
        return JSON.stringify({
          giveCoinIsCP:this.giveCoinIsCP,
          getCoinIsCP:this.getCoinIsCP,
          secretHash:this.secretHash,
          secretSize:this.secretSize,
          redeemAddressWithSecret:this.redeemAddressWithSecret,
          refundAddressWithSecret:this.refundAddressWithSecret,
          redeemAddressWOSecret:this.redeemAddressWOSecret,
          refundAddressWOSecret:this.refundAddressWOSecret,
          lockTime:this.lockTime
        })
      }else{
        return ""
      }
    }
  },
  mounted(){
    this.getCurrencies()
    this.restore()
    this.getLabels()
    this.getRefundLabels()
  },
  filters:{
    stringify:(j)=>JSON.stringify(j)
  }
  
})
