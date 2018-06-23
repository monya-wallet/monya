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
const storage =require("../js/storage")
const coinUtil = require("../js/coinUtil")
module.exports=require("../js/lang.js")({ja:require("./ja/importExport.html"),en:require("./en/importExport.html")})({
  data:()=>({
    expJson:"",
    impJson:"",
    confirm:false,
    resetDialog:false,
    resetDialogConfirm:false,
    loading:false,
    resetCur:false
  }),
  mounted(){
    storage.getAll().then(r=>{
      this.expJson = JSON.stringify(r)
    })
  },
  methods:{
    save(){
      this.confirm=false
      if(!this.impJson){
        return
      }
      storage.setAll(JSON.parse(this.impJson)).then(()=>{
        window.location.reload()
      })
    },
    reset(){
      storage.erase().then(()=>{
        this.$store.commit("deleteEntropy")
        this.$store.commit("setKeyPairsExistence",false)
        this.$store.commit("setFinishNextPage",{page:require("./first.js"),infoId:"reset"})
        this.$emit("replace",require("./finished.js"))
      })
    },
    resetCoins(){
      this.resetCur=false
      return storage.set("customCoins",[])
        .then(()=>{
          return storage.set("customTitles",[])
        })
        .then(()=>{
        window.location.reload()
      })
    },
    regenerateAddress(){
      this.loading=true
      coinUtil.shortWait()
        .then(()=>storage.set("addresses",{}))
        .then(()=>{
          this.$emit("replace",require("./login.js"))
        }).catch(()=>{
          this.loading=false
        })
    },
    copy(){
      coinUtil.copy(this.expJson)
    }
  }
})
