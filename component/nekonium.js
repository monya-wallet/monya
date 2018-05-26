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
      
      rpcServer:null,
      wallet:null,
      balanceWei:"",
      signedTxData:null,
      
      networkName:NETWORK_NAME,
      networkScheme:NETWORK_SCHEME,
      networkSymbol:NETWORK_SYMBOL,
      networkIcon:NETWORK_ICON,
      rpcServers:RPC_SERVERS
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
      web3.eth.getBalance(this.address).then(balanceWei=>{
        this.loading=false
        this.balanceWei=balanceWei
        return web3.eth.getGasPrice()
      }).then(gasPrice=>{
        this.sendGasPrice=web3.utils.fromWei(gasPrice,"gwei")
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
      let sendAmountWei = web3.utils.toWei(""+this.sendAmount, "ether")
      let sendGasPriceWei = web3.utils.toWei(""+this.sendGasPrice, "gwei")
      //let totalWei = new web3.utils.BN(sendGasPriceWei).mul(new web3.utils.BN(this.sendGasLimit)).add(new web3.utils.BN(sendAmountWei))
      //if(totalWei.gt(new web3.utils.BN(this.balanceWei))){
      //  this.$store.commit("setError", "Insufficient funds")
      //}
      
      this.sendMenu=false
      this.confirm=false
      this.loading=true
      let addrProm;
      // NekoniumにENSはないので
      addrProm=Promise.resolve(this.sendAddress)
      addrProm.then(addr=>{
        this.sendAddress=addr
        return web3.eth.getTransactionCount(this.address)
      }).then(nonce => {
        let rawTx = {
          nonce: web3.utils.numberToHex(nonce),
          gasPrice: web3.utils.numberToHex(sendGasPriceWei),
          gasLimit: web3.utils.numberToHex(this.sendGasLimit),
          to: this.sendAddress,
          value: web3.utils.numberToHex(sendAmountWei),
          chainId: CHAIN_ID
        }
        let tx = new Tx(rawTx)
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
    onChangeAddress(){
      if(!web3.utils.isAddress(this.sendAddress)){
        return
      }
      let param = {
        from: this.address,
        to: this.sendAddress,
        //value: web3.utils.toWei(""+this.sendAmount, "ether")
      }
      web3.eth.estimateGas(param).then(result => {
        this.sendGasLimit=result
      }).catch(e=>{
        this.$store.commit("setError",e.message)
      })
    },
    intValue(v){
      let iv = parseInt(v)
      return iv <= 0 ? 0 : iv
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
