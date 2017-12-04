const axios = require('axios');

exports.apiEndpoint="https://mona.chainsight.info/api"

exports.getAddressProp = (addr,propName)=> new Promise((resolve, reject) => {
  axios({
    url:exports.apiEndpoint+"/addr/"+addr+"/"+propName,
    json:true,
    method:"GET"}).then(res=>{
      resolve(res.data)
    })//according to insight api,balance,totalReceived,totalSent,unconfirmedBalance,utxo available.Unit will be satoshis/watanabes
    
});
exports.getPrice = (curTicker,fiatTicker)=>new Promise((resolve,reject)=>{
  if(curTicker.toLowerCase() !=="mona"||fiatTicker.toLowerCase()!=="jpy"){
    throw new Error("This pair is not supported in this version. Now MONA/JPY(bitbank)is supported")
  }
  axios({
    url:"https://public.bitbank.cc/mona_jpy/ticker",
    json:true,
    method:"GET"}).then(res=>{
      resolve(parseFloat(res.data.data.last))
    })
})
