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
module.exports=require("../js/lang.js")({ja:require("./ja/generateKeyWarn.html"),en:require("./en/generateKeyWarn.html")})({
  data(){
    return {
      check1:false,check2:false,check3:false,
      entropySize:16
    }
  },
  methods:{
    next(){
      this.$store.commit("setEntropySize",this.entropySize)
      this.$emit("push",require("./generateKey.js"))
    }
  }
})
