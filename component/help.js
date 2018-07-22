/*
    Monya - The easiest cryptocurrency wallet
    Copyright (C) 2017-2018 MissMonacoin

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
const currencyList = require("../js/currencyList")
const storage = require("../js/storage")
const coinUtil = require("../js/coinUtil")
module.exports=require("../js/lang.js")({ja:require("./ja/help.html"),en:require("./en/help.html")})({
  data(){
    return {
      question:false
    }
  },
  methods:{
    about(){
      this.$emit("push",require("./about.js"))
    },
    openLink(url){
       coinUtil.openUrl(url)
    },
    mineZeny(){
      
    },
    faucet(){
      storage.get("question").then(r=>{
        let question;
        if(r&&r.length){
          question=r.reduce((acc,v)=>{
            if(typeof(v)==="string"){
              acc+="["+v+"]"
            }else if(typeof(v)==="number"&&0<=v&&v<=15){
              acc+=v.toString(16)
            }else if(typeof(v)==="boolean"){
              acc+=v?"Y":"N"
            }else{
              acc+="X"
            }
            return acc
          },"")
        }else{
          question=""
        }
        coinUtil.openUrl(`https://faucetparty.herokuapp.com?question=${encodeURIComponent(question)}&isNative=${!!coinUtil.isCordovaNative()}`)
      })
    }
  },
  mounted(){
    
  }
})
