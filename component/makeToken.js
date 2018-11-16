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
const currencyList = require("../js/currencyList")
const BigNumber = require('bignumber.js');
const storage = require("../js/storage")
const titleList = require("../js/titleList")

module.exports=require("../js/lang.js")({ja:require("./ja/makeToken.html"),en:require("./en/makeToken.html")})({
  data(){
    return {
      token:"",
      coinId:this.$store.state.coinId,
      labels:[],
      addressIndex:0,
      loading:false,
      divisible:false,
      password:"",
      feePerByte:"",
      description:"",
      transferDest:"",
      noFund:false
    }
  },
  store:require("../js/store.js"),
  methods:{
    
    createTx(){
      this.loading=true
      titleList.get(this.titleId).createIssuance({
        divisible:this.divisible,
        amount:this.amount,
        addressIndex:this.addressIndex,
        token:this.token,
        includeUnconfirmedFunds:this.$store.state.includeUnconfirmedFunds,
        password:this.password,
        memo:this.sendMemo,
        feePerByte:this.feePerByte,
        description:this.description,
        transferDest:this.transferDest
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
  mounted(){
    this.getAddrLabel()
    if(window.StatusBar){
      window.StatusBar.styleLightContent();
    }
    this.checkFund()
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
    nativeSymbol(){
      return titleList.get(this.titleId).cp.counterparty.nativeSymbol
    }
  },
  watch:{
    addressIndex(){
      this.checkFund()
    }
  }
})
