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
const bip39 = require("@missmonacoin/bip39-eng")
const storage = require("../js/storage.js")
const coinUtil = require("../js/coinUtil.js")
module.exports=require("../js/lang.js")({ja:require("./ja/showPassphrase.html"),en:require("./en/showPassphrase.html")})({
  data(){
    return {
      keyArray:null,
      words:[],
      password:"",
      requirePassword:false,
      showNext:true,
      incorrect:false,
      data:null
    }
  },
  store:require("../js/store.js"),
  methods:{
    next(){
      this.$emit("push",require("./setPassword.js"))
    },
    render(entropy){
      this.words=bip39.entropyToMnemonic(entropy).split(" ");
    },
    decrypt(){
      storage.get("keyPairs").then((cipher)=>{
        this.render(
          coinUtil.decrypt(cipher.entropy,this.password)
        )
        this.requirePassword=false
        this.password=""
      }).catch(()=>{
        this.incorrect=true
        setTimeout(()=>{
          this.incorrect=false
        },3000)
      })
    }
  },
  computed:{
    serializedData(){
      return JSON.stringify(this.data)
    }
  },
  mounted(){
    if(this.$store.state.entropy){
      this.render(this.$store.state.entropy)
    }else{
      this.requirePassword=true
      this.showNext=false
      
    }
    
  }
})
