module.exports=require("./customBar.html")({
  data(){
    return {}
  },
  methods:{
    menuOpen(){
      this.$store.commit("openSide",true)
    }
  },
  store:require("../js/store.js"),
  computed:{
    mod(){
      return this.modifier
    }
  },
  props:["title","menu","modifier"]
})
