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
const coinUtil = require("../js/coinUtil.js")
module.exports=require("../js/lang.js")({ja:require("./ja/finished.html"),en:require("./en/finished.html")})({
  data(){
    return {
      loading:false
    }
  },
  store:require("../js/store.js"),
  methods:{
    start(){
      this.loading=true
      coinUtil.shortWait().then(()=>{
        this.loading=false
        if(this.$store.state.finishNextPage.page){
          this.$emit("replace",this.$store.state.finishNextPage.page)
        }else{
          this.$emit("pop")
        }
        this.$store.commit("setFinishNextPage",{infoId:"",payload:{}})
      })
      
    }
  },
  computed:{
    infoId(){
      return this.$store.state.finishNextPage?this.$store.state.finishNextPage.infoId:""
    },
    payload(){
      return this.$store.state.finishNextPage.payload
    }
  }
})
