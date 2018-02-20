const fs = require("fs")
const isJs = /\.js$/i
fs.readdir("../component",(e,f)=>{
  f.forEach(n=>{
    if(isJs.test(n)){
      fs.readFile("../component/"+n,{
        encoding:"utf8"
      },(e2,d)=>{
        
        d=d.replace(/require\(["']\.\/(.*?)\.html["']\)/,'require("../js/lang.js")({ja:require("./ja/$1.html"),en:require("./en/$1.html")})')
        fs.writeFile("../component/"+n,d,{
          encoding:"utf8"
        },(e3)=>{
          console.log("_wrote ","../component/"+n)
        })
      })
    }
  })
})
