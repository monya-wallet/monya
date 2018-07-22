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
const storage = require("../js/storage.js")
const coinUtil=require("../js/coinUtil")
const currencyList = require("../js/currencyList")
const bcLib = require('bitcoinjs-lib')
const errors = require("../js/errors")
const BigNumber = require('bignumber.js');
module.exports=require("../js/lang.js")({ja:require("./ja/confirm.html"),en:require("./en/confirm.html")})({
  data(){
    return {
      address:"",
      amount:"",
      fiat:"",
      feePerByte:0,
      fee:0,
      destHasUsed:false,
      message:"",
      myBalanceBeforeSending:0,
      utxosToShow:null,
      signedHex:null,
      coinType:"",
      utxoStr:"",
      ready:false,
      txb:null,
      addressPath:null,
      password:"",
      cur:null,
      insufficientFund:false,
      loading:true,
      incorrect:false,
      paySound:false,
      hash:""
    }
  },
  store:require("../js/store.js"),
  mounted(){
    ["address","amount","fiat","feePerByte","message","coinType","txLabel","utxoStr","signOnly"].forEach(v=>{
      this[v]=this.$store.state.confPayload[v]
    })
    this.cur=currencyList.get(this.coinType)
    this.$nextTick(this.build)
    currencyList.get(this.coinType).getAddressProp("totalReceived",this.address).then(res=>{
      if(res|0){
        this.destHasUsed=true
      }
    })
  },
  computed:{
    afterSent(){
      return (new BigNumber(this.myBalanceBeforeSending)).minus(parseFloat(this.amount)||0).minus(this.fee).toNumber()
    },
    utxosJson(){
      return JSON.stringify(this.utxosToShow)
    }
  },
  methods:{
    next(){
      this.loading=true
      const cur=this.cur
      if (cur.sound&&this.paySound) {
        (new Audio(cur.sound)).play()
      }
      this.ready=false
      storage.get("keyPairs").then((cipher)=>{
        const finalTx=cur.signTx({
          entropyCipher:cipher.entropy,
          password:this.password,
          txBuilder:this.txb,
          path:this.path
        })
        this.hash=finalTx.toHex()
        if(this.signOnly){
          throw new errors.SignOnly()
        }
        return cur.pushTx(this.hash)
      }).then((res)=>{
        cur.saveTxLabel(res.txid,{label:this.txLabel,price:parseFloat(this.price)})
        this.$store.commit("setFinishNextPage",{infoId:"sent",payload:{
          txId:res.txid
        }})
        this.$emit("pop")
        this.$emit("pop")
        this.$emit("push",require("./finished.js"))

        
      }).catch(e=>{
        this.loading=false
        if(e.request){
          this.$store.commit("setError",e.request.responseText||"Network Error.Please try again")
        }else if(e instanceof errors.PasswordFailureError){
          this.incorrect=true
          this.ready=true
          setTimeout(()=>{
            this.incorrect=false
          },3000)
        }else if(e instanceof errors.SignOnly){
          this.ready=true
        }else{
          this.$store.commit("setError",e.message)
        }
      })
    },
    requestBiometric(){
      storage.verifyBiometric().then(pwd=>{
        this.password=pwd
      }).catch(()=>{
        return true
      })
    },
    build(){
      const cur =this.cur
      const targets = [{
        address:this.address,
        value:(new BigNumber(this.amount)).times(100000000).round().toNumber()
      }];
      if(this.message){
        targets.push({
          address:bcLib.script.nullData.output.encode(Buffer.from(this.message, 'utf8')),
          value:0
        })
      }
      storage.get("settings").then((data)=>{
        this.paySound=data.paySound
        return cur.buildTransaction({
          targets,
          feeRate:this.feePerByte,
          includeUnconfirmedFunds:data.includeUnconfirmedFunds,
          utxoStr:this.utxoStr
        })
      }).then(d=>{
        this.fee=(new BigNumber(d.fee)).div(100000000)
        this.utxosToShow=d.utxos
        this.path=d.path
        this.myBalanceBeforeSending=d.balance
        this.txb=d.txBuilder
        this.ready=true
        this.loading=false
        this.requestBiometric()
        return coinUtil.getPrice(cur.coinId,this.$store.state.fiat)
      }).then(price=>{
        this.price=price
      }).catch(e=>{
        this.ready=false
        this.loading=false
        if(e instanceof errors.NoSolutionError){
          this.insufficientFund=true
        }else{
          this.$store.commit("setError",e.message)
        }
      })
    }
  }
})
