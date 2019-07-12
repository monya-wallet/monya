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
      sendWithSmall:false,
      advanced:false
    }
  },
  store:require("../js/store.js"),
  methods:{
    async next(){
      try {
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
          this.$store.commit("setFinishNextPage",{page: require("./monaparty.js"), infoId:"sent",payload:{
            txId: r,
            coinId: 'monaparty'
          }})
          this.$emit("push", require("./finished.js"))
          this.loading=false
        }).catch(e=>{
          this.loading=false
          this.$store.commit("setError", e.message)
        })
      } catch (e) {
        this.loading=false
        this.$store.commit("setError", e.message)
      }
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
