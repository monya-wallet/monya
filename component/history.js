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
      state:"initial"
    }
  },
  store:require("../js/store.js"),
  methods:{
    load(done){
      this.txs=[]
      const cur =currencyList.get(this.currency[this.currencyIndex].coinId)
      cur.getTxs(0,20).then(res=>{
        for(let i=0;i<res.totalItems;i++){
          const v=res.items[i]
          
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
            txLabel:"",
            
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
        done&&done()
      })
    },
    txDetail(txId){
      this.$store.commit("setTxDetail",{
        txId,coinId:this.coinId
      })
      this.$emit("push",require("./txDetail.js"))
    }
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



