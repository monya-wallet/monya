module.exports={
  coins:{
    mona:{//key = coinId that is lowercase ticker symbol
      coinScreenName:"モナコイン",
      unit:"MONA",
      unitEasy:"モナ",
      bip44CoinType:22,//from slip44
      network:{
        messagePrefix: '\x19Monacoin Signed Message:\n',
        bip32: {
          public: 0x0488b21e,
          
          private: 0x0488ade4
        },
        pubKeyHash: 0x32,
        scriptHash: 0x05,
        wif: 0xb2,
        bech32:"mona"
      }
    },
    zny:{
      coinScreenName:"BitZeny",
      unit:"ZNY",
      unitEasy:"銭",
      bip44CoinType:123,//from slip44
      network:{
        messagePrefix: '\x19BitZeny Signed Message:\n',
        bip32: {
          public: 0x0488b21e,
          
          private: 0x0488ade4
        },
        pubKeyHash: 0x32,
        scriptHash: 0x05,
        wif: 0xb2,
        bech32:"mona"
      }
    }
  }
}
