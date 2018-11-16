/*
 MIT License

 Copyright (c) 2018 monya-wallet zenypota

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.
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
