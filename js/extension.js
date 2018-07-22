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
const storage = require("./storage.js")
const hdkey = require('ethereumjs-wallet/hdkey')
const bip39 = require("@missmonacoin/bip39-eng")
const keypairs=require("ripple-keypairs")

const nem = require("nem-sdk").default

const bcLib = require('bitcoinjs-lib')
const extensions={
  xrp:{
    id:"xrp",
    name:"Ripple",
    component:()=>import("../component/xrp.js"),
    icon:require("../res/coins/xrp.png"),
    scheme:"ripple",
    onAdd:(entropy,extStorage)=>{
      const seed = keypairs.generateSeed({
        entropy:Buffer.from(entropy,"hex")
        })
      const keyPair=keypairs.deriveKeypair(seed)
      const address=keypairs.deriveAddress(keyPair.publicKey)
      return extStorage.set("address",address)
    }
  },
  nem:{
    id:"nem",
    name:"NEM",
    component:()=>import("../component/nem.js"),
    icon:require("../res/coins/nem.png"),
    scheme:"nem",
    onAdd:(entropy,extStorage)=>{
      const seed=
            bip39.mnemonicToSeed(
              bip39.entropyToMnemonic(
                entropy
              )
            )
      const node = bcLib.HDNode.fromSeedBuffer(seed)
            .deriveHardened(44)
            .deriveHardened(43) //nem coin type
            .deriveHardened(0) //default account
      const address=nem.model.address.toAddress(nem.crypto.keyPair.create(node.keyPair.d.toBuffer().toString("hex")).publicKey.toString(),nem.model.network.data.mainnet.id)
      return extStorage.set("address",address)
    }
  },
  ethereum:{
    id:"ethereum",
    name:"Ethereum",
    component:()=>import("../component/ethBase.js").then(c=>c.default({
      networkName:"Ethereum",
      networkScheme:"ethereum",
      networkIcon:require("../res/coins/eth.png"),
      networkSymbol:"ETH",
      bip44DerivationPath:"m/44'/60'/0'/0/0",
      chainId:1,
      rpcServers:[
        "https://mainnet.infura.io/iRUhBHOZ7VZdrEq1yQZd"
      ],
      explorer:"https://etherscan.io/address/"
    })),
    icon:require("../res/coins/eth.png"),
    scheme:"ethereum",
    onAdd(entropy,extStorage){
      const seed=
          bip39.mnemonicToSeed(
            bip39.entropyToMnemonic(
              entropy
            )
          )
      
      const address=hdkey.fromMasterSeed(seed).derivePath("m/44'/60'/0'/0/0").getWallet().getChecksumAddressString()
      return extStorage.set("address",address)
    }
  },
  nekonium:{
    id:"nekonium",
    name:"Nekonium",
    component:()=>import("../component/ethBase.js").then(c=>c.default({
      networkName:"Nekonium",
      networkScheme:"nekonium",
      networkIcon:require("../res/coins/nuko.png"),
      networkSymbol:"NUKO",
      bip44DerivationPath:"m/44'/299'/0'/0/0",
      chainId:1,
      rpcServers:[
        "https://www.nekonium.site:8293/",
        "https://ssl.nekonium.site:8293/"
      ],
      explorer:"http://nekonium.network/account/"
    })),
    icon:require("../res/coins/nuko.png"),
    scheme:"nekonium",
    onAdd(entropy,extStorage){
      const seed=
          bip39.mnemonicToSeed(
            bip39.entropyToMnemonic(
              entropy
            )
          )
      
      const address=hdkey.fromMasterSeed(seed).derivePath("m/44'/299'/0'/0/0").getWallet().getChecksumAddressString()
      return extStorage.set("address",address)
    }
  },
  etherclassic:{
    id:"etherclassic",
    name:"Ethereum Classic",
    component:()=>import("../component/ethBase.js").then(c=>c.default({
      networkName:"Ethereum Classic",
      networkScheme:"etherclassic",
      networkIcon:require("../res/coins/etc.png"),
      networkSymbol:"ETC",
      bip44DerivationPath:"m/44'/61'/0'/0/0",
      chainId:61,
      rpcServers:[
        "https://node.classicexplorer.org",
        "https://mew.epool.io",
        "https://etc-geth.0xinfra.com"
      ],
      explorer:"http://gastracker.io/addr/"
    })),
    icon:require("../res/coins/etc.png"),
    scheme:"etherclassic",
    onAdd(entropy,extStorage){
      const seed=
          bip39.mnemonicToSeed(
            bip39.entropyToMnemonic(
              entropy
            )
          )
      
      const address=hdkey.fromMasterSeed(seed).derivePath("m/44'/61'/0'/0/0").getWallet().getChecksumAddressString()
      return extStorage.set("address",address)
    }
  },
  zaifPay:{
    id:"zaifPay",
    name:"Zaif Payment",
    component:()=>import("../component/zaifPay.js"),
    icon:require("../res/zaifpay.png"),
    scheme:"zaifPay"
  }
}
exports.get=extId=>{
  return extensions[extId]
}

exports.each=(fn)=>{
  for(let extName in extensions){
    if (extensions[extName]&&extensions[extName].id) {
      fn(extensions[extName])
    }
  }
}

exports.extStorage=(extId)=>({
  set:(key,data)=>storage.get("extData").then(d=>{
    if (!d) {
      d={}
    }
    if (!d[extId]) {
      d[extId]={}
    }
    d[extId][key]=data
    storage.set("extData",d)
  }),
  get:key=>storage.get("extData").then(d=>{
    if (!d) {
      return null
    }
    if (!d[extId]) {
      return null
    }
    return d[extId][key]
  })
})
