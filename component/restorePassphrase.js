const bip39 = require("bip39")
module.exports=require("./restorePassphrase.html")({
  data(){
    return {
      keyArray:null,
      words:[{
        word:"",
        editing:true
      }],
      suggestion:[],
      noMatch:false,
      deleteFlag:false,
      lastWdCnt:0
    }
  },
  store:require("../js/store.js"),
  methods:{
    next(){
      this.$emit("push",require("./setPassword.js"))
    },
    addWord(){
      this.words.push({
        word:"",
        editing:true
      })
    },
    input(){
      const wd =this.words[this.words.length-1]
      if(this.lastWdCnt<wd.word){
        
        const suggest = this.suggest(wd.word)
        if(suggest.length===1){
          wd.editing=false
          wd.word=suggest[0]
          this.addWord()
          this.noMatch=true;
        }else if(suggest.length===0){
          this.suggestion = suggest;//Is Reactive?
          this.noMatch=true;
        }else{
          this.noMatch=true;
        }
      }
      this.lastWdCnt = wd.word
    },
    remove(i){
      this.words.splice(i,1)
      this.words[this.words.length-1].editing=true
      this.deleteFlag=false
    },
    removeEvt(){
      const index = this.words.length-1
      if(!this.words[index].word&&index!==0){
        if(this.deleteFlag){
          this.delete(index)
        }else{
          this.deleteFlag=true
        }
      }
    },
    suggest(word){
      const ret=[]
      const q=bip39.wordlists.english
      for(let i=0;i<q.length&&ret.length<4;i++){
        if(q[i].startsWith(word)){
          ret.push(q[i])
        }
      }
      console.log(ret)
      return ret
    }
  },
  mounted(){
    
  }
})
