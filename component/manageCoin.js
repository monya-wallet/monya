const currencyList = require("../js/currencyList")
const coinUtil = require("../js/coinUtil")
module.exports=require("./manageCoin.html")({
  data:()=>({
    usable:[],
    unusable:[],
    loading:false
  }),
  methods:{
    push(){
      this.$emit("push",require("./send.js"))
    },
    load(){
      this.curs=[]
      this.fiatConv=0
      this.loading=true;
      currencyList.each(cur=>{
        this.loading=true;
        const data={
          coinId:cur.coinId,
          screenName:cur.coinScreenName,
          icon:cur.icon
        }
        if(cur.hdPubNode){
          this.usable.push(data)
        }else{
          this.unusable.push(data)
        }
        this.loading=false
        
      })
    }
  },
  store:require("../js/store.js"),
  mounted(){
    this.$nextTick(this.load)
  }
});
