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
const storage = require("../js/storage")
module.exports=require("../js/lang.js")({ja:require("./ja/first.html"),en:require("./en/first.html")})({
  data(){
    return {
      popoverVisible:false,
      popoverTarget:false,
      popoverDirection:"up",
      howTo:false,
      showAlert:false
    }
  },
  methods:{
    start(){
      this.$emit("push",require("./question.js"))
    },
    changeLang(ln){
      storage.changeLang(ln)
    }
  },
  mounted(){
    if(!navigator.standalone&&!window.cordova){
      if(this.$ons.platform.isIOS()){
        this.popoverTarget=document.getElementById("popoverTarget")
        this.popoverDirection="up"
        this.popoverVisible=true
      }
    }else{
      this.popoverTarget=false
      this.popoverVisible=false
    }
    this.$store.commit("setKeyPairsExistence",false)
    this.showAlert=/line/i.test(navigator.userAgent)
  }
})
