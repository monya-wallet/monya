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
module.exports=require("../js/lang.js")({ja:require("./ja/editOrder.html"),en:require("./en/editOrder.html")})({
  data:()=>({
    orders:[]
  }),
  mounted(){
    storage.get("orders").then(r=>{
      this.orders=r||[{
        name:"",
        price:0,
        fiat:"jpy"
      }]
    })
  },
  methods:{
    save(){
      storage.set("orders",this.orders)
    },
    add(){
      this.orders.push({
        name:"",
        price:0,
        fiat:"jpy"
      })
    },
    remove(i){

      this.orders.splice(i,1)
    }
  },
  watch:{
    orders(){
      this.save()
    }
  }
})
