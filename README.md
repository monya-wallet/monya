# もにゃ(Monya)

<p style="text-align:center">


<a href="https://monya-wallet.github.io"><img src="res/monya_icon_round_512.png" alt="Monya"></a>

<br>

Easy but secure Monacoin & Altcoins Wallet

</p>

[![GPL License](http://img.shields.io/badge/license-GPL-blue.svg?style=flat)](LICENSE)
[![CircleCI](https://circleci.com/gh/monya-wallet/monya.svg?style=svg)](https://circleci.com/gh/monya-wallet/monya)
[![Monappy](https://img.shields.io/badge/DonateMe-monappy-yellow.svg)](https://monappy.jp/users/send/@miss_monacoin?amount=39&message=%E3%82%82%E3%81%AB%E3%82%83%E3%81%AE%E5%AF%84%E4%BB%98%E3%81%A7%E3%81%99)
[![モナコイン](https://img.shields.io/badge/DonateMe-monacoin-yellow.svg)](https://monya-wallet.github.io/a/?address=MStxnMRVMHH95YPzGeR9pdc3HLrvL6pjSo&scheme=monacoin&message=%E5%AF%84%E4%BB%98%E3%82%92%E3%81%82%E3%82%8A%E3%81%8C%E3%81%A8%E3%81%86%E3%81%94%E3%81%96%E3%81%84%E3%81%BE%E3%81%99&req-opreturn=%E5%AF%84%E4%BB%98%E3%81%A7%E3%81%99)
[![ビットコイン](https://img.shields.io/badge/DonateMe-bitcoin-orange.svg)](https://monya-wallet.github.io/a/?address=1HohzLWyA7L1ifx6hr2Xr5N1sGZrR1ZbMt&scheme=bitcoin&message=%E5%AF%84%E4%BB%98%E3%82%92%E3%81%82%E3%82%8A%E3%81%8C%E3%81%A8%E3%81%86%E3%81%94%E3%81%96%E3%81%84%E3%81%BE%E3%81%99&req-opreturn=%E5%AF%84%E4%BB%98%E3%81%A7%E3%81%99)
[![Tipmonaで投げる](https://img.shields.io/badge/TipMe-%40tipmona-ff69b4.svg)](https://twitter.com/share?text=%40tipmona%20tip%20%40monya_wallet%2039%20%E3%82%82%E3%81%AB%E3%82%83%E3%81%AE%E5%AF%84%E4%BB%98%E3%81%A7%E3%81%99)

## Use Monya Now

[Official Website](https://monya-wallet.github.io)

[Wallet (Stable)](https://monya-wallet.github.io/wallet)

[Dev Version](https://monya-wallet.github.io/dev)

## Feature

  * Send & Receive many kinds of cryptocurrency
  * Atomic Swap Trading
  * Cross platform
  * SegWit(P2SH-P2WPKH) Supported
  * Multisig Transaction
  * BIP44/49 HD Wallet
  * BIP39 Compatible
  * Powerful QR Code generation
  * On-chain messaging
  * Pop and easy design
  * AES-256 Protection
  * 2-Factor Encryption (On launch and before decrypting private key)
  * QR code reader
  * Digital Cards powered by Counterparty
  * Can add coins you like by yourself
  * Send to @name (powered by Counterparty)
  * Highly Extendable

## Origin of the name "Monya"
Because Kanemitsu Midori, who is CFO of bitFlyer, said Monya
[https://twitter.com/KanemitsuMidori/status/914803980856827904](https://twitter.com/KanemitsuMidori/status/914803980856827904)

## Icon 

Icon was made by DMD.
[https://monappy.jp/picture_places/view/20695](https://monappy.jp/picture_places/view/20695)
This icon is licensed under Creative Commons Attribution 4.0 International License. (CC-BY)

## How to Build

### Prerequisites

* Node.js (v8 or higher)
* Xcode (for iOS Builds)
* Android SDK (for Android Builds)


### Asset Build

1. `git clone https://github.com/monya-wallet/monya`
1. `npm install`
1. `npm run build`

`npm run start` to develop. (with browser-sync auto reload)

### Translation

- `gulp addWord`
- edit `lang/dict.json`
- `gulp translateEn`

If error occurs, re-create lang/dict.json. Contents is `{}`

### Cordova Build

Please build assets `npm run build` in advance

1. `npm install -g cordova@7.1.0` **Caution: Cordova version must be 7.1. 8.0 is not supported.**
1. `cd cordovaProj`
1. `npm install`
1. `cordova platform add <platformName>` platformName will be `ios`, `android`, etc.
1. `cordova build <platformName> --release`

### Chrome Extension Build

1. `npm run build` to make chrome assets under `chrome_extension` 
1. Click "Pack extension" and choose `chrome_extension` in Chrome Extension page. If you have already packaged, choose keys that is generated in the previous time. Otherwise, store can't recognize a signature.
1. After finishing packaging, `.crx` and key will be generated. Please upload `.crx`. Store the key securely.

## webp conversion

run below shellscript on the directory which has README.md
```
$ cd dist && find assets|sed -e 's/assets\///'|grep -e '\(\.png\|\.jpg\)'|while read a;do cwebp -q 90 -z 9 -mt -af -progress -v assets/$a -o ../chrome_extension/assets-webp/$(echo $a|sed -e 's/\(\.png\|\.jpg\)//').webp;done
```

## Electron Build

Please build assets `npm run build` in advance

1. `cd electron`
1. `npm install`
1. `npm run dist`

Package will be output under `electron/dist`

## License

GPLv3

Copyright (C) 2017 ゆき@モナコインJK
This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details You should have received a copy of the GNU General Public License along with this program.  If not, see <https://www.gnu.org/licenses/>.

Icons of coins are licensed under each license.
Other assets like image, sound are licensed under CC-BY
