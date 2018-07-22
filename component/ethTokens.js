/*
    Monya - The easiest cryptocurrency wallet
    Copyright (C) 2017-2018 MissMonacoin

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
const axios = require('axios');
const Web3 = require('web3')
const extension=require("../js/extension.js")
const erc20ABI = require("../js/erc20ABI.js")

const web3 = new Web3()
let ext

module.exports=require("../js/lang.js")({ja:require("./ja/ethTokens.html"),en:require("./en/ethTokens.html")})({
  data(){
    return{
      added:[],
      tokens:[],
      tokenReg:{
        contractAddress:"",
        symbol:"",
        decimals:0
      },
      blacklist:[],
      scam:false
    }
  },
  methods:{
    registerToken(contractAddress,symbol,name,decimals){
      decimals=parseFloat(decimals)

      if(!web3.utils.isAddress(contractAddress)||decimals<0||(decimals|0)!==decimals){
        return this.$store.commit("setError","Invalid Parameter")
      }

      for(let i=0;i<this.blacklist.length;i++){
        const item=this.blacklist[i]
        if(item.contractAddress.toLowerCase()===contractAddress.toLowerCase()){
          this.scam=true
          return
        }
      }
      
      this.added.push({
          contractAddress,
          symbol,
        decimals,
        name
      })
      return ext.set("tokens",this.added)
    },
    removeToken(i){
      this.added.splice(i,1)
      return ext.set("tokens",this.added)
    },
    getTokenInfo(){
      if(!web3.utils.isAddress(this.tokenReg.contractAddress)){
        return
      }
      const symbol=(new web3.eth.Contract(erc20ABI,this.tokenReg.contractAddress,{from:this.address}))
            .methods["symbol"]()
      
      symbol.call().then(result=>{
        if(result){
          this.tokenReg.symbol=result
        }
      }).catch(e=>{
        return false
      })

      const decimals=(new web3.eth.Contract(erc20ABI,this.tokenReg.contractAddress,{from:this.address}))
            .methods["decimals"]()
      
      decimals.call().then(result=>{
        if(result){
          this.tokenReg.decimals=parseInt(result,10)
        }
      }).catch(e=>{
        return false
      })
      
    },
  },
  created(){
    axios({
      method:"get",
      url:`https://monya-wallet.github.io/token-directory/${this.networkScheme}.json`
    }).then(res=>{
      this.tokens=res.data.tokens
      this.blacklist=res.data.blacklist
    }).catch(e=>{
      return true
    })
    ext=extension.extStorage(this.networkScheme)

    ext.get("tokens").then(tokens=>{
      this.added=tokens||[]
      
    })
  }
})
