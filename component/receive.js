/*
    Monya - The easiest cryptocurrency wallet
    Copyright (C) 2017-2018 monya-wallet

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
const qrcode = require("qrcode")
const currencyList = require("../js/currencyList")
const storage = require("../js/storage")
const Currency = require("../js/currency")
const coinUtil = require("../js/coinUtil")

module.exports=require("../js/lang.js")({ja:require("./ja/receive.html"),en:require("./en/receive.html")})({
  data(){
    return {
      mainAddress:"",
      qrDataUrl:"",
      currentCurIcon:"",
      shareable:coinUtil.shareable(),
      currency:[],
      currencyIndex:0,
      labels:[coinUtil.DEFAULT_LABEL_NAME],
      dialogVisible:false,
      labelInput:"",
      maxLabel:coinUtil.GAP_LIMIT,
      state:"initial"
    }
  },
  store:require("../js/store.js"),
  methods:{
    getMainAddress(){
      const cur =currencyList.get(this.currency[this.currencyIndex].coinId)
      this.mainAddress=cur.getAddress(0,0)
      qrcode.toDataURL(cur.bip21+":"+this.mainAddress,{
  errorCorrectionLevel: 'M',
  type: 'image/png'
      },(err,url)=>{
        this.qrDataUrl=url
      })

      this.currentCurIcon=cur.icon
    },
    atomicswap(){
      this.$emit("push",require("./atomicswap.js"))
    },
    copyAddress(){
      coinUtil.copy(this.mainAddress)
    },
    getLabels(){
      currencyList.get(this.currency[this.currencyIndex].coinId).getLabels().then(res=>{
        this.$set(this,"labels",res)
      }).catch(e=>{
        this.$store.commit("setError",e.message)
      })
    },
    qr(){
      this.$emit("push",require("./qrcode.js"))
    },
    createLabel(){
      if(!this.labelInput){
        return
      }
      this.dialogVisible=false
      const cId = this.currency[this.currencyIndex].coinId
      const derivation = this.labelInput.split("/")
      if(derivation.length===3&&derivation[0]==="derive"){
        this.showLabel(cId,null,derivation[1]|0,derivation[2]|0)
        this.labelInput=""
      }else{
        currencyList.get(cId).createLabel(this.labelInput).then(()=>{
          this.labelInput=""
          this.getLabels()
        }).catch(e=>{
          this.$store.commit("setError",e.message)
        })
      }
    },
    showLabel(coinId,name,change,index){
      this.$store.commit("setLabelToShow",{coinId,name,index,change})
      this.$emit("push",require("./showLabel.js"))
    },
    createInvoice(){
      this.$emit("push",require("./invoice.js"))
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
    }
  },
  watch:{
    currencyIndex(){
      this.getMainAddress()
      this.getLabels()
    }
  },
  created(){
    currencyList.eachWithPub(cur=>{
      this.currency.push({
        coinId:cur.coinId,
        icon:cur.icon,
        name:cur.coinScreenName
      })
    })
    this.getMainAddress()
    this.getLabels()
  }
})
