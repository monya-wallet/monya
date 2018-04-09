# URL API

## 共通

`<scheme>:api_v1_<method>?param=<JSONEncodedParameter>`

- schemeはjs/currencyList.jsで定義されているBIP21のスキーム。任意のスキーマが利用可能
- methodはメソッド名
- JSONEncodedParameterは、JSONエンコードされたパラメータ

ウェブの場合
上記のURLをパーセントエンコードしてpercentEncodedUrlに代入
`https://monya-wallet.github.io/wallet/?url=<percentEncodedUrl>`

## 署名


  * method
      * "signTx"

  * param
      * addrIndex
          * Integer アドレスインデックス m/bip'/coinType'/account'/0/addrIndex
      * coinId
          * String コインID schemeとは無関係。js/currencyList.jsで定義されている
      * complete
          * Boolean trueならば署名不可能にし、ファイナライズを行い、送信ができるようにする
      * neededSig
          * Integer 必要な署名数
      * pubs
          * String[] 公開鍵のHex Stringの配列。neededSigの個数以上の要素が必ず必要
      * unsigned
          * String 未署名TXのHex String
      * callbackURL
          * String このURLに対してPOSTリクエストが送られます。形式は後述。CORS制約により、送信先サーバーのPreflight,CORS関連HTTPヘッダーを適切に扱う必要がある
      * payload
          * String POSTリクエストに含まれる。
  * パスワード
      * 要
  * POSTリクエストの内容
      * payload
          * param.payloadの内容
      * signed
          * 署名済みTXのHex String
  * 例
  `https://monya-wallet.github.io/wallet/?url=monacoin%3Aapi_v1_signTx%3Fparam%3D%7B%22coinId%22%3A%22mona%22%2C%22unsigned%22%3A%220100000001665b89c55b4b133551621bcfc6b3301e7679eab44d4dc79386753b0759a9ac2e0000000000ffffffff0152bf0100000000001976a9149d7e304327c38f1a7038ff60795d5c30ba82896088ac00000000%22%2C%22pubs%22%3A%5B%2202817231bbebfef49d881d1a5ab595debcd178b9ef433bcd465f521eaa80a705f6%22%5D%2C%22addrIndex%22%3A0%2C%22neededSig%22%3A1%2C%22complete%22%3Afalse%2C%22callbackURL%22%3A%22https%3A%2F%2Fwallet.monaparty.me%2F_api%22%2C%22payload%22%3A%22%7B%5C%22token%5C%22%3A%5C%22114514810%5C%22%7D%22%7D`

## Extended mode(iOS)

  * method
      * enableExtendedMode
      * disableExtendedMode
  * param
      * なし
      
Extended modeを有効/無効にします
Extended modeが無効な状態でMWvMbgon623A4Fp6QG9VirhkFezZ3vrajcに1MONA以上、または1EJyNBDW2a3oNoMn3SPg2A9hFNbezGjMSVに1BTC以上送金することでも有効にできます。

## アトミックスワップ 呼出

  * method
      * shareSwapData
  * param
      * component/atomicswap.js strToRecvに準ずる
