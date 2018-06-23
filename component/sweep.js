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
const storage = require("../js/storage")
const coinUtil = require("../js/coinUtil")

module.exports=require("../js/lang.js")({ja:require("./ja/sweep.html"),en:require("./en/sweep.html")})({
  data(){
    return {
      currency:[],
      currencyIndex:0,
      private:"",
      address:"",
      fee:0.0005
    }
  },
  store:require("../js/store.js"),
  methods:{
    send(){
      if(this.private&&this.address&&this.fee){
        const cur = currencyList.get(this.currency[this.currencyIndex].coinId)
        cur.sweep(this.private,this.address,this.fee).then((res)=>{
          cur.saveTxLabel(res.txid,{label:this.txLabel,price:parseFloat(this.price)})
          this.$store.commit("setFinishNextPage",{page:require("./home.js"),infoId:"sent",payload:{
            txId:res.txid
          }})
          this.$emit("replace",require("./finished.js"))

          
        }).catch(e=>{
          this.$store.commit("setError",e)
        })
      }
    },
    getDefaultAddress(){
      this.address=currencyList.get(this.currency[this.currencyIndex].coinId).getAddress(0,0)
    }
    
  },
  watch:{
    currencyIndex(){
      this.fee=currencyList.get(this.currency[this.currencyIndex].coinId).defaultFeeSatPerByte*226/100000000
    }
  },
  
  created(){
    currencyList.eachWithPub(cur=>{
      this.currency.push({
        coinId:cur.coinId,
        icon:cur.icon,
        name:cur.coinScreenName
      })
    })
    
    
  }
})
