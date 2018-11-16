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
