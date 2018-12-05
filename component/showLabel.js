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
const qrcode = require("qrcode")
const currencyList = require("../js/currencyList")
const storage = require("../js/storage")
const coinUtil = require("../js/coinUtil")
module.exports=require("../js/lang.js")({ja:require("./ja/showLabel.html"),en:require("./en/showLabel.html")})({
  data(){
    return {
      address:"",
      qrDataUrl:"",
      shareable:coinUtil.shareable(),
      label:"",
      edit:false,
      balance:0,
      labelInput:"",
      pubKey:"",

      password:"",
      incorrect:false,
      showPrivKeyDlg:false
    }
  },
  store:require("../js/store.js"),
  methods:{
    copyAddress(){
      coinUtil.copy(this.address)
    },
    update(){
      if(!this.labelInput){
        return
      }
      const p=this.$store.state.showLabelPayload
      currencyList.get(p.coinId).updateLabel(this.label,this.labelInput).then(()=>{
        this.edit=false;
        this.label=p.label=this.labelInput
        this.labelInput=""
        this.$emit("pop")
        this.$store.commit("setLabelToShow",p)
        this.$emit("push",module.exports)
      })
    },
    share(event){
      const targetRect = event.target.getBoundingClientRect(),
            targetBounds = targetRect.left + ',' + targetRect.top + ',' + targetRect.width + ',' + targetRect.height;
      coinUtil.share({
        message:this.address
      },targetBounds).then(()=>{
      }).catch(()=>{
        this.copyAddress()
      })
    },
    async showPrivKey(){
      const p =this.$store.state.showLabelPayload
      const cur=currencyList.get(p.coinId)
      this.showPrivKeyDlg=false
      const cipher=await storage.get("keyPairs")
      this.privKey=cur._getKeyPair(cipher.entropy,this.password,p.change,p.index).toWIF()
      this.password=""
      
    }
  },
  mounted(){
    const p=this.$store.state.showLabelPayload
    const cur =currencyList.get(p.coinId)
    if(cur.bip44){
      this.hdPath="m/44'/"+cur.bip44.coinType+"'/"+cur.bip44.account+"'/"+p.change+"/"+p.index
    }else if(cur.bip49){
      this.hdPath="m/49'/"+cur.bip49.coinType+"'/"+cur.bip49.account+"'/"+p.change+"/"+p.index
    }
    this.label = p.name
    this.labelInput=p.name
    this.address=cur.getAddress(p.change,p.index)
    this.pubKey=cur.getPubKey(p.change,p.index)
    qrcode.toDataURL(cur.bip21+":"+this.address,{
      errorCorrectionLevel: 'M',
      type: 'image/png'
    },(err,url)=>{
      this.qrDataUrl=url
    })

    this.currentCurIcon=cur.icon

    cur.getAddressProp("balance",this.address).then(res=>{
      this.balance=res/100000000
    })
  }
})
