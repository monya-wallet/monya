/*
    Monya - The easiest cryptocurrency wallet
    Copyright (C) 2017-2018 monya-wallet

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
const Title = require("./title")
const axios = require('axios');
const coinUtil=require("../js/coinUtil")

const defaultTitles=[{
  cpCoinId:"btc",//Monaparty
  titleId:"cp",
  titleName:"Counterparty",
  apiVer:false,
  icon:require("../res/coins/xcp.png")
},{
  cpCoinId:"mona",//Monaparty
  titleId:"monacard",
  titleName:"Monacard",
  apiVer:1,
  apiEndpoint:"https://card.mona.jp/api",
  icon:require("../res/coins/xmp.png")
}]

let titles={}
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
  titles={}
  for(let i = 0;i<defaultTitles.length;i++){
    const defCoin = defaultTitles[i]
    titles[defCoin.titleId]=new Title(defCoin)
  }
  for(let i = 0;i<customTitles.length;i++){
    const defCoin = customTitles[i]
    titles[defCoin.titleId]=new Title(defCoin)
  }
}
