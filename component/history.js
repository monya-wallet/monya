const currencyList = require("../js/currencyList")
const coinUtil = require("../js/coinUtil")
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
      error:false
    }
  },
  store:require("../js/store.js"),
  methods:{
    load(done){
      this.error=false
      this.txs=[]
      const cur =currencyList.get(this.currency[this.currencyIndex].coinId)

      Promise.all([cur.getTxs(0,20), cur.getTxLabel()]).then(data=>{
        const res=data[0]
        for(let i=0;i<res.totalItems;i++){
          const v=res.items[i]
          const txLbl=data[1][v.txid]
          //isIn=I sent
          //!isIn&&isOut=I received
          //!isOut=Mystery
          let aIn=0
          let aOut=0
          let amount=0
          let hasMessage=false
          let direction=""
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
            
            inmatureConfirmation:v.confirmations<cur.confirmations,
            direction,
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
    
    filter(tx){
      if((this.dirFilter==="send"&&tx.aIn<tx.aOut)||(this.dirFilter==="receive"&&tx.aIn>tx.aOut)){
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



