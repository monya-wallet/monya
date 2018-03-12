const bip39 = require("bip39")
const coinUtil = require("../js/coinUtil")
const storage = require("../js/storage")
const bcLib = require('bitcoinjs-lib')
const rbs58c = require("ripple-bs58check")
const qrcode = require("qrcode")

module.exports=require("../js/lang.js")({ja:require("./ja/xrp.html"),en:require("./en/xrp.html")})({
  data(){
    return {
      sendAmount:0,
      sendAddress:"",
      fiatConv:0,
      password:"",
      address:"",
      qrDataUrl:"",
      shareable:coinUtil.shareable()
    }
  },
  methods:{
    decrypt(){
      storage.get("keyPairs").then(c=>{
        const seed=
              bip39.mnemonicToSeed(
                bip39.entropyToMnemonic(
                  coinUtil.decrypt(c.entropy,this.password)
                )
              )
        const node=bcLib.HDNode.fromSeedBuffer(seed)
        const xrpNode=node.derivePath("m/44'/144'/0'/0/0")
        const hash= bcLib.crypto.hash160(xrpNode.keyPair.getPublicKeyBuffer())
        const payload = Buffer.allocUnsafe(21)
        payload.writeUInt8(0, 0)
        hash.copy(payload, 1)
        this.address = rbs58c.encode(payload)

        qrcode.toDataURL(this.address,{
          errorCorrectionLevel: 'M',
          type: 'image/png'
        },(err,url)=>{
          this.qrDataUrl=url
        })
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
    send(){}
  },
  
  mounted(){
    
  }
})
