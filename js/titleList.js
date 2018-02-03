const Title = require("./title")
const axios = require('axios');
const coinUtil=require("../js/coinUtil")

const defaultTitles=[{
  cpCoinId:"mona",//Monaparty
  titleId:"monacard",
  titleName:"Monacard",
  apiVer:1,
  apiEndpoint:"https://card.mona.jp/api"
},{
  cpCoinId:"mona",//Monaparty
  titleId:"scamgirs",
  titleName:"Scam Girls",
  apiVer:2,
  apiEndpoint:"https://zaif-status.herokuapp.com/scamgirls/api"
},{
  cpCoinId:"btc",//Monaparty
  titleId:"cp",
  titleName:"Counterparty",
  apiVer:false
},{
  cpCoinId:"tzny",//Monaparty
  titleId:"zp",
  titleName:"Zenyparty",
  apiVer:false
}]

const titles={}
/**
 * Get supported titles
 * @param {function} fn(Title).
 */
exports.each=(fn)=>{
  
  for(let titleName in titles){
    if(titles[titleName] instanceof Title){
      fn(titles[titleName])
    }
  }
}

/**
 * Get a title from title ID
 * @param {String} titleId.
 */
exports.get=titleId=>{
    
  if((titles[titleId] instanceof Title)){
    return titles[titleId]
  }
}

exports.getTitleList=()=>{
  return titles
}

exports.init =customTitles=>{
  for(let i = 0;i<defaultTitles.length;i++){
    const defCoin = defaultTitles[i]
    titles[defCoin.titleId]=new Title(defCoin)
  }
  for(let i = 0;i<customTitles.length;i++){
    const defCoin = customTitles[i]
    titles[defCoin.titleId]=new Title(defCoin)
  }
}
exports.addTitle=customTitle=>{
  titles[customTitle.titleId]=customTitle
}
