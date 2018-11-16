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
const Title = require("../js/title")
const bcLib = require('bitcoinjs-lib')
module.exports=require("../js/lang.js")({ja:require("./ja/txDetail.html"),en:require("./en/txDetail.html")})({
  data(){
    return {
      res:null,
      message:"",
      fiat:this.$store.state.fiat,
      coinId:this.$store.state.detail.coinId,
      price:0,
      txId:this.$store.state.detail.txId,
      txLabel:"",
      showScript:false,
      decodedCPMessage:null
    }
  },
  mounted(){
    this.load()
  },
  store:require("../js/store.js"),
  methods:{
    load(){
      const cur = currencyList.get(this.coinId)
      this.coinId=cur.coinId
      const txProm = cur.getTx(this.txId).then(v=>{
        this.res=v
        v.vout.forEach(o=>{
          if(o.scriptPubKey.hex&&o.scriptPubKey.hex.substr(0,2)==="6a"){
            this.message=bcLib.script.nullData.output.decode(new Buffer(o.scriptPubKey.hex,"hex")).toString('utf8')
          }
        })
      })
      const labelProm=cur.getTxLabel(this.txId).then(res=>{
        this.price=res.price||""
        this.txLabel=res.label
      })
      Promise.all([txProm,labelProm]).then(()=>{
        this.saveTxLabel()
      }).catch(e=>{
        this.$store.commit("setError",e.message)
      })
    },
    txDetail(txId){
      if(!txId){
        return
      }
      this.$store.commit("setTxDetail",{
        txId,coinId:this.coinId
      })
      this.$emit("push",module.exports)
    },
    addressClass(addr){
      const addrTuple=currencyList.get(this.coinId).getIndexFromAddress(addr)
      if(!addrTuple)return ""
      if(parseInt(addrTuple[0],10)===0)return "receive"
      if(parseInt(addrTuple[0],10)===1)return "change"
    },
    saveTxLabel(){
      currencyList.get(this.coinId).saveTxLabel(this.txId,{read:true,label:this.txLabel,price:parseFloat(this.price)})
    },
    openTxExplorer(){
      currencyList.get(this.coinId).openExplorer({txId:this.res.txid})
    },
  },watch:{
    showScript(){
      if(this.decodedCPMessage){
        return
      }
      const cur = currencyList.get(this.coinId)
      if(!cur.counterpartyEndpoint){
        return
      }
      const title = new Title({
        titleId:"forTxDetail",
        cpCoinId:this.coinId,
        titleName:"forTxDetail"
      })
      title.callCPLib("getrawtransaction",{tx_hash:this.res.txid}).then(res=>{
        return title.callCPLib("get_tx_info",{tx_hex:res})
      }).then(res=>{
        if(!res||!res[4]){
          throw false
        }
        return title.callCPLib("unpack",{data_hex:res[4]})
      }).then(res=>{
        if(!res){throw false}
        this.decodedCPMessage=JSON.stringify(res)
      }).catch(res=>{
        this.decodedCPMessage="{success:false}"
      })
    }
  }
})
