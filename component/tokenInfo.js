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
const currencyList = require("../js/currencyList")
const titleList = require("../js/titleList")
const coinUtil = require("../js/coinUtil")
const axios = require("axios")
module.exports=require("../js/lang.js")({ja:require("./ja/tokenInfo.html"),en:require("./en/tokenInfo.html")})({
  data(){return{
    token:this.$store.state.tokenInfo,
    coinId:this.$store.state.coinId,
    sendable:this.$store.state.sendable,
    asset:null,
    history:[],
    loading:true,
    card:null
  }},
  store:require("../js/store.js"),
  methods:{
    sendToken(){
      this.$store.commit("setTokenInfo",{token:this.token,coinId:this.coinId,sendable:this.sendable,divisible:this.asset.divisible})
      this.$emit("push",require("./sendToken.js"))
    },
    openTwitter(){
      coinUtil.openUrl("https://twitter.com/"+this.card.twitterScreenName)
    },
    goToListTokens(addr){
      this.$store.commit("setTokenInfo",{addr,coinId:titleList.get(this.titleId).cpCoinId})
      this.$emit("push",require("./listTokens.js"))
    }
  },
  computed:{
    titleId:{
      get(){
        return this.$store.state.monapartyTitle
      },
      set(v){
        this.$store.commit("setTitle",v)
        return v
      }
    }
  },
  mounted(){
    const title = titleList.get(this.titleId)
    title.getToken(this.token).then(r=>{
      this.asset=r.asset[0]
      this.card=r.card[0]
      this.loading=false
      if(this.asset){
        return title.getTokenHistory(this.asset.asset)
      }else{
        return {}
      }
    }).then(r=>{
      this.history=r
    }).catch(e=>{
      this.loading=false
      this.$store.commit("setError",e.message)
    })
    if(window.StatusBar){
      window.StatusBar.styleLightContent();
    }
  }      
})
