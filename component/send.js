const coinUtil=require("../js/coinUtil")
const currencyList=require("../js/currencyList")

const SEARCH_DELAY=500

module.exports=require("../js/lang.js")({ja:require("./ja/send.html"),en:require("./en/send.html")})({
  data(){
    return {
      address:"",
      amount:0,
      fiat:0,
      feePerByte:0,
      message:"",
      balance:0,
      price:1,
      coinType:"",
      possibility:[],
      cpTokens:[],
      fiatTicker:this.$store.state.fiat,
      advanced:false,
      label:"",
      messageToShow:"",
      txLabel:"",
      verifyResult:true,
      signature:false,
      utxoStr:"",
      signOnly:false,

      cpSearchWaitHandler:null
    }
  },
  store:require("../js/store.js"),
  methods:{
    confirm(){
      
      this.$store.commit("setConfirmation",{
        address:this.address,
        amount:this.amount,
        fiat:this.fiat,
        feePerByte:this.feePerByte,
        message:this.message,
        coinType:this.coinType,
        txLabel:this.txLabel,
        utxoStr:this.utxoStr,
        signOnly:this.signOnly
      })
      this.$emit("push",require("./confirm.js"))
    },
    getPrice(){
      coinUtil.getPrice(this.coinType,this.fiatTicker).then(res=>{
        this.price=res
        if(this.amount){
          this.calcFiat()
        }else if(this.fiat){
          this.calcCur()
        }
      })
    },
    calcFiat(){
     this.$nextTick(()=> this.fiat=Math.ceil(this.amount*this.price*10000000)/10000000)
    },
    calcCur(){
      this.$nextTick(()=>this.amount=Math.ceil(this.fiat/this.price*10000000)/10000000)
    },
    qr(){
      this.$emit("push",require("./qrcode.js"))
    }
  },
  watch:{
    address(){
      this.$set(this,"possibility",[])
      if(this.address){

        if(this.address[0]==="@"){
          this.cpTokens=[]
          clearTimeout(this.cpSearchWaitHandler)
          this.cpSearchWaitHandler=setTimeout(()=>{
            this.cpSearchWaitHandler=null
            currencyList.eachWithPub((cur)=>{
              if(!cur.counterpartyEndpoint){
                return
              }
              cur.callCP("get_assets_info",{
                assetsList:[this.address.slice(1).toUpperCase()]
              }).then(assets=>{
                if(assets&&assets[0]){
                  this.cpTokens.push({
                    token:assets[0].asset_longname||assets[0].asset,
                    coinId:cur.coinId,
                    coinName:cur.coinScreenName,
                    owner:assets[0].owner
                  })
                }
              })
            })
          },SEARCH_DELAY)
          return
        }
        coinUtil.parseUrl(this.address).then(u=>{
          if(u.isCoinAddress&&u.isValidAddress){
            const cur=currencyList.get(u.coinId)
            this.coinType=u.coinId
            this.possibility.push({
              name:cur.coinScreenName,
              coinId:u.coinId
            })
            this.signature=u.signature
            if(u.signature){
              this.verifyResult=cur.verifyMessage(u.message,u.address,u.signature)
            }
            this.address=u.address
            this.message=u.opReturn
            this.messageToShow=u.message
            this.amount=u.amount
            this.label=u.label
            this.utxoStr=u.utxo
            return
          }else if(u.apiName){
            coinUtil.callAPI(u.apiName,u.apiParam)
            return
          }else{
            currencyList.eachWithPub((cur)=>{
              const ver = coinUtil.getAddrVersion(this.address)
              if(cur.isValidAddress(this.address)){
                this.possibility.push({
                  name:cur.coinScreenName,
                  coinId:cur.coinId
                })
              }
            })
            if(this.possibility[0]){
              this.coinType=this.possibility[0].coinId
            }else{
              this.coinType=""
            }
          }
        })
      }else{
        this.coinType=""
      }
    },
    coinType(){
      if(this.coinType){
        this.getPrice()
        this.feePerByte = currencyList.get(this.coinType).defaultFeeSatPerByte
      }
    }
  },
  computed:{
    remainingBytes(){
      if(this.coinType){
        return currencyList.get(this.coinType).opReturnLength-Buffer.from(this.message||"", 'utf8').length
      }else{return 0}
    },
    sendable(){
      return this.address&&this.coinType&&!isNaN(this.amount*1)&&(this.amount*1)>0&&this.feePerByte>=0&&currencyList.get(this.coinType).isValidAddress(this.address)&&this.remainingBytes>0
    },
    
  },
  mounted(){
    const url=this.$store.state.sendUrl
    if(url){
      this.$nextTick(()=>{
        this.address=url
      })
      this.$store.commit("setSendUrl")
    }
  }
})
