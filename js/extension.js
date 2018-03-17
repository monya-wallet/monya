const extensions={
  xrp:{
    id:"xrp",
    name:"Ripple",
    component:require("../component/xrp.js"),
    icon:null,
    variables:[{
      name:"address"
    }]
  },
  nem:{
    id:"nem",
    name:"NEM",
    component:require("../component/nem.js"),
    icon:null,
    variables:[{
      name:"address"
    }]
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
