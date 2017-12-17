const bcLib = require('bitcoinjs-lib')
const axios = require('axios');
const coinSelect = require('coinselect')
const errors = require("./errors")
const bip39 = require("bip39")
const coinUtil = require("./coinUtil")
module.exports=class{
  static get maxLabel(){return 10}
  
  constructor(opt){
    this.coinId = opt.coinId;
    this.coinScreenName = opt.coinScreenName;
    this.unit = opt.unit;
    this.unitEasy = opt.unitEasy;
    this.bip44 = opt.bip44;
    this.defaultAPIEndpoint = opt.defaultAPIEndpoint;
    this.network = opt.network;
    this.price = opt.price;
    this.dummy=!!opt.dummy
    this.icon = opt.icon;
    this.prefixes=opt.prefixes;
    this.bip21=opt.bip21;
    this.defaultFeeSatPerByte = opt.defaultFeeSatPerByte;
    
    this.hdPubNode=null;
    this.lastPriceTime=0;
    this.priceCache=0;
    this.wholeBalanceSat = 0;
    this.receiveIndex=0;
    this.changeIndex=-1;
  }
  setPubSeedB58(seed){
    if(this.dummy){return}
    this.hdPubNode = bcLib.HDNode.fromBase58(seed,this.network)
  }
  getAddressProp(propName,address){
    if(this.dummy){return Promise.resolve()}
    return axios({
      url:this.defaultAPIEndpoint+"/addr/"+address+"/"+propName,
      json:true,
      method:"GET"}).then(res=>{
        return res.data
      })

  }
  getWholeBalanceOfThisAccount(gb=true){
    if(this.dummy){return Promise.resolve()}
    return new Promise((resolve, reject) => {
      if(!this.hdPubNode){throw new Error("HDNode isn't specified.")}
      this.wholeBalanceSat=0;
      this.wholeUnconfirmedSat=0;
      this._getBalance(0,0,gb,(index)=>{
        this.receiveIndex=index;
        this._getBalance(1,0,gb,(index2)=>{
          this.changeIndex=index2;
          resolve({balance:this.wholeBalanceSat,unconfirmed:this.unconfirmedBalanceSat})
        })
      })
    })
    
  }
  _getBalance(change,index,gb,cb){
    if(this.dummy){return Promise.resolve()}
    return new Promise((resolve, reject) => {
      this.getAddressProp(gb?"":"totalReceived",this.getAddress(change,index)).then(res=>{
        if(!change){
          if(index>module.exports.maxLabel){
            cb(index)
          }else{
            this.wholeBalanceSat+=res.balanceSat
            this.wholeUnconfirmedSat+=res.unconfirmedBalanceSat
            this._getBalance(change,++index,gb,cb)
          }
        }else{
          if(gb&&res.totalReceived){
            this.wholeBalanceSat+=res.balanceSat
            this.wholeUnconfirmedSat+=res.unconfirmedBalanceSat
            this._getBalance(change,++index,gb,cb)
          }else if(!gb&&parseInt(res,10)){
            this._getBalance(change,++index,gb,cb)
          }else{
            cb(index)
          }
        }
      })
    })
  }
  getUtxos(){
    const receivePromises=[]
    const changePromises=[]
    const addressPath = {}
    const utxos=[];
    let balance=0
    for(let i=0;i<this.receiveIndex;i++){
      const ad =this.getAddress(0,i)
      receivePromises.push(
        this.getAddressProp("utxo",ad)
      )
      addressPath[ad]=[0,i]
    }
    for(let i=0;i<this.changeIndex;i++){
      const ad =this.getAddress(1,i)
      changePromises.push(
        this.getAddressProp("utxo",ad)
      )
      addressPath[ad]=[1,i]
    }
    return Promise.all(receivePromises.concat(changePromises)).then(vals=>{
      for(let i=0;i<vals.length;i++){
        for(let j=0;j<vals[i].length;j++){
          let u=vals[i][j];
          balance+=u.amount*100000000
          utxos.push({
            value:u.amount*100000000,
            txId:u.txid,
            vout:u.vout,
            address:u.address,
            change:addressPath[u.address][0],
            index:addressPath[u.address][1],
          })
        }
      }
      return {
        utxos,
        balance:balance
      };
    })
  }
  
  getAddress(change,index){
    if(this.dummy){return}
    if(!this.hdPubNode){throw new Error("HDNode isn't specified.")}

    if(typeof index !=="number"){
      index=this.receiveIndex
    }
    return this.hdPubNode.derive(change).derive(index).getAddress()
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
    //if(this.dummy){return}
    if(!this.hdPubNode){throw new Error("HDNode isn't specified.")}
    return new Promise((resolve, reject) => {
      const targets = option.targets
      const feeRate = option.feeRate

      const txb = new bcLib.TransactionBuilder(this.network)
      this.getUtxos().then(res=>{
        const path=[]
        const { inputs, outputs, fee } = coinSelect(res.utxos, targets, feeRate)
        if (!inputs || !outputs) throw new errors.NoSolutionError()
        inputs.forEach(input => {
          txb.addInput(input.txId, input.vout)
          path.push([input.change,input.index])
        })
        outputs.forEach(output => {
          if (!output.address) {
            output.address = this.getAddress(1,this.changeIndex)
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
               .derive(path[i][0])
               .derive(path[i][1]).keyPair
              )
    }
    return txb.build()
  }
  pushTx(hex){
    if(this.dummy){return Promise.resolve()}
    return axios({
      url:this.defaultAPIEndpoint+"/tx/send",
      data:{rawtx:hex},
      method:"POST"}).then(res=>{
        return res.data
      })
  }

}










