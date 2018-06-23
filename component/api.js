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
const coinUtil = require("../js/coinUtil.js")
const storage = require("../js/storage.js")
const currencyList = require("../js/currencyList")
const axios = require("axios")
const j = require("../js/lang").getLang() === "ja"

const apis={
  getAddress:{
    type:"normal",
    name:j?"アドレスの要求":"request your addresses",
    props:{
      addrIndex:"Address Index",
      coinId:"Coin ID"
    },
    onAllowed(props){
      const cur =currencyList.get(props.coinId)
      return Promise.resolve({
        address:cur.getAddress(0,props.addrIndex),
        pubKey:cur.getPubKey(0,props.addrIndex),
        addrIndex:props.addrIndex
      })
    }
  },
  signTx:{
    type:"password",
    name:j?"マルチシグトランザクション署名":"Sign Multisig transaction",
    props:{
      addrIndex:"Address Index",
      coinId:"Coin ID",
      neededSig:"The number of needed Sigs",
      complete:"Is complete?",
      pubs:"Public keys"
    },
    onAllowed(props,cipher,password){
      const cur =currencyList.get(props.coinId)
      const txb=cur.lib.TransactionBuilder.fromTransaction(cur.lib.Transaction.fromHex(props.unsigned),cur.network)
      const pubKeyBufArr = props.pubs.map(v=>Buffer.from(v,"hex"))
      const signed=cur.signMultisigTx({
        entropyCipher:cipher,
        password:this.password,
        txBuilder:txb,
        path:[0,props.addrIndex],
        pubKeyBufArr,
        neededSig:props.neededSig|0,
        complete:props.complete
      }).toHex()
      const address=cur.getAddress(0,props.addrIndex)
      return Promise.resolve({
        signature:signed,
        address
      })
    }
  },
  signMsg:{
    type:"password",
    name:j?"メッセージ署名":"Sign Message",
    props:{
      addrIndex:"Address Index",
      coinId:"Coin ID",
      message:"message"
    },
    onAllowed(props,cipher,password){
      const cur =currencyList.get(props.coinId)
      const signed =cur.signMessage(props.message,cipher.entropy,password,[0,props.addrIndex])
      this.password=""
      const address=cur.getAddress(0,props.addrIndex)
      return Promise.resolve({
        signature:signed,
        address,
        message:props.message
      })
    }
  },
  shareSwapData:{
    type:"direct",
    props:{
      
    },
    onAllowed(props){
      this.$emit("pop")
      this.$emit("push",require("./atomicswap.js"))
    }
  }
}
module.exports=require("../js/lang.js")({ja:require("./ja/api.html"),en:require("./en/api.html")})({
  data(){
    return {
      name:this.$store.state.apiName,
      param:this.$store.state.apiParam,

      qType:"none",

      password:"",
      dataDlg:false,
      dataToPassApp:"",
      successful:false,

      props:{},
      method:""
    }
  },
  store:require("../js/store.js"),
  methods:{
    next(){
      const api=apis[this.name]
      const props={}
      for(let p in api.props){
        props[p]=this.param[p]
      }
      let prom=Promise.resolve()
      if("password"===api.type){
        prom=storage.get("keyPairs")
      }
      prom.then((cipher)=>{
        return api.onAllowed.call(this,props,cipher,this.password)
      }).then(this.returnResult).catch(e=>{
        this.$store.commit("setError",e.message||"Unknown")
      })
    },
    returnResult(data){
      data.payload=this.param.payload
      if(this.param.callbackURL){
        axios.post(this.param.callbackURL,data).then(()=>{
          this.successful=true
        })
      }else if(this.param.callbackPage){
        const url = new URL(this.param.callbackPage)

        for(let key in data){
          if (data.hasOwnProperty(key)) {
            url.searchParams.append(key,data[key])
          }
        }
        coinUtil.openUrl(url.toString())
        this.successful=true
      }else{
        this.successful=true
        this.dataToPassApp=JSON.stringify(data)
      }
    }
  },
  mounted(){
    if(!apis[this.name]){
      return
    }
    this.qType=apis[this.name].type
    if("password"===this.qType){

      storage.verifyBiometric().then(pwd=>{
        this.password=pwd
      }).catch(()=>{
        return true
      })
    }
    this.$set(this,"props",apis[this.name].props)
    this.method=apis[this.name].name
  }
})
