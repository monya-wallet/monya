# もにゃ

初心者でも簡単に使えるように

* 技術的要素をできるだけ排除し
* 難しい専門用語でなくわかりやすい言葉で
* 暗号通貨を使う上での豆知識の教本として使え
* 上級者でも満足できるように設定でき
* 複数通貨に対応
* Monapartyトークンも扱え
* 業務用モナコイン決済ツールとしても使える

~~ことを目標にした~~モナコイン・Monapartyウォレット(目標を達成しました!)

## プロダクト名
金光碧氏がもにゃもにゃ仰っていたので
[https://twitter.com/KanemitsuMidori/status/914803980856827904](https://twitter.com/KanemitsuMidori/status/914803980856827904)

## アイコン

DMD様
[https://monappy.jp/picture_places/view/20695](https://monappy.jp/picture_places/view/20695)


## ビルド

### 初期設定とアセットビルド

1. `git clone https://github.com/MissMonacoin/monya`
1. `npm install`
1. `npm run build`

`npm run start`で開発用になります。browser-syncあります

### Cordovaビルド

1. `npm install -g cordova@7.1.0` **注意: Cordovaのバージョンは7.1.0です。8.0以上ではありません。**
1. `cd cordovaProj`
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
