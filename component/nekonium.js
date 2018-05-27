const bip39 = require("@missmonacoin/bip39-eng")
const coinUtil = require("../js/coinUtil")
const storage = require("../js/storage")
const qrcode = require("qrcode")
const BigNumber = require('bignumber.js');
const axios = require('axios');
const bcLib = require('bitcoinjs-lib')
const Web3 = require('web3')
const Tx = require('ethereumjs-tx')
const hdkey = require('ethereumjs-wallet/hdkey')
const extension=require("../js/extension.js")
const erc20ABI = require("../js/erc20ABI.js")

const NETWORK_NAME="Nekonium"
const NETWORK_SCHEME="nekonium"
const NETWORK_ICON=require("../res/coins/nekonium.png")
const NETWORK_SYMBOL="NUKO"
const HD_DERIVATION_PATH="m/44'/299'/0'/0"
const ADDRESS_INDEX=0
// HD_DERIVATION_PATH
// Testnet = "m/44'/1'/0'/0"
// Ethereum Mainnet = "m/44'/60'/0'/0"
// Ethereum Classic Mainnet = "m/44'/61'/0'/0"
// Nekonium Mainnet = "m/44'/299'/0'/0"
const CHAIN_ID=1
// CHAIN_ID : EIP-155 (Replay Attack Protection)
// Disable (Any Network) = 0
// Ethereum Mainnet = 1
// Ethereum Ropsten = 3
// Ethereum Rinkeby = 4
// Ethereum Classic Mainnet = 61
// Nekonium Mainnet = 1
const RPC_SERVERS=[
  "https://www.nekonium.site:8293/",
  "https://ssl.nekonium.site:8293/"
]

let web3 = new Web3()
let ext

module.exports=require("../js/lang.js")({ja:require("./ja/nekonium.html"),en:require("./en/nekonium.html")})({
  data(){
    return {
      sendAmount:"",
      sendAddress:"",
      sendGasPrice:0,
      sendGasLimit:0,
      password:"",
      address:"",
      qrDataAddress:"",
      qrDataUrl:"",
      shareable:coinUtil.shareable(),
      incorrect:false,
      requirePassword:true,
      loading:false,
      confirm:false,
      price:1,
      serverDlg:false,
      invAmt:"",
      addressFormat:"url",
      sendMenu:false,
      invoiceMenu:false,
      removingToken:-1,
      option:false,

      sendingToken:false,
      
      rpcServer:null,
      wallet:null,
      balanceWei:"",
      signedTxData:null,
      
      networkName:NETWORK_NAME,
      networkScheme:NETWORK_SCHEME,
      networkSymbol:NETWORK_SYMBOL,
      networkIcon:NETWORK_ICON,
      rpcServers:RPC_SERVERS,

      tokenReg:{
        show:false,
        contractAddress:"",
        symbol:"",
        decimal:0
      },
      runContract:{
        show:false,
        abiStr:"",
        fn:"",
        args:[],
        result:"",
        gasLimit:0,
        gasPrice:0
      },

      tokens:[]
    }
  },
  store:require("../js/store.js"),
  methods:{
    decrypt(){
      this.loading=true
      this._decrypt().catch(()=>{
        this.loading=false
        this.incorrect=true
        setTimeout(()=>{
          this.incorrect=false
        },3000)
      })
    },
    _decrypt(){
      if(this.wallet){
        throw new Error("keypair is already decrypted")
      }
      return storage.get("keyPairs").then(c=>{
        let seed=
            bip39.mnemonicToSeed(
              bip39.entropyToMnemonic(
                coinUtil.decrypt(c.entropy,this.password)
              )
            )
        this.wallet=hdkey.fromMasterSeed(seed).derivePath(HD_DERIVATION_PATH).deriveChild(ADDRESS_INDEX).getWallet()
        this.address=this.wallet.getChecksumAddressString()
        this.loading=false
        this.requirePassword=false
        this.getBalance()
        this.getQrCode()
        this.getQrCodeAddress()
        if(this.sendAddress){
          this.sendMenu=true
        }
      })
    },
    getBalance(){
      if(!this.address){
        return
      }
      this.loading=true
      this.tokens=[]
      web3.eth.getBalance(this.address).then(balanceWei=>{
        this.loading=false
        this.balanceWei=balanceWei
        return web3.eth.getGasPrice()
      }).then(gasPrice=>{
        this.sendGasPrice=web3.utils.fromWei(gasPrice,"gwei")
        return ext.get("tokens")
      }).then(tokens=>{
        if(!tokens){return []}
        
        return Promise.all(tokens.map(t=>{
          this.tokens.push(t)
          return (new web3.eth.Contract(erc20ABI,t.contractAddress))
            .methods.balanceOf(this.address)
            .call()
        }))
        
      }).then(balances=>{
        for (let i = 0; i < balances.length; i++) {
          this.$set(this.tokens[i],"balance",+(new BigNumber(balances[i])).shift(-this.tokens[i].decimal))
        }
      }).catch(e=>{
        this.loading=false
        this.$store.commit("setError","Server Error: "+e.message)
      })
    },
    copyAddress(){
      coinUtil.copy(this.address)
    },
    share(event){
      const targetRect = event.target.getBoundingClientRect(),
            targetBounds = targetRect.left + ',' + targetRect.top + ',' + targetRect.width + ',' + targetRect.height;
      coinUtil.share({
        url:this.url
      },targetBounds).then(()=>{
      }).catch(()=>{
        this.copyAddress()
      })
    },
    send(){
      const sendGasPriceWei = web3.utils.toWei(""+this.sendGasPrice, "gwei")
      
      this.sendMenu=false
      this.confirm=false
      this.loading=true
      let addrProm;
      // NekoniumにENSはないので
      addrProm=Promise.resolve(this.sendAddress)
      addrProm.then(addr=>{
        return web3.eth.getTransactionCount(this.address)
      }).then(nonce => {
        let data;
        let rawTx;
        if(this.sendingToken){
          const contract =new web3.eth.Contract(erc20ABI,this.sendingToken.contractAddress,{
            from:this.address
          })
          rawTx = {
            from:this.address,
            nonce: web3.utils.numberToHex(nonce),
            gasPrice: web3.utils.numberToHex(sendGasPriceWei),
            gasLimit: web3.utils.numberToHex(this.sendGasLimit),
            to: this.sendingToken.contractAddress,
            value: "0x0",
            chainId: CHAIN_ID,
            data:contract.methods.transfer(
              this.sendAddress,
              +(new BigNumber(this.sendAmount)).shift(this.sendingToken.decimal)
            ).encodeABI()
          }
        }else{
          rawTx = {
            from:this.address,
            nonce: web3.utils.numberToHex(nonce),
            gasPrice: web3.utils.numberToHex(sendGasPriceWei),
            gasLimit: web3.utils.numberToHex(this.sendGasLimit),
            to: this.sendAddress,
            value: web3.utils.numberToHex(web3.utils.toWei(""+this.sendAmount, "ether")),
            chainId: CHAIN_ID
          }
        }
        const tx = new Tx(rawTx)
        tx.sign(this.wallet.getPrivateKey())
        this.signedTxData="0x"+tx.serialize().toString('hex')
        this.confirm=true
        this.loading=false
      }).catch((e)=>{
        this.loading=false
        this.$store.commit("setError",e.message)
      })
    },
    broadcast(){
      if(!this.signedTxData){
        return
      }
      this.confirm=false
      this.loading=true
      
      web3.eth.sendSignedTransaction(this.signedTxData).on('transactionHash', txhash=>{
        console.log('txhash', txhash)
      }).on('receipt', receipt=>{
        this.sendAddress=""
        this.sendAmount=""
        this.singedTxData=null
        this.loading=false
        this.$store.commit("setFinishNextPage",{page:require("./home.js"),infoId:"sent",payload:{
          txId:""
        }})
        this.$emit("replace",require("./finished.js"))
      }).catch(e=>{
        this.singedTxData=null
        this.loading=false
        this.$store.commit("setError",e.message)
      })
    },
    connect(){
      this.serverDlg=false
      
      this.rpcServer = this.rpcServers[0]
      web3.setProvider(new web3.providers.HttpProvider(this.rpcServer))
    },
    getPrice(){
      this.price=1
    },
    getQrCode(){
      qrcode.toDataURL(this.url,{
        errorCorrectionLevel: 'M',
        type: 'image/png'
      },(err,url)=>{
        this.qrDataUrl=url
      })
    },
    getQrCodeAddress(){
      qrcode.toDataURL(this.address,{
        errorCorrectionLevel: 'M',
        type: 'image/png'
      },(err,url)=>{
        this.qrDataAddress=url
      })
    },
    openExplorer(txId){
      coinUtil.openUrl("http://nekonium.network/tx/"+txId)
    },
    openExplorerAccount(){
      coinUtil.openUrl("http://nekonium.network/account/"+this.address)
    },
    donateMe(){
      coinUtil.openUrl("https://missmonacoin.github.io")
    },
    setRpcServer(){
      web3.setProvider(new web3.providers.HttpProvider(this.rpcServer))
    },
    calcGasLimitFromAddress(){
      if(!web3.utils.isAddress(this.sendAddress)){
        return
      }
      let gasProm
      if(this.sendingToken){
        const contract =new web3.eth.Contract(erc20ABI,this.sendingToken.contractAddress,{
          from:this.address
        })
        gasProm=contract.methods.transfer(this.sendAddress,1).estimateGas()
      }else{
        gasProm=web3.eth.estimateGas({
          from: this.address,
          to: this.sendAddress
        })
      }
      gasProm.then(result => {
        this.sendGasLimit=result
      }).catch(e=>{
        this.$store.commit("setError",e.message)
      })
    },
    intValue(v){
      let iv = parseInt(v)
      return iv <= 0 ? 0 : iv
    },


    registerToken(){
      const contractAddress=this.tokenReg.contractAddress
      const symbol=this.tokenReg.symbol
      const decimal=parseFloat(this.tokenReg.decimal)

      if(!web3.utils.isAddress(contractAddress)||decimal<0||(decimal|0)!==decimal){
        return this.$store.commit("setError","Invalid Parameter")
      }
      
      ext.get("tokens").then(tokens=>{
        if(!tokens){
          tokens=[]
        }
        tokens.push({
          contractAddress,
          symbol,
          decimal
        })
        return ext.set("tokens",tokens)
      }).then(()=>{
        this.tokenReg.show=false
        this.getBalance()
      })
    },
    removeToken(i){
      ext.get("tokens").then(tokens=>{
        if(!tokens){
          tokens=[]
        }
        tokens.splice(i,1)
        return ext.set("tokens",tokens)
      }).then(()=>{
        this.tokenReg.show=false
        this.getBalance()
      })
    },

    cast(val,type){
      switch(type){
        case "bool":
          return !!val
        case "uint":
        case "uint8":
        case "uint16":
        case "uint32":
        case "uint64":
        case "uint128":
        case "uint256":
        case "int":
        case "int8":
        case "int16":
        case "int32":
        case "int64":
        case "int128":
        case "int256":
          return parseInt(val)
        case "address":
          return web3.utils.isAddress(val)?val:""
        case "string":
          return ""+val

        default:
          return val
      }
    },
    runMethod(){

      const method=(new web3.eth.Contract(erc20ABI,this.runContract.contractAddress,{from:this.address}))
            .methods[this.runContract.fn](...this.runContract.args)
      if(this.selectedAbiFn.constant){
        method.call().then(result=>{
          this.runContract.result=result
        }).catch(e=>{
          this.loading=false
          this.$store.commit("setError",e.message)
        })
      }else{
        this.loading=true
        const sendGasPriceWei = web3.utils.toWei(""+this.sendGasPrice, "gwei")
        
        web3.eth.getTransactionCount(this.address).then(nonce => {
          const tx=new Tx({
            from:this.address,
            nonce: web3.utils.numberToHex(nonce),
            gasPrice: web3.utils.numberToHex(sendGasPriceWei),
            gasLimit: web3.utils.numberToHex(this.runContract.gasLimit),
            to: this.runContract.contractAddress,
            value: "0x0",
            chainId: CHAIN_ID,
            data:method.encodeABI()
          })
          tx.sign(this.wallet.getPrivateKey())
          web3.eth.sendSignedTransaction("0x"+tx.serialize().toString('hex')).on('receipt', receipt=>{
            this.runContract.result=JSON.stringify(receipt)
            this.loading=false
          })
        }).catch(e=>{
          this.loading=false
          this.$store.commit("setError",e.message)
        })
      }
    }
  },
  computed:{
    url(){
      this.invAmt=parseFloat(this.invAmt)||0
      switch(this.addressFormat){
        case "url":
        case "monya":
          return coinUtil.getBip21(NETWORK_SCHEME,this.address,{
            amount:parseFloat(this.invAmt),
            label:NETWORK_SYMBOL
          },this.addressFormat==="url")
        default:
          return this.address
      }
    },
    isValidAddress(){
      return web3.utils.isAddress(this.sendAddress)
    },
    balance(){
      return web3.utils.fromWei(this.balanceWei,"ether")
    },
    totalGasPrice(){
      if(this.sendGasPrice > 0 && this.sendGasLimit > 0){
          return web3.utils.fromWei(new web3.utils.BN(web3.utils.toWei(""+this.sendGasPrice, "gwei")).mul(new web3.utils.BN(this.sendGasLimit)), "ether")
      }
      return "";
    },

    abi(){
      try{
        return JSON.parse(this.runContract.abiStr)
      }catch(e){
        return null
      }
    },
    selectedAbiFn(){
      if(!this.abi){return {inputs:[]}}
      for (let i = 0; i < this.abi.length; i++) {
        if(this.abi[i].name===this.runContract.fn){
          return this.abi[i]
        }
      }
      return {inputs:[]}
    }
  },
  watch:{
    invAmt(){
      this.getQrCode()
    },
    addressFormat(){
      this.getQrCode()
    },
    password(){
      this._decrypt().catch(()=>true)
    }
  },
  mounted(){
    const rSend = this.$store.state.extensionSend||{}
    const sa = parseFloat(rSend.amount)||0
    if(rSend.address){
      this.sendAddress=rSend.address
      if(sa){
        this.sendAmount=""+sa
      }
    }

    ext=extension.extStorage(NETWORK_SCHEME)
    
    this.$store.commit("setExtensionSend",{})
    this.connect()
    this.getPrice()
    storage.verifyBiometric().then(pwd=>{
      this.password=pwd
      this.decrypt()
    }).catch(()=>{
      return
    })
  }
})
