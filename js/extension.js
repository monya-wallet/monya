const extensions={
  xrp:{
    id:"xrp",
    name:"Ripple",
    component:require("../component/xrp.js"),
    icon:null,
    scheme:"ripple"
  },
  nem:{
    id:"nem",
    name:"NEM",
    component:require("../component/nem.js"),
    icon:null,
    scheme:"nem"
  }
}
exports.get=extId=>{
  return extensions[extId]
}

exports.each=(fn)=>{
  for(let extName in extensions){
    fn(extensions[extName])
  }
}
