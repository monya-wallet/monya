module.exports=require("./customBar.html")({
  data(){
    return {}
  },
  methods:{
    menuOpen(){
      this.$parent.$parent.$parent.$parent.$parent.$parent.openSide=true;//助けて
    }
  },
  computed:{
    mod(){
      return this.modifier
    }
  },
  props:["title","menu","modifier"]
})
