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

module.exports=require("../js/lang.js")({ja:require("./ja/dexOrder.html"),en:require("./en/dexOrder.html")})({
  data(){
    return {
      coinId:this.$store.state.coinId,
      labels:[],
      addressIndex:0,
      loading:false,
      password:"",
      feePerByte:200,
      getAmount:0,
      giveAmount:0,
      giveToken:"",
      getToken:"",
      expiration:50,
      advanced:false,
      noFund:false
    }
  },
  store:require("../js/store.js"),
  methods:{
    
    createTx(){
      this.loading=true
      titleList.get(this.titleId).createOrder({
        addressIndex:this.addressIndex,
        includeUnconfirmedFunds:this.$store.state.includeUnconfirmedFunds,
        password:this.password,
        feePerByte:this.feePerByte,
        giveAmt:this.giveAmount,
        giveToken:this.giveToken,
        getAmt:this.getAmount,
        getToken:this.getToken,
        expiration:this.expiration
      }).then(r=>{
        this.loading=false
        this.$ons.notification.alert("Successfully sent transaction.Transaction ID is: "+r)
      }).catch(e=>{
        this.loading=false
        this.$store.commit("setError",e.message)
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
    
    getAddrLabel(){
      currencyList.get(this.coinId).getLabels().then(res=>{
        this.$set(this,"labels",res)
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
    }
  },
  mounted(){
    this.getAddrLabel()
    if(window.StatusBar){
      window.StatusBar.styleLightContent();
    }
    this.checkFund()
  },
  watch:{
    addressIndex(){
      this.checkFund()
    }
  }
})
