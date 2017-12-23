const bcLib = require('bitcoinjs-lib')
const axios = require('axios');
const coinSelect = require('coinselect')
const errors = require("./errors")
const bip39 = require("bip39")
const coinUtil = require("./coinUtil")
module.exports=class{
  
  constructor(opt){
    this.coinId = opt.coinId;
    this.coinScreenName = opt.coinScreenName;
    this.unit = opt.unit;
    this.unitEasy = opt.unitEasy;
    this.bip44 = opt.bip44;
    this.apiEndpoint = opt.defaultAPIEndpoint;
    this.network = opt.network;
    this.price = opt.price;
    this.dummy=!!opt.dummy
    this.icon = opt.icon;
    this.prefixes=opt.prefixes;
    this.bip21=opt.bip21;
    this.defaultFeeSatPerByte = opt.defaultFeeSatPerByte;
    this.confirmations=opt.confirmations||6
    
    this.hdPubNode=null;
    this.lastPriceTime=0;
    this.priceCache=0;
    this.changeIndex=-1;
    this.changeBalance=0;
    this.addresses={}
  }
  setPubSeedB58(seed){
    if(this.dummy){return}
    this.hdPubNode = bcLib.HDNode.fromBase58(seed,this.network)
  }
  getAddressProp(propName,address){
    if(this.dummy){return Promise.resolve()}
    return axios({
      url:this.apiEndpoint+"/addr/"+address+"/"+propName,
      json:true,
      method:"GET"}).then(res=>{
        return res.data
      })
  }
  getBalanceOfReceiveAddr(limit){
    return this.getUtxos(this.getReceiveAddr(limit)).then(v=>{
      return v.balance
    })
  }
  getReceiveAddr(limit){
    if(!limit){
      limit=coinUtil.GAP_LIMIT
    }
    const adrss=[]
    for(let i=0;i<=limit;i++){
      adrss.push(this.getAddress(0,i))
    }
    return adrss
  }
  getChangeAddr(limit){
    if(!limit){
      limit=coinUtil.GAP_LIMIT_FOR_CHANGE
    }
    const adrss=[]
    for(let i=0;i<=limit;i++){
      adrss.push(this.getAddress(1,i))
    }
    return adrss
  }
  getIndexFromAddress(addr){
    for(let p in this.addresses){
      if(this.addresses[p]===addr){
        return p.split(",")
      }
    }
    return false
  }
  getReceiveBalance(){
    return this.getUtxos(this.getReceiveAddr())
  }
  getChangeBalance(){
    return this.getUtxos(this.getChangeAddr()).then(res=>{
      let newestCnf=Infinity
      let newestAddr=""
      let bal=0
      let unconfirmed=0
      for(let i=0;i<res.length;i++){
        if(res[i].confirmations<newestCnf){
          newestCnf=res[i].confirmations
          newestAddr=res[i].address
        }
        if(res[i].confirmations===0){
          unconfirmed+=res[i].amount
        }else{
          bal+=res[i].amount
        }
      }
      this.changeIndex=newestAddr?
        this.getIndexFromAddress(newestAddr)[1]%coinUtil.GAP_LIMIT_FOR_CHANGE
      :-1
      return {
        balance:bal,
        unconfirmed 
      }
    })
  }
  
  getWholeBalanceOfThisAccount(){
    if(this.dummy){return Promise.resolve()}
    return Promise.all([this.getReceiveBalance(),this.getChangeBalance()]).then(vals=>({
      balance:vals[0].balance+vals[1].balance,
      unconfirmed:vals[0].unconfirmed+vals[1].unconfirmed
    }))
  }
  
  getUtxos(addressList){
    return axios({
      url:this.apiEndpoint+"/addrs/"+addressList.join(",")+"/utxo",
      json:true,
      method:"GET"}).then(res=>{
        const v=res.data
        const utxos=[]
        let bal=0;
        let unconfirmed=0;
        for(let i=0;i<v.length;i++){
          bal+=v[i].amount
          const u=v[i]
          if(u.confirmations!==0){//avoid spending unconfimed fund
            utxos.push({
              value:u.amount*100000000,
              txId:u.txid,
              vout:u.vout,
              address:u.address
            })
          }else{
            unconfirmed+=u.amount
          }
        }
        return {
          balance:bal,
          utxos,
          unconfirmed
        }
      })
  }
  
  getAddress(change,index){
    if(this.dummy){return}
    if(!this.hdPubNode){throw new Error("HDNode isn't specified.")}
    
    if(typeof index !=="number"){
      throw new Error("Please specify index")
    }
    const addrKey = (change|0).toString()+","+(index|0).toString()
    if(this.addresses[addrKey]){
      return this.addresses[addrKey]
    }else{
      return (this.addresses[addrKey]=this.hdPubNode.derive(change).derive(index).getAddress())
    }
  }
  getSegwitAddress(change,index){
    if(this.dummy){return}
    if(!this.hdPubNode){throw new Error("HDNode isn't specified.")}

    if(typeof index !=="number"){
      index=this.receiveIndex
    }
    const keyPair=this.hdPubNode.derive(change).derive(index).keyPair
    const witnessPubKey = bcLib.script.witnessPubKeyHash.output.encode(bcLib.crypto.hash160(keyPair.getPublicKeyBuffer()))
    
    const address = bcLib.address.fromOutputScript(witnessPubKey,this.network)
  }
  seedToPubB58(privSeed){
    if(this.dummy){return}
    let node;
    if(typeof privSeed ==="string"){
      node = bcLib.HDNode.fromBase58(privSeed,this.network)
    }else{
      node = bcLib.HDNode.fromSeedBuffer(privSeed,this.network)
    }
    return node
      .deriveHardened(44)
      .deriveHardened(this.bip44.coinType)
      .deriveHardened(this.bip44.account)
      .neutered().toBase58()
  }
  seedToPrivB58(privSeed){
    if(this.dummy){return}
    let node;
    if(typeof privSeed ==="string"){
      node = bcLib.HDNode.fromBase58(privSeed,this.network)
    }else{
      node = bcLib.HDNode.fromSeedBuffer(privSeed,this.network)
    }
    return node.toBase58()
  }
  getPrice(){
    return new Promise((resolve, reject) => {
      if(this.lastPriceTime+1000*60<Date.now()){
        axios({
          method:this.price.method||"get",
          url:this.price.url,
          responseType:this.price.json?"json":"text"
        }).then(res=>{
          let temp = res.data
          if(this.price.json){
            this.price.jsonPath.forEach(v=>{
              temp = temp[v]
            })
          }
          this.priceCache=temp
          this.lastPriceTime=Date.now()
          resolve(temp)
        }).catch(reject)
      }else{
        resolve(this.priceCache)
      }
    });
  }
  buildTransaction(option){
    if(this.dummy){return null;}
    if(!this.hdPubNode){throw new Error("HDNode isn't specified.");}
    return new Promise((resolve, reject) => {
      const targets = option.targets
      const feeRate = option.feeRate

      const txb = new bcLib.TransactionBuilder(this.network)

      
      this.getUtxos(this.getReceiveAddr().concat(this.getChangeAddr())).then(res=>{
        const path=[]
        const { inputs, outputs, fee } = coinSelect(res.utxos, targets, feeRate)
        if (!inputs || !outputs) throw new errors.NoSolutionError()
        inputs.forEach(input => {
          txb.addInput(input.txId, input.vout)
          
          path.push(this.getIndexFromAddress(input.address))
          
        })
        outputs.forEach(output => {
          if (!output.address) {
            output.address = this.getAddress(1,this.changeIndex+1)
          }

          txb.addOutput(output.address, output.value)
        })
       
        resolve({txBuilder:txb,balance:res.balance,utxos:inputs,path,fee})
      }).catch(reject)
    })
  }
  signTx(option){
    const entropyCipher = option.entropyCipher
    const password= option.password
    const txb=option.txBuilder
    const path=option.path
    
    let seed=
      bip39.mnemonicToSeed(
        bip39.entropyToMnemonic(
          coinUtil.decrypt(entropyCipher,password)
        )
      )
    const node = bcLib.HDNode.fromSeedBuffer(seed,this.network)
    for(let i=0;i<path.length;i++){
      txb.sign(i,node
               .deriveHardened(44)
               .deriveHardened(this.bip44.coinType)
               .deriveHardened(this.bip44.account)
               .derive(path[i][0]|0)
               .derive(path[i][1]|0).keyPair
              )
    }
    return txb.build()
  }
  pushTx(hex){
    if(this.dummy){return Promise.resolve()}
    return axios({
      url:this.apiEndpoint+"/tx/send",
      data:{rawtx:hex},
      method:"POST"}).then(res=>{
        return res.data
      })
  }


  getTxs(from,to){
    if(this.dummy){return Promise.resolve()}
    return axios({
      url:this.apiEndpoint+"/addrs/txs",
      data:{
        noAsm:1,
        noScriptSig:1,
        noSpent:0,
        from,to,
        addrs:this.getReceiveAddr().concat(this.getChangeAddr()).join(",")
      },
      method:"POST"}).then(res=>{
        return res.data
      })
  }
  getTx(txId){
    if(this.dummy){return Promise.resolve()}
    return axios({
      url:this.apiEndpoint+"/tx/"+txId,
      
      method:"GET"}).then(res=>{
        return res.data
      })
  }
}





