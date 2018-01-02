const QRScanner = window.QRScanner
const coinUtil=require("../js/coinUtil")
module.exports=require("./qrcode.html")({
  data:()=>({
    cameras:[],
    loading:false,
    error:false,
    scanner:null,
    cameraIndex:0
  }),
  store:require("../js/store.js"),
  methods:{
    back(){
      QRScanner.destroy((status)=>{
        this.$emit("pop")
        this.$store.commit("setTransparency",false)
      });
      
      
    },
    settings(){
      QRScanner.openSettings();
    },
    parse(content){
      coinUtil.parseUrl(content).then(res=>{
        if(res.isCoinAddress&&res.isPrefixOk&&res.isValidAddress){
          this.$store.commit("setSendUrl",res.url)
          QRScanner.destroy((status)=>{
            this.$emit("pop")
            this.$store.commit("setTransparency",false)
            this.$emit("push",require("./send.js"))
          });
          
        }else if(res.protocol==="http"||res.protocol==="https"){
          window.open(res.url,this.$store.state.openInAppBrowser?"_blank":"_system")
        }else{
          this.$ons.notification.alert(res.url)
        }
      })
    },
    show(){

    },
    hide(){
      
    }
  },
  mounted(){
    this.$store.commit("setTransparency",true)
    QRScanner.prepare((err, status)=>{
      if (err) {
        this.$ons.notification.alert("error"+(err&&err.code))
      }
      if (status.authorized) {
        QRScanner.scan((err2,t)=>{
          if (err2) {
            if(err2.code===6){return }
            this.$ons.notification.alert("error code:"+err2.code)
            return
          }
          QRScanner.destroy()
          this.parse(t)
        })
        QRScanner.show()
      } else if (status.denied) {
        this.$ons.notification.alert("Please allow Camera")
      } else {
        this.back()
      }
    })
    
    
  }
})
