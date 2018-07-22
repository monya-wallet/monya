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
const coinUtil = require("../js/coinUtil")
const bcLib = require('bitcoinjs-lib')
const BigNumber = require('bignumber.js')

module.exports=require("../js/lang.js")({ja:require("./ja/history.html"),en:require("./en/history.html")})({
  data(){
    return {
      curFilter:"mona",
      filterDlg:false,
      dirFilter:"all",
      currency:[],
      currencyIndex:0,
      txs:[],
      state:"initial",
      error:false,
      noData:false,
      to:20,
      hasMore:false,
      outputDlg:false,
      json:"",
      threshold:0,
      hideDustSend:false,
      totalItems:0,
      from:0,
      enablePullHook:true
    }
  },
  store:require("../js/store.js"),
  methods:{
    load(done){
      this.noData=false
      this.error=false
      const cur =currencyList.get(this.currency[this.currencyIndex].coinId)
      
      Promise.all([cur.getTxs(this.from,this.to), cur.getTxLabel()]).then(data=>{
        const res=data[0]
        if(!res.totalItems){
          this.noData=true
          typeof(done)==='function'&&done()
        }

        this.hasMore=res.totalItems>res.to
        this.totalItems = res.totalItems
        for(let i=0;i<res.items.length;i++){
          const v=res.items[i]
          const txLbl=data[1][v.txid]

          let aIn=0
          let aOut=0
          let amount=0
          let hasMessage=false,
              direction="",
              message=""
          for(let j=0;j<v.vin.length;j++){
            if(cur.getIndexFromAddress(v.vin[j].addr)){
              aIn+=v.vin[j].valueSat
            }
          }

          aIn=(new BigNumber(aIn)).dividedBy(100000000).toNumber()
          
          for(let k=0;k<v.vout.length;k++){
            const vo=v.vout[k]
            const spk=vo.scriptPubKey
            if(spk.hex&&spk.hex.substr(0,2)==="6a"){
              hasMessage=true
              message=bcLib.script.nullData.output.decode(new Buffer(spk.hex,"hex")).toString('utf8')
            }
            if(spk.addresses){
              for(let l=0;l<spk.addresses.length;l++){
                if(cur.getIndexFromAddress(vo.scriptPubKey.addresses[l])){
                  aOut+=parseFloat(vo.value)
                  break
                }
              }
            }
          }
          if(aIn){
            direction="send"
          }else if(aOut){
            direction="receive"
          }else{
            direction="unknown"
          }
          const txToPush={
            txId:v.txid,
            txLabel:txLbl?txLbl.label:"",
            price:txLbl&&txLbl.price,
            inmatureConfirmation:!v.confirmations||v.confirmations<cur.confirmations,
            direction,
            message,
            aIn,
            aOut,
            hasMessage,
            read:txLbl&&txLbl.read,
            timestamp:v.time
          }
          this.txs.push(txToPush)
          //get tx label
        }
        typeof(done)==='function'&&done()
      }).catch(()=>{
        this.error=true
        typeof(done)==='function'&&done()
      })
    },
    loadMore(){
      this.from+=20
      this.to+=20

      this.load()
    },
    outputJson(){
      this.outputDlg=true;
      this.json=JSON.stringify(this.txs)
    },
    pullToLoad(done){
      this.reset()
      this.load(done)
    },
    reset(){
      this.from=0
      this.to=20
      this.txs=[]
      this.hasMore=false
    },
    filter(tx){
      const s = this.sub(tx.aOut,tx.aIn)
      if((this.dirFilter==="send"&&s>0)||(this.dirFilter==="receive"&&tx.aIn>tx.aOut)
         ||((s>0)?s:-s)<this.threshold||(this.hideDustSend&&tx.hasMessage&&!tx.price&&s<0&&-0.001<s)){
        return false
      }
      return true
    },
    txDetail(txId){
      if(!txId){return }
      this.$store.commit("setTxDetail",{
        txId,coinId:this.coinId
      })
      this.$emit("push",require("./txDetail.js"))
    },
    sub:(a,b)=>(a*100000000-Math.round(b*100000000))/100000000
  },
  mounted(){
    currencyList.eachWithPub(cur=>{
      this.currency.push({
        coinId:cur.coinId,
        icon:cur.icon,
        name:cur.coinScreenName
      })
    })
    this.load()
    const that = this
    
  },
  computed:{
    coinId(){
      return this.currency[this.currencyIndex].coinId
    }
  },
  watch:{
    currencyIndex(){
      this.reset()
      this.load()
    }
  }
})
