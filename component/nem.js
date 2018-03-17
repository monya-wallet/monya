const bip39 = require("bip39")
const coinUtil = require("../js/coinUtil")
const storage = require("../js/storage")
const nemLib = require("nem-library")
const qrcode = require("qrcode")
const BigNumber = require('bignumber.js');
const axios = require('axios');

nemLib.NEMLibrary.bootstrap(nemLib.NetworkTypes.MAIN_NET);
const accountHttp = new nemLib.AccountHttp();
const mosaicHttp=new nemLib.MosaicHttp()
const transactionHttp=new nemLib.TransactionHttp()

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
      server:'',
      confirm:false,
      price:1,
      serverDlg:false,
      invAmt:"",
      account:null,
      accountInfo:null,
      mosaics:null,
      histPageable:null,
      unconfirmed:null
    }
  },
  store:require("../js/store.js"),
  methods:{
    decrypt(){
      this.loading=true
      storage.get("keyPairs").then(c=>{
        this.account=nemLib.Account.createWithPrivateKey(coinUtil.decrypt(c.entropy,this.password))
        this.address =this.account.address.value
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
      accountHttp.getFromPublicKey(this.account.publicKey).subscribe(b=>{
        this.loading=false
        this.accountInfo=b
      },e=>{
        this.loading=false
        this.$store.commit("setError",e.message)
      })
      accountHttp.getMosaicOwnedByAddress(this.account.address).toPromise().then(b=>{
        this.loading=false
        return Promise.all(b.map(mos=>{
          if(mos.mosaicId.namespaceId==="nem"){
            return Promise.resolve({properties:new nemLib.MosaicProperties(6, 8999999999, true, false),quantity:mos.quantity,mosaicId:mos.mosaicId,normalizedQty:(new BigNumber(mos.quantity)).shift(-6).toNumber()})
          }
          return mosaicHttp.getMosaicDefinition(mos.mosaicId).toPromise().then(def=>{
            return {properties:def.properties,quantity:mos.quantity,mosaicId:mos.mosaicId,normalizedQty:(new BigNumber(mos.quantity)).shift(-def.properties.divisibility).toNumber()}
          })
        }))
      }).then(res=>{
        this.mosaics=res
      }).catch(e=>{
        this.loading=false
        this.$store.commit("setError",e.message)
      })
      this.histPageable = accountHttp.allTransactionsPaginated(this.account.address);

      this.histPageable.subscribe(txs => {
        this.history=txs
      });
      accountHttp.unconfirmedTransactions(this.account.address)
        .subscribe(x => {
          this.unconfirmed=x;
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
        if(this.mosaics[i].mosaicId.description()===this.sendMosaic){
          mosToSend=this.mosaics[i]
          break;
        }
      }
      if(!mosToSend){
        this.$store.commit("setError","You don't have this mosaic")
        return 
        
      }
      (
        (mosToSend.mosaicId.namespaceId==="nem")
          ?Promise.resolve(new nemLib.XEM(parseFloat(this.sendAmount)))
          :mosaicHttp.getMosaicTransferableWithAmount(mosToSend.mosaicId.namespaceId,mosToSend.mosaicId.mosaic,parseFloat(this.sendAmount)).toPromise()
      ).then(txMos=>{
        const transferTransaction = nemLib.TransferTransaction.create(
          nemLib.TimeWindow.createWithDeadline(),
          new nemLib.Address(this.sendAddress),
          txMos,
          nemLib.PlainMessage.create(this.message)
        );
        const signedTransaction = this.account.signTransaction(transferTransaction)
        return transactionHttp.announceTransaction(signedTransaction).toPromise()
      }).then(m=>{
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
        this.$store.commit("setError",e.message)
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
    donateMe(){
      location.href="https://missmonacoin.github.io"
    }
  },
  computed:{
    url(){
      return `https://monya-wallet.github.io/monya/a/?amount=${parseFloat(this.invAmt)||0}&address=${this.address}&scheme=nem`
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
    }
  },
  mounted(){
    const rSend = this.$store.state.nemSend||{}
    const sa = parseFloat(rSend.amount)||0
    if(rSend.address){
      this.sendAddress=rSend.address
      if(sa){
        this.sendAmount=sa
        this.confirm=true
      }
    }
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
