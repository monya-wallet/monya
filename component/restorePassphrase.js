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
const bip39 = require("@missmonacoin/bip39-eng")
module.exports=require("../js/lang.js")({ja:require("./ja/restorePassphrase.html"),en:require("./en/restorePassphrase.html")})({
  data(){
    return {
      keyArray:null,
      words:[{
        word:""
      }],
      suggestion:[],
      noMatch:false,
      deleteFlag:false,
      lastWdCnt:0,
      error:false

    }
  },
  store:require("../js/store.js"),
  methods:{
    next(){
      try{
        this.remove(this.words.length-1)
        const mnemonic=this.words.reduce((p,v)=>{
          return (p?p+" ":"")+v.word
        },null)
        this.$store.commit("setEntropy",bip39.mnemonicToEntropy(mnemonic))
        this.$emit("push",require("./setPassword.js"))
      }catch(e){
        this.error=true
      }
    },
    addWord(){
      this.words.push({
        word:""
      })
      this.suggestion=[]
    },
    input(){
      const wd =this.words[this.words.length-1]
      if(this.lastWdCnt<wd.word.length){
        this.insert()
      }
      this.lastWdCnt = wd.word.length
    },
    insert(){
      const wd =this.words[this.words.length-1]
      const suggest = this.suggest(wd.word)
      if(suggest.length===1){
        wd.word=suggest[0]
        this.addWord()
        this.noMatch=false;
      }else if(suggest.length===0){
        this.noMatch=true;
      }else{
        this.suggestion = suggest;//Is Reactive?
        this.noMatch=false;
      }
    },
    remove(i){
      if(this.wdLength!==1){
        this.words.splice(i,1)
      }
      this.deleteFlag=false
      this.suggestion=[]
    },
    removeEvt(){
      const index = this.words.length-1
      this.noMatch=false;
      if(!this.words[index].word&&index!==0){
        if(this.deleteFlag){
          this.remove(index)
        }else{
          this.deleteFlag=true
        }
      }
    },
    reset(){
      this.words=[{
        word:""
      }]
    },
    apply(s){
      this.words[this.words.length-1].word=s
      this.addWord()
      this.suggestion=[]
    },
    suggest(word){
      const ret=[]
      const q=bip39.wordlists.english
      for(let i=0;i<q.length&&ret.length<4;i++){
        if(q[i].startsWith(word)){
          ret.push(q[i])
        }
      }
      return ret
    }
  },
  computed:{
    wdLength(){
      return this.words.length
    }
  }
})
