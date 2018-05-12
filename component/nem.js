const bip39 = require("@missmonacoin/bip39-eng")
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

const icons={
  'nem:xem':require("../res/coins/nem.png"),
  'ecobit:eco':require("../res/coins/ecob.png"),
  "lc:jpy":require("../res/coins/lc/jpy.png"),
  "lc:usd":require("../res/coins/lc/usd.png"),
  "lc:zar":require("../res/coins/lc/zar.png"),
  "lc:hkd":require("../res/coins/lc/hkd.png"),
  "lc:eur":require("../res/coins/lc/eur.png"),
  "lc:aud": require("../res/coins/lc/aud.png"),
  "lc:gbp":require("../res/coins/lc/gbp.png"),
  "lc:chf":require("../res/coins/lc/chf.png")
}

let endpoint = nem.model.objects.create("endpoint")("https://shibuya.supernode.me", 7891);


function toUnixDate(d){
  return 1427587585+d
}
function hex2str(s){
  if(!s){return ""}
  return (Buffer.from(s,"hex")).toString("utf8")
}

module.exports=require("../js/lang.js")({ja:require("./ja/nem.html"),en:require("./en/nem.html")})({
  data(){
    return {
      sendAmount:0,
      sendAddress:"",
      sendMosaic:"",
      invMosaic:"",
      fiatConv:0,
      password:"",
      address:"",
      qrDataUrl:"",
      shareable:coinUtil.shareable(),
      incorrect:false,
      requirePassword:true,
      loading:false,
      balances:null,
      history:null,
      message:"",
      server:'shibuya.supernode.me:7891',
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
      this._decrypt().catch(()=>{
        this.loading=false
        this.incorrect=true
        setTimeout(()=>{
          this.incorrect=false
        },3000)
      })
    },
    _decrypt(){
      if(this.keyPair){
        throw new Error("keypair is already decrypted")
      }
      return storage.get("keyPairs").then(c=>{
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
      })
    },
    getBalance(){
      if(!this.address){
        return
      }
      this.loading=true
      nem.com.requests.account.data(endpoint,this.address).then(b=>{
        this.loading=false
        this.accountInfo=b
      }).catch(e=>{
        this.loading=false
        this.$store.commit("setError",e)
      })
      
      const ret = []
      
      Promise.all([
        nem.com.requests.account.mosaics.owned(endpoint,this.address),
        nem.com.requests.account.mosaics.allDefinitions(endpoint, this.address)
      ]).then(result=>{
        
        const supplyProms=[]
        const ownedTokens=result[0].data
        const defs=result[1].data

        for(let i =0;i<ownedTokens.length;i++){
          const token=ownedTokens[i]
          for(let j=0;j<defs.length;j++){
            const def=defs[j]
            if(token.mosaicId.namespaceId!==def.id.namespaceId||token.mosaicId.name!==def.id.name){
              continue;
            }
            let divisibility=6
            const prp=def.properties
            for(let k=0;k<prp.length;k++){
              if(prp[k].name==="divisibility"){
                divisibility=parseInt(prp[k].value)
              }
            }
            ret.push({
              definitions:def,
              supply:null,
              divisibility,
              quantity:token.quantity,
              mosaicId:token.mosaicId,
              normalizedQty:(new BigNumber(token.quantity)).shift(-divisibility).toNumber(),
              icon:icons[token.mosaicId.namespaceId+':'+token.mosaicId.name]
            })
            supplyProms.push(nem.com.requests.mosaic.supply(endpoint,nem.utils.format.mosaicIdToName(token.mosaicId)))
          }
        }
        return Promise.all(supplyProms)
      }).then(supplies=>{
        for(let i=0;i<supplies.length;i++){
          ret[i].supply=supplies[i].supply
        }
        return ret
      }).then(res=>{
        this.mosaics=res
      }).catch(e=>{
        this.loading=false
        this.$store.commit("setError",e)
      })

      nem.com.requests.account.transactions.all(endpoint,this.address).then(txs => {
        this.history=txs.data.map(el=>{
          let tr;
          if(el.transaction.otherTrans){
            tr=el.transaction.otherTrans
          }else{
            tr=el.transaction
          }
          return {
            txHash:el.meta.hash.data,
            recipient:tr.recipient,
            message:hex2str(tr.message.payload),
            timeStamp:toUnixDate(tr.timeStamp)
          }
        })
      });
      nem.com.requests.account.transactions.unconfirmed(endpoint,this.address).then(x => {
        this.unconfirmed=x.data.map(el=>{
          let tr;
          if(el.transaction.otherTrans){
            tr=el.transaction.otherTrans
          }else{
            tr=el.transaction
          }
          return {
            recipient:tr.recipient,
            message:hex2str(tr.message.payload,"hex")
          }
        });
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
      let addrProm;
      if(this.sendAddress[0]==="@"){
        addrProm=nem.com.requests.namespace.info(endpoint,this.sendAddress.slice(1)).then(r=>r.owner).catch(()=>{throw "Namespace not found"})
      }else{
        addrProm=Promise.resolve(this.sendAddress)
      }
      addrProm.then(addr=>{
        this.sendAddress=addr
        let mosToSend
        for(let i=0;i<this.mosaics.length;i++){
          const m=this.mosaics[i]
          if(m.mosaicId.namespaceId+":"+m.mosaicId.name===this.sendMosaic){
            mosToSend=m
            break;
          }
        }
        if(!mosToSend){
          throw "You don't have this mosaic."

        }
        const sendQty = (new BigNumber(this.sendAmount)).shift(mosToSend.divisibility).toNumber()
        const mosAttach=nem.model.objects.create("mosaicAttachment")(mosToSend.mosaicId.namespaceId,mosToSend.mosaicId.name,sendQty)
        
        const transferTransaction = nem.model.objects.get("transferTransaction")
        transferTransaction.mosaics.push(mosAttach)
        
        transferTransaction.recipient=addr
        transferTransaction.message=this.message
        const mosaicDefinitionMetaDataPair = nem.model.objects.get("mosaicDefinitionMetaDataPair")
        mosaicDefinitionMetaDataPair[this.sendMosaic]={mosaicDefinition:mosToSend.definitions,supply:mosToSend.supply}
        const common =this.common= nem.model.objects.get("common")
        common.privateKey=this.privateKey
        let transactionEntity;
        if(this.sendMosaic==="nem:xem"){
          transferTransaction.amount=parseFloat(this.sendAmount)
          transactionEntity=nem.model.transactions.prepare("transferTransaction")(common, transferTransaction, NETWORK)
        }else{
          transferTransaction.amount=1
          transactionEntity = nem.model.transactions.prepare("mosaicTransferTransaction")(common, transferTransaction, mosaicDefinitionMetaDataPair, NETWORK);
          if (Math.floor(transactionEntity.mosaics[0].quantity)!==sendQty) {
            throw "Too small decimals."
          }
        }
        
        this.transactionEntity=transactionEntity
        this.confirm=true
        this.loading=false
      }).catch((e)=>{
        this.loading=false
        this.$store.commit("setError",e)
      })
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
      coinUtil.openUrl("http:///explorer.nemchina.com/#/s_tx?hash="+txId)
    },
    donateMe(){
      coinUtil.openUrl("https://missmonacoin.github.io")
    },
    setServer(){
      
      const spl=this.server.split(":")
      if(!spl[1]){
        this.server="shibuya.supernode.me:7891"
        endpoint=nem.model.objects.create("endpoint")("https://shibuya.supernode.me",7891)
        return
      }
      endpoint=nem.model.objects.create("endpoint")("https://"+spl[0], spl[1]|0)
      
    }
  },
  computed:{
    url(){
      this.invAmt=parseFloat(this.invAmt)||0
      switch(this.addressFormat){
        case "url":
          return `https://monya-wallet.github.io/monya/a/?amount=${parseFloat(this.invAmt)||0}&address=${this.address}&label=${this.invMosaic}&scheme=nem`
        case "monya":
          return `nem:${this.address}?amount=${this.invAmt}&label=${this.invMosaic}`
        case "nemWallet":
          return `{"v":2,"type":2,"data":{"addr":"${this.address}","amount":${this.invAmt*1e6}}}`
        default:
          return this.address
      }
    },
    isValidAddress(){
      if(this.sendAddress[0]==="@"){
        return true
      }else{
        return nem.model.address.isValid(this.sendAddress)
      }
    }
  },
  watch:{
    fiatConv(v){
      if(v){this.sendAmount=parseFloat(v)/this.price}
      else{this.sendAmount=0}
    },
    sendAmount(v){
      this.fiatConv=parseFloat(v)*this.price
    },
    invAmt(){
      this.getQrCode()
    },
    invMosaic(){
      this.getQrCode()
    },
    sendMosaic(){
      this.invMosaic=this.sendMosaic
    },
    addressFormat(){
      this.getQrCode()
    },
    password(){
      this._decrypt().catch(()=>true)
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
    friendlyName(n){
      return {
        "ecobit:eco":"EcoBit",
        "lc:jpy":"円",// LCNEM currency name are recommened to be local notation
        "lc:usd":"Dollar",
        "lc:zar":"South African Dollar",
        "lc:hkd":"Hong Kong Dollar",
        "lc:eur":"Euro",
        "lc:aud":"Australian Dollar",
        "lc:gbp":"Pound sterling",
        "lc:chf":"Schweizer Franken"
      }[n]||n
    }
  }
})
