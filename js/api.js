const axios = require('axios');
const param = require("./param")

exports.getAddressProp = (addr,propName,endpoint)=> new Promise((resolve, reject) => {
  axios({
    url:endpoint+"/addr/"+addr+"/"+propName,
    json:true,
    method:"GET"}).then(res=>{
      resolve(res.data)
    })//according to insight api,balance,totalReceived,totalSent,unconfirmedBalance,utxo available.Unit will be satoshis/watanabes
    
});
const cache = {}
exports.getAddressBal = (address,cacheable=false) => new Promise((resolve, reject) => {//Unit is not satoshis,one unit(MONA)
  if(cacheable&&cache[address]&&cache[address].time+1000*60*2>Date.now()){
    resolve(cache[address].balance)
  }else{
     exports.getAddressProp(address,"balance").then(res=>{
       resolve(res/100000000)
       cache[address]={
         time:Date.now(),
         balance:res/100000000
       }
    })
  }
});
let priceCache=0;
let lastPriceTime=0;

exports.getPrice = (curTicker,fiatTicker)=>new Promise((resolve,reject)=>{
  if(curTicker.toLowerCase() !=="mona"||fiatTicker.toLowerCase()!=="jpy"){
    throw new Error("This pair is not supported in this version. Now MONA/JPY(bitbank)is supported")
  }
  if(lastPriceTime+1000*60<Date.now()){
  axios({
    url:"https://public.bitbank.cc/mona_jpy/ticker",
    json:true,
    method:"GET"}).then(res=>{
      priceCache=parseFloat(res.data.data.last)
      lastPriceTime=Date.now()
      resolve(priceCache)
    }).catch(reject)
  }else{
    resolve(priceCache)
  }
})
