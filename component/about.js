module.exports=require("./about.html")({
  data(){
    return {

    }
  },
  store:require("../js/store.js"),
  methods:{
    donateMe(){
      this.$store.commit("setSendUrl","monacoin:MKSunF7Lw6Dwn1YVWKoGjD7gLXQzYWVtRP?message=%E5%AF%84%E4%BB%98%E3%82%92%E3%81%82%E3%82%8A%E3%81%8C%E3%81%A8%E3%81%86%E3%81%94%E3%81%96%E3%81%84%E3%81%BE%E3%81%99&req-opreturn=%E5%AF%84%E4%BB%98%E3%81%A7%E3%81%99")
      this.$emit("push",require("./send.js"))
    },
    donateMeWithMonappy(){
      window.open("https://monappy.jp/users/send/@miss_monacoin?amount=39&message=%E3%82%82%E3%81%AB%E3%82%83%E3%81%AE%E5%AF%84%E4%BB%98%E3%81%A7%E3%81%99",this.$store.state.openInAppBrowser?"_blank":"_system")
    },
    donateMeWithTwitter(){
      window.open("https://twitter.com/share?text=%40tipmona%20tip%20%40monya_wallet%2039%20%E3%82%82%E3%81%AB%E3%82%83%E3%81%AE%E5%AF%84%E4%BB%98%E3%81%A7%E3%81%99",this.$store.state.openInAppBrowser?"_blank":"_system")
    },
    goToTwitter(id){
      window.open("https://twitter.com/"+id,this.$store.state.openInAppBrowser?"_blank":"_system")
    },
    openLink(url){
       window.open(url,this.$store.state.openInAppBrowser?"_blank":"_system")
    }
  },
  mounted(){
    
  }
})
