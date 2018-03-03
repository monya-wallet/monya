# もにゃ

[![GPL License](http://img.shields.io/badge/license-GPL-blue.svg?style=flat)](LICENSE)
[![Monappy](https://img.shields.io/badge/DonateMe-monappy-yellow.svg)](https://monappy.jp/users/send/@miss_monacoin?amount=39&message=%E3%82%82%E3%81%AB%E3%82%83%E3%81%AE%E5%AF%84%E4%BB%98%E3%81%A7%E3%81%99)
[![モナコイン](https://img.shields.io/badge/DonateMe-monacoin-yellow.svg)](https://monya-wallet.github.io/a/?address=MStxnMRVMHH95YPzGeR9pdc3HLrvL6pjSo&scheme=monacoin&message=%E5%AF%84%E4%BB%98%E3%82%92%E3%81%82%E3%82%8A%E3%81%8C%E3%81%A8%E3%81%86%E3%81%94%E3%81%96%E3%81%84%E3%81%BE%E3%81%99&req-opreturn=%E5%AF%84%E4%BB%98%E3%81%A7%E3%81%99)
[![ビットコイン](https://img.shields.io/badge/DonateMe-bitcoin-orange.svg)](https://monya-wallet.github.io/a/?address=1HohzLWyA7L1ifx6hr2Xr5N1sGZrR1ZbMt&scheme=bitcoin&message=%E5%AF%84%E4%BB%98%E3%82%92%E3%81%82%E3%82%8A%E3%81%8C%E3%81%A8%E3%81%86%E3%81%94%E3%81%96%E3%81%84%E3%81%BE%E3%81%99&req-opreturn=%E5%AF%84%E4%BB%98%E3%81%A7%E3%81%99)
[![Tipmonaで投げる](https://img.shields.io/badge/TipMe-%40tipmona-ff69b4.svg)](https://twitter.com/share?text=%40tipmona%20tip%20%40monya_wallet%2039%20%E3%82%82%E3%81%AB%E3%82%83%E3%81%AE%E5%AF%84%E4%BB%98%E3%81%A7%E3%81%99)

初心者でも簡単に使えるように

* 技術的要素をできるだけ排除し
* 難しい専門用語でなくわかりやすい言葉で
* 暗号通貨を使う上での豆知識の教本として使え
* 上級者でも満足できるように設定でき
* 複数通貨に対応
* Counterpartyトークンも扱え
* 業務用モナコイン決済ツールとしても使える

モナコイン・アルトコインウォレット

## プロダクト名
金光碧氏がもにゃもにゃ仰っていたので
[https://twitter.com/KanemitsuMidori/status/914803980856827904](https://twitter.com/KanemitsuMidori/status/914803980856827904)

## アイコン

DMD様
[https://monappy.jp/picture_places/view/20695](https://monappy.jp/picture_places/view/20695)
このアイコンは クリエイティブ・コモンズ 表示 4.0 国際 ライセンスの下に提供されています。

## ビルド

### 初期設定とアセットビルド

1. `git clone https://github.com/MissMonacoin/monya`
1. `npm install`
1. `npm run build`

`npm run start`で開発用になります。browser-syncあります

### Cordovaビルド

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

## License

GPLv3

Copyright (C) 2017 ゆき@モナコインJK
This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details You should have received a copy of the GNU General Public License along with this program.  If not, see <https://www.gnu.org/licenses/>.

その他のライセンスは CC-BY によってライセンスされます
