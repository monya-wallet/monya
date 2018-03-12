const bip39 = require("bip39")
const coinUtil = require("../js/coinUtil")
const storage = require("../js/storage")
const bcLib = require('bitcoinjs-lib')
const qrcode = require("qrcode")
const {RippleAPI} = require("ripple-lib")
const keypairs=require("ripple-keypairs")
const BigNumber = require('bignumber.js');

module.exports=require("../js/lang.js")({ja:require("./ja/xrp.html"),en:require("./en/xrp.html")})({
  data(){
    return {
      sendAmount:0,
      sendAddress:"",
      fiatConv:0,
      password:"",
      address:"",
      qrDataUrl:"",
      shareable:coinUtil.shareable(),
      incorrect:false,
      requirePassword:true,
      api:null,
      connected:false,
      loading:false,plzActivate:false,
      balances:null,
      keyPair:null,
      seed:"",
      sent:false,
      histError:false,
      history:null,
      memo:"",
      destTag:0
    }
  },
  methods:{
    decrypt(){
      this.loading=true
      storage.get("keyPairs").then(c=>{
        const seed = keypairs.generateSeed({
          entropy: Buffer.from(coinUtil.decrypt(c.entropy,this.password),"hex")
        })
        this.seed = seed
        const keyPair=keypairs.deriveKeypair(seed)
        this.$set(this,"keyPair",keyPair)
        this.address =keypairs.deriveAddress(keyPair.publicKey)
        this.loading=false
        this.requirePassword=false
        this.getBalance()
        qrcode.toDataURL(this.address,{
          errorCorrectionLevel: 'M',
          type: 'image/png'
        },(err,url)=>{
          this.qrDataUrl=url
        })
      }).catch(()=>{
        this.loading=false
        this.incorrect=true
        setTimeout(()=>{
          this.incorrect=false
        },3000)
      })
    },
    getBalance(){
      if(!this.address||!this.connected){
        return
      }
      this.loading=true
      this.api.getBalances(this.address).then(b=>{
        this.$set(this,"balances",b)
        this.loading=false
        return this.api.getTransactions(this.address,{
          minLedgerVersion:7400000
        })
      }).then(h=>{
        this.$set(this,"history",h)
      }).catch(e=>{
        this.loading=false
        if(e.message==="actNotFound"){
          this.plzActivate =true
          return
        }
        this.histError=true
        this.$store.commit("setError",e.message)
      })
    },
    copyAddress(){
      coinUtil.copy(this.address)
    },
    share(event){
      const targetRect = event.target.getBoundingClientRect(),
            targetBounds = targetRect.left + ',' + targetRect.top + ',' + targetRect.width + ',' + targetRect.height;
      coinUtil.share({
        message:this.mainAddress
      },targetBounds).then(()=>{
      }).catch(()=>{
        this.copyAddress()
      })
    },
    send(){
      this.loading=true
      const sendDrops = Math.floor(parseFloat(this.sendAmount)*1000000)
      const payment = {
        source: {
          address: this.address,
          maxAmount:{
            value: (sendDrops/1000000).toString(),
            currency: 'XRP'
          }
          
        },
        destination: {
          address: this.sendAddress,
          amount: {
            value: (sendDrops/1000000).toString(),
            currency: 'XRP'
          },
          tag:this.destTag|0
        },
        memos:[{data:this.memo}]
      };
      this.api.preparePayment(this.address,payment,{maxLedgerVersionOffset: 5}).then(p=>{
        const signedData = this.api.sign(p.txJSON,this.seed)
        return this.api.submit(signedData.signedTransaction)
      }).then(m=>{
        this.loading=false
        if(m.resultCode==="tesSUCCESS"){
          
          this.sendAddress=""
          this.sendAmount=0
          this.memo=""
          this.destTag=0
          this.sent=true
        }else{
          this.$store.commit("setError",m.resultCode+":"+m.resultMessage)
        }
      }).catch(e=>{
        this.loading=false
        this.$store.commit("setError",e.message)
      })
    }
  },
  
  mounted(){
    this.api=new RippleAPI({server: 'wss://s2.ripple.com:443'})
    this.api.connect().then(()=>{
      this.connected = true
    }).catch(e=>{
      this.loading=false
      
      this.$store.commit("setError",e.message)
      
    })
    this.api.on("error",(code,msg,data)=>{
      this.$store.commit("setError",code+":"+msg)
    })

    storage.verifyBiometric().then(pwd=>{
      this.password=pwd
      this.decrypt()
    }).catch(()=>{
      return true
    })
  }
})
