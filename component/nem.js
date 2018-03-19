const bip39 = require("bip39")
const coinUtil = require("../js/coinUtil")
const storage = require("../js/storage")
const nem = require("nem-sdk").default
const qrcode = require("qrcode")
const BigNumber = require('bignumber.js');
const axios = require('axios');
const bcLib = require('bitcoinjs-lib')

const NEM_COIN_TYPE =43
const DEFAULT_ACCOUNT=0
const NETWORK=nem.model.network.data.mainnet.id

const endpoint = nem.model.objects.create("endpoint")("https://shibuya.supernode.me", 7891);

module.exports=require("../js/lang.js")({ja:require("./ja/nem.html"),en:require("./en/nem.html")})({
  data(){
    return {
      sendAmount:0,
      sendAddress:"",
      sendMosaic:"",
      fiatConv:0,
      password:"",
      address:"",
      qrDataUrl:"",
      shareable:coinUtil.shareable(),
      incorrect:false,
      requirePassword:true,
      connected:false,
      loading:false,plzActivate:false,
      balances:null,
      sent:false,
      histError:false,
      history:null,
      message:"",
      server:'https://shibuya.supernode.me:7891/heartbeat',
      confirm:false,
      price:1,
      serverDlg:false,
      invAmt:"",
      account:null,
      accountInfo:null,
      mosaics:null,
      unconfirmed:null,
      addressFormat:"url",

      common:null,
      transactionEntity:{}
    }
  },
  store:require("../js/store.js"),
  methods:{
    decrypt(){
      this.loading=true
      storage.get("keyPairs").then(c=>{
        let seed=
        bip39.mnemonicToSeed(
          bip39.entropyToMnemonic(
            coinUtil.decrypt(c.entropy,this.password)
          )
        )
        const node = bcLib.HDNode.fromSeedBuffer(seed)
                   .deriveHardened(44)
                   .deriveHardened(NEM_COIN_TYPE)
              .deriveHardened(DEFAULT_ACCOUNT)
        this.privateKey=node.keyPair.d.toBuffer().toString("hex")
        this.keyPair=nem.crypto.keyPair.create(this.privateKey)
        this.address =nem.model.address.toAddress(this.keyPair.publicKey.toString(),NETWORK)
        this.loading=false
        this.requirePassword=false
        this.getBalance()
        this.getQrCode()
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
      nem.com.requests.account.data(endpoint,this.address).then(b=>{
        this.loading=false
        this.accountInfo=b
      }).catch(e=>{
        this.loading=false
        this.$store.commit("setError",e.message)
      })
      nem.com.requests.account.mosaics.owned(endpoint,this.address).then(b=>{
        this.loading=false
        return Promise.all(b.data.map(mos=>{
          if(mos.mosaicId.namespaceId==="nem"){
            return Promise.resolve({
              definitions:{
                "creator": "3e82e1c1e4a75adaa3cba8c101c3cd31d9817a2eb966eb3b511fb2ed45b8e262",
                "description": "reserved xem mosaic",
                "id": {
                  "namespaceId": "nem",
                  "name": "xem"
                },
                "properties": [{
                  "name": "divisibility",
                  "value": "6"
                }, {
                  "name": "initialSupply",
                  "value": "8999999999"
                }, {
                  "name": "supplyMutable",
                  "value": "false"
                }, {
                  "name": "transferable",
                  "value": "true"
                }],
                "levy": {}
              },
              quantity:mos.quantity,
              initialSupply:8999999999,
              mosaicId:mos.mosaicId,
              divisibility:6,
              normalizedQty:(new BigNumber(mos.quantity)).shift(-6).toNumber()
            })
          }
          return nem.com.requests.namespace.mosaicDefinitions(endpoint,mos.mosaicId.namespaceId).then(def=>{
            let divisibility=6;
            let initialSupply=0
            for(let i=0;i<def.data.length;i++){
              const mData=def.data[i].mosaic
              if(mData.id.name!==mos.mosaicId.name){
                continue
              }
              const prp=mData.properties
              for(let j=0;j<prp.length;j++){
                if(prp[j].name==="divisibility"){
                  divisibility=prp[j].value|0
                }else if(prp[j].name==="initialSupply"){
                  initialSupply=prp[j].value|0
                }
              }
              return {
                definitions:mData,
                initialSupply,
                divisibility,
                quantity:mos.quantity,
                mosaicId:mos.mosaicId,
                normalizedQty:(new BigNumber(mos.quantity)).shift(-divisibility).toNumber()
              }
            }
          })
        }))
      }).then(res=>{
        this.mosaics=res
      }).catch(e=>{
        this.loading=false
        this.$store.commit("setError",e.message)
      })

      nem.com.requests.account.transactions.all(endpoint,this.address).then(txs => {
        this.history=txs.data
      });
      nem.com.requests.account.transactions.unconfirmed(endpoint,this.address).then(x => {
          this.unconfirmed=x.data;
        });
    },
    copyAddress(){
      coinUtil.copy(this.address)
    },
    share(event){
      const targetRect = event.target.getBoundingClientRect(),
            targetBounds = targetRect.left + ',' + targetRect.top + ',' + targetRect.width + ',' + targetRect.height;
      coinUtil.share({
        url:this.url
      },targetBounds).then(()=>{
      }).catch(()=>{
        this.copyAddress()
      })
    },
    send(){
      this.confirm=false
      this.loading=true
      let mosToSend
      for(let i=0;i<this.mosaics.length;i++){
        const m=this.mosaics[i]
        if(m.mosaicId.namespaceId+":"+m.mosaicId.name===this.sendMosaic){
          mosToSend=m
          break;
        }
      }
      if(!mosToSend){
        this.$store.commit("setError","You don't have this mosaic")
        return 
        
      }
      const sendQty = (new BigNumber(this.sendAmount)).shift(mosToSend.divisibility).toNumber()
      const mosAttach=nem.model.objects.create("mosaicAttachment")(mosToSend.mosaicId.namespaceId,mosToSend.mosaicId.name,sendQty)
      
      const transferTransaction = nem.model.objects.get("transferTransaction")
      transferTransaction.mosaics.push(mosAttach)
      transferTransaction.amount=parseFloat(this.sendAmount)
      transferTransaction.recipient=this.sendAddress
      transferTransaction.message=this.message
      const mosaicDefinitionMetaDataPair = nem.model.objects.get("mosaicDefinitionMetaDataPair")
      mosaicDefinitionMetaDataPair[this.sendMosaic]={mosaicDefinition:mosToSend.definitions,supply:mosToSend.initialSupply}
      const common =this.common= nem.model.objects.get("common")
      common.privateKey=this.privateKey
      let transactionEntity;
      if(this.sendMosaic==="nem:xem"){
        transactionEntity=nem.model.transactions.prepare("transferTransaction")(common, transferTransaction, NETWORK)
      }else{
        transactionEntity = nem.model.transactions.prepare("mosaicTransferTransaction")(common, transferTransaction, mosaicDefinitionMetaDataPair, NETWORK);
      }
      this.transactionEntity=transactionEntity
      this.confirm=true
      this.loading=false
    },
    broadcast(){
      this.confirm=false
      this.loading=true
      nem.model.transactions.send(this.common,this.transactionEntity,endpoint).then(m=>{
        if(m.code>=2){
          throw m.message
        }
        this.loading=false
        this.sendAddress=""
        this.sendAmount=0
        this.message=""
        this.destTag=0
        this.$store.commit("setFinishNextPage",{page:require("./home.js"),infoId:"sent",payload:{
          txId:""
        }})
        this.$emit("replace",require("./finished.js"))
      }).catch(e=>{
        this.loading=false
        this.$store.commit("setError",e.data?e.data.message:e)
      })
    },
    connect(){
      this.serverDlg=false
      
      this.connected=true
    },
    getPrice(){
      axios({
        url:"https://apiv2.bitcoinaverage.com/indices/crypto/ticker/XEMBTC",
        method:"GET"
      }).then(res=>{
        this.price =res.data.last
        return coinUtil.getPrice("btc",this.$store.state.fiat)
      }).then(p=>{
        this.price*=p
      }).catch(()=>{
        this.price=1
      })
    },
    getQrCode(){
      qrcode.toDataURL(this.url,{
        errorCorrectionLevel: 'M',
        type: 'image/png'
      },(err,url)=>{
        this.qrDataUrl=url
      })
    },
    openExplorer(txId){
      coinUtil.openUrl("http://explorer.ournem.com/#/s_tx?hash="+txId)
    },
    donateMe(){
      coinUtil.openUrl("https://missmonacoin.github.io")
    }
  },
  computed:{
    url(){
      this.invAmt=parseFloat(this.invAmt)||0
      switch(this.addressFormat){
        case "url":
          return `https://monya-wallet.github.io/monya/a/?amount=${parseFloat(this.invAmt)||0}&address=${this.address}&label=${this.sendMosaic}&scheme=nem`
        case "monya":
          return `nem:${this.address}?amount=${this.invAmt}&label=${this.sendMosaic}`
        case "nemWallet":
          return `{"v":2,"type":2,"data":{"addr":"${this.address}","amount":${this.invAmt*1e6}}}`
        default:
          return this.address
      }
    },
    isValidAddress(){
      return nem.model.address.isValid(this.sendAddress)
    }
  },
  watch:{
    fiatConv(v){
      this.sendAmount=parseFloat(v)/this.price
    },
    sendAmount(v){
      this.fiatConv=parseFloat(v)*this.price
    },
    invAmt(){
      this.getQrCode()
    },
    sendMosaic(){
      this.getQrCode()
    },
    addressFormat(){
      this.getQrCode()
    }
  },
  mounted(){
    const rSend = this.$store.state.extensionSend||{}
    const sa = parseFloat(rSend.amount)||0
    if(rSend.address){
      this.sendAddress=rSend.address
      this.sendMosaic=rSend.label||"nem:xem"
      if(sa){
        this.sendAmount=sa
        this.confirm=true
      }
    }
    this.$store.commit("setExtensionSend",{})
    this.connect()
    this.getPrice()
    storage.verifyBiometric().then(pwd=>{
      this.password=pwd
      this.decrypt()
    }).catch(()=>{
      return
    })
  },
  filters:{
    hex2str(d){
      return (Buffer.from(d,"hex")).toString("utf8")
    }
  }
})
