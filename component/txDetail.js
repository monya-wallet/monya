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
