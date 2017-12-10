const Currency = require("./currency")
const axios = require('axios');

module.exports ={
  mona:new Currency({//key = coinId that is lowercase ticker symbol
    coinScreenName:"モナコイン",
    coinId:"mona",
    unit:"MONA",
    unitEasy:"モナ",
    bip44:{
      coinType:22,//from slip44
      account:0
    },
    icon:require("../res/coins/mona.png"),
    defaultAPIEndpoint:"https://mona.chainsight.info/api",
    network:{
      messagePrefix: '\x19Monacoin Signed Message:\n',
      bip32: {
        public: 0x0488b21e,
        
        private: 0x0488ade4
      },
      pubKeyHash: 0x32,
      scriptHash: 0x05,
      wif: 0xb2,
      bech32:"mona"
    },
    prefixes:["M","P"],
    getPricePromise(fiat){
      return new Promise((resolve,reject)=>{
        if(fiat!=="jpy"){
          throw new Error("This pair is not supported in this version. Now MONA/JPY(bitbank)is supported")
        }
        axios({
          url:"https://public.bitbank.cc/mona_jpy/ticker",
          json:true,
          method:"GET"}).then(res=>{
            resolve(parseFloat(res.data.data.last))
          }).catch(reject)
      })
    }
  }),
  btc:new Currency({//key = coinId that is lowercase ticker symbol
    coinScreenName:"ビットコイン",
    coinId:"btc",
    unit:"BTC",
    unitEasy:"ビットコイン",
    bip44:{
      coinType:0,//from slip44
      account:0
    },
    icon:require("../res/coins/btc.png"),
    defaultAPIEndpoint:"https://mona.chainsight.info/api",
    network:{
      messagePrefix: '\x19Monacoin Signed Message:\n',
      bip32: {
        public: 0x0488b21e,
        
        private: 0x0488ade4
      },
      pubKeyHash: 0x32,
      scriptHash: 0x05,
      wif: 0xb2,
      bech32:"mona"
    },
    prefixes:["1","3"],
    getPricePromise(fiat){
      return new Promise((resolve,reject)=>{
        if(fiat!=="jpy"){
          throw new Error("This pair is not supported in this version. Now MONA/JPY(bitbank)is supported")
        }
        axios({
          url:"https://public.bitbank.cc/mona_jpy/ticker",
          json:true,
          method:"GET"}).then(res=>{
            resolve(parseFloat(res.data.data.last))
          }).catch(reject)
      })
    }
  }),
  
  /*zny:new Currency({
    coinScreenName:"BitZeny",
    unit:"ZNY",
    coinId:"zny",
    unitEasy:"銭",
    bip44:{
      coinType:123,//from slip44
      account:0
    },
    
    network:{
      messagePrefix: '\x19BitZeny Signed Message:\n',
      bip32: {
        public: 0x0488b21e,
        
        private: 0x0488ade4
      },
      pubKeyHash: 0x32,
      scriptHash: 0x05,
      wif: 0xb2,
      bech32:"mona"
    }
  })*/
}
exports._createNewCurrency =opts=>{

}
