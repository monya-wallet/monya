const currencyList = require("../js/currencyList")
const coinUtil = require("../js/coinUtil")
const bcLib = require('bitcoinjs-lib')
module.exports=require("./history.html")({
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
      threshold:0
    }
  },
  store:require("../js/store.js"),
  methods:{
    load(done){
      this.noData=false
      this.error=false
      this.txs=[]
      const cur =currencyList.get(this.currency[this.currencyIndex].coinId)

      Promise.all([cur.getTxs(0,this.to), cur.getTxLabel()]).then(data=>{
        const res=data[0]
        if(!res.totalItems){
          this.noData=true
          typeof(done)==='function'&&done()
        }

        this.hasMore=res.totalItems>res.to
        
        for(let i=0;i<res.items.length;i++){
          const v=res.items[i]
          const txLbl=data[1][v.txid]
          //isIn=I sent
          //!isIn&&isOut=I received
          //!isOut=Mystery
          let aIn=0
          let aOut=0
          let amount=0
          let hasMessage=false,
              direction="",
              message=""
          for(let j=0;j<v.vin.length;j++){
            if(cur.getIndexFromAddress(v.vin[j].addr)){
              aIn+=parseFloat(v.vin[j].value)
            }
          }
          for(let k=0;k<v.vout.length;k++){
            const vo=v.vout[k]
            const spk=vo.scriptPubKey
            if(spk.hex.substr(0,2)==="6a"){
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
      this.to+=20
      this.load()
    },
    outputJson(){
      this.outputDlg=true;
      this.json=JSON.stringify(this.txs)
    },
    pullToLoad(done){
      this.to=20
      this.load(done)
    },
    filter(tx){
      const s = this.sub(tx.aOut,tx.aIn)
      if((this.dirFilter==="send"&&tx.aIn<tx.aOut)||(this.dirFilter==="receive"&&tx.aIn>tx.aOut)
         ||((s>0)?s:-s)<this.threshold){
        return false
      }
      return true
    },
    txDetail(txId){
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
  },
  computed:{
    coinId(){
      return this.currency[this.currencyIndex].coinId
    }
  },
  watch:{
    currencyIndex(){
      this.load()
    }
  }
})



