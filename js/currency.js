const bcLib = require('bitcoinjs-lib')
const axios = require('axios');

module.exports=class{
  constructor(opt){
    this.coinId = opt.coinId;
    this.coinScreenName = opt.coinScreenName;
    this.unit = opt.unit;
    this.unitEasy = opt.unitEasy;
    this.bip44 = opt.bip44;
    this.defaultAPIEndpoint = opt.defaultAPIEndpoint;
    this.network = opt.network;
    this.getPricePromise = opt.getPricePromise;
    this.dummy=!!opt.dummy
    this.icon = opt.icon;
    this.prefixes=opt.prefixes
    
    this.hdPubNode;
    this.lastPriceTime=0;
    this.priceCache=0;
    this.wholeBalanceSat = 0;
    this.receiveIndex=0;
    this.changeIndex=0;
  }
  setPubSeedB58(seed){
    if(this.dummy){return}
    this.hdPubNode = bcLib.HDNode.fromBase58(seed,this.network)
  }
  getAddressProp(propName,address){
    if(this.dummy){return Promise.resolve()}
    return new Promise((resolve, reject) => {
      axios({
        url:this.defaultAPIEndpoint+"/addr/"+address+"/"+propName,
        json:true,
        method:"GET"}).then(res=>{
          resolve(res.data)
        })
    })
  }
  getWholeBalanceOfThisAccount(){
    if(this.dummy){return Promise.resolve()}
    return new Promise((resolve, reject) => {
      if(!this.hdPubNode){throw new Error("HDNode isn't specified.")}
      this._getBalance(0,0,(index)=>{
        this.receiveIndex=index;
        this._getBalance(1,0,(index)=>{
          this.changeIndex=index;
          resolve(this.wholeBalanceSat)
        })
      })
    })
    
  }
  _getBalance(change,index,cb){
    if(this.dummy){return Promise.resolve()}
    return new Promise((resolve, reject) => {
      this.getAddressProp("",this.getAddress(change,index)).then(res=>{
        if(res.totalReceived){
          this.wholeBalanceSat+=res.balanceSat
          this.wholeUnconfirmedSat+=res.unconfirmedBalanceSat
          this._getBalance(change,++index,cb)
        }else{
          cb(index)
        }
      })
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
  seedToPubB58(privSeed){
    if(this.dummy){return}
    let node;
    if(typeof privSeed ==="string"){
      node = bcLib.HDNode.fromBase58(privSeed)
    }else{
      node = bcLib.HDNode.fromSeedBuffer(privSeed)
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
      node = bcLib.HDNode.fromBase58(privSeed)
    }else{
      node = bcLib.HDNode.fromSeedBuffer(privSeed)
    }
    return node.toBase58()
  }
  getPrice(fiat){
    if(this.dummy){return Promise.resolve()}
    return new Promise((resolve, reject) => {
      if(this.lastPriceTime+1000*60<Date.now()){
        this.getPricePromise(fiat).then(res=>{
            this.priceCache=res
          this.lastPriceTime=Date.now()
          resolve(res)
        }).catch(reject)
      }else{
        resolve(this.priceCache)
      }
    });
  }
  static isValidAddress(addr){
    try{
      bcLib.address.fromBase58Check(addr)
      return true
    }catch(e){
      return false
    }
  }
}
