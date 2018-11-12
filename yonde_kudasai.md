# もにゃ



<p style="text-align:center">
<a href="https://monya-wallet.github.io"><img src="res/monya_icon_round_512.png" alt="Monya"></a>


簡単だけど安全な 暗号通貨ウォレット

</p>


[![GPL License](http://img.shields.io/badge/license-GPL-blue.svg?style=flat)](LICENSE)
[![CircleCI](https://circleci.com/gh/monya-wallet/monya.svg?style=svg)](https://circleci.com/gh/monya-wallet/monya)
[![Monappy](https://img.shields.io/badge/DonateMe-monappy-yellow.svg)](https://monappy.jp/users/send/@miss_monacoin?amount=39&message=%E3%82%82%E3%81%AB%E3%82%83%E3%81%AE%E5%AF%84%E4%BB%98%E3%81%A7%E3%81%99)
[![モナコイン](https://img.shields.io/badge/DonateMe-monacoin-yellow.svg)](https://monya-wallet.github.io/a/?address=MStxnMRVMHH95YPzGeR9pdc3HLrvL6pjSo&scheme=monacoin&message=%E5%AF%84%E4%BB%98%E3%82%92%E3%81%82%E3%82%8A%E3%81%8C%E3%81%A8%E3%81%86%E3%81%94%E3%81%96%E3%81%84%E3%81%BE%E3%81%99&req-opreturn=%E5%AF%84%E4%BB%98%E3%81%A7%E3%81%99)
[![ビットコイン](https://img.shields.io/badge/DonateMe-bitcoin-orange.svg)](https://monya-wallet.github.io/a/?address=1HohzLWyA7L1ifx6hr2Xr5N1sGZrR1ZbMt&scheme=bitcoin&message=%E5%AF%84%E4%BB%98%E3%82%92%E3%81%82%E3%82%8A%E3%81%8C%E3%81%A8%E3%81%86%E3%81%94%E3%81%96%E3%81%84%E3%81%BE%E3%81%99&req-opreturn=%E5%AF%84%E4%BB%98%E3%81%A7%E3%81%99)
[![Tipmonaで投げる](https://img.shields.io/badge/TipMe-%40tipmona-ff69b4.svg)](https://twitter.com/share?text=%40tipmona%20tip%20%40monya_wallet%2039%20%E3%82%82%E3%81%AB%E3%82%83%E3%81%AE%E5%AF%84%E4%BB%98%E3%81%A7%E3%81%99)

## 今すぐもにゃを使う

[公式サイト](https://monya-wallet.github.io)

[ウォレット (安定版)](https://monya-wallet.github.io/wallet)

[開発版](https://monya-wallet.github.io/dev)

## 特徴

  * たくさんの種類の暗号通貨を送受信
  * アトミックスワップ
  * たくさんの端末で動作
  * SegWit(P2SH-P2WPKH) に対応
  * マルチシグ
  * BIP 44/49 HDウォレット
  * BIP39互換
  * 強力なQRコード作成
  * オンチェーンでメッセージのやりとり
  * ポップで使いやすいデザイン
  * AES-256による保護
  * 2重の暗号化 (起動時と秘密鍵を解錠するとき)
  * Counterpartyでデジタルカード
  * 好きなコインを自分で追加できる
  * @名前に送信できる(Counterpartyによる)
  * 高度な拡張性

## プロダクト名
金光碧氏がもにゃもにゃ仰っていたので
[https://twitter.com/KanemitsuMidori/status/914803980856827904](https://twitter.com/KanemitsuMidori/status/914803980856827904)

## アイコン

DMD様
[https://monappy.jp/picture_places/view/20695](https://monappy.jp/picture_places/view/20695)
このアイコンは クリエイティブ・コモンズ 表示 4.0 国際 ライセンスの下に提供されています。

## ビルド

### 必要なもの

* Node.js (v8 or higher)
* Xcode (for iOS Builds)
* Android SDK (for Android Builds)


### 初期設定とアセットビルド

1. `git clone https://github.com/monya-wallet/monya`
1. `npm install`
1. `npm run build`

`npm run build:cordova`でCordova用のビルドを作成します。
`npm run start`で開発用になります。browser-syncあります

### 多言語化

- `gulp addWord`でcomponent/*.htmlの日本語部分を抜き出して、lang/dict.jsonに出力
- `gulp translateEn`で適用
- エラーが起こったら、lang/dict.jsonの内容を`{}`に変更

### Cordovaビルド

事前に`npm run build`でビルドを作成したことを確認してください。

1. `npm install -g cordova@7.1.0` **注意: Cordovaのバージョンは7.1.0です。8.0以上ではありません。**
1. `cd cordovaProj`
1. `npm install`
1. `cordova platform add <platformName>` platformNameは`ios`や`android`など
1. `cordova build <platformName> --release`

### Chrome拡張機能ビルド

1. `npm run build` で`chrome_extension`以下にChrome拡張機能用のディレクトリが生成されます。
1. Google Chromeの拡張機能のページから「拡張機能をパッケージ化」というボタンをクリックし、上記のディレクトリを指定してください。また、既に一度パッケージ化を行っている場合には、前回生成された鍵をここで指定してください。そうでないと、ストアで署名が認識されません。
1. パッケージ化が完了すると、拡張機能の実態である`.crx`ファイルと、初回のみ鍵がダウンロードされます。`.crx`ファイルはストアにアップロードする際に使用し、鍵は大事に保管しておいてください。

## webp作成

git cloneした先のディレクトリ（README.mdがあるディレクトリ）で以下を実行してください。
```
$ cd dist && find assets|sed -e 's/assets\///'|grep -e '\(\.png\|\.jpg\)'|while read a;do cwebp -q 90 -z 9 -mt -af -progress -v assets/$a -o ../chrome_extension/assets-webp/$(echo $a|sed -e 's/\(\.png\|\.jpg\)//').webp;done
```

## Electronビルド

事前に`npm run build`で`electron/src/dist`以下に最新ビルドがコピーされていることを確認してください。

1. `cd electron`
1. `npm install`
1. `npm run dist`

作業が完了すると、`electron/dist`以下にビルド済みパッケージが生成されます。

## License

~~GPLv3~~変更しました

MIT LICENSE

Copyright (c) 2018 monya-wallet zenypota

コインのアイコンはそれぞれのライセンスによってライセンスされます
その他のライセンスは CC-BY によってライセンスされます
