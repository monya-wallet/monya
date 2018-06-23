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
const currencyList = require("../js/currencyList")
const titleList = require("../js/titleList")
const storage = require("../js/storage.js")

module.exports=require("../js/lang.js")({ja:require("./ja/sendToken.html"),en:require("./en/sendToken.html")})({
  data(){
    return {
      token:this.$store.state.tokenInfo,
      coinId:this.$store.state.coinId,
      divisible:this.$store.state.divisible,
      sendAddress:this.$store.state.sendable,
      labels:[],
      addressIndex:0,
      loading:false,
      dest:"",
      sendAmount:0,
      sendMemo:"",
      password:"",
      feePerByte:200,
      noFund:false,
      sendWithSmall:false
    }
  },
  store:require("../js/store.js"),
  methods:{
    
    createTx(){
      this.loading=true
      titleList.get(this.titleId).createTx({
        divisible:this.divisible,
        sendAmount:this.sendAmount,
        addressIndex:this.addressIndex,
        dest:this.dest,
        token:this.token,
        includeUnconfirmedFunds:this.$store.state.includeUnconfirmedFunds,
        password:this.password,
        memo:this.sendMemo,
        feePerByte:this.feePerByte,
        useEnhancedSend:!this.sendWithSmall
      }).then(r=>{
        this.loading=false
        this.$ons.notification.alert("Successfully sent transaction.Transaction ID is: "+r)
      }).catch(e=>{
        this.loading=false
        this.$store.commit("setError",e.message)
      })
    },
    
    getAddrLabel(){
      currencyList.get(this.coinId).getLabels().then(res=>{
        this.$set(this,"labels",res)
      })
    },
    checkFund(){
      const cur = titleList.get(this.titleId).cp
      const address = cur.getAddress(0,this.addressIndex|0)
      cur.getAddressProp("balance",address).then(r=>{
        if(r<50000){
          this.noFund=true
        }
      })
    },
    deposit(){
      const cur = titleList.get(this.titleId).cp
      const address = cur.getAddress(0,this.addressIndex|0)
      this.$store.commit("setSendUrl",`${cur.bip21}:${address}`)
      this.$emit("push",require("./send.js"))
      this.noFund=false
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
    },
    labelName(){
      return this.labels[this.addressIndex]
    }
  },
  mounted(){
    this.getAddrLabel()
    storage.verifyBiometric().then(pwd=>{
      this.password=pwd
    }).catch(()=>{
      // noop
    })
    if(window.StatusBar){
      window.StatusBar.styleLightContent();
    }  
    const cur = titleList.get(this.titleId).cp
    this.addressIndex = cur.getIndexFromAddress(this.sendAddress)[1]
    
    this.checkFund()
  }
})
