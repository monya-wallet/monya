# もにゃ のフレーバーの作り方

1. js/currencyList.jsを編集して通貨を追加、編集、削除
2. lang/template.jsonとscss/param.jsonを編集
3. `$ gulp addWord`を実行(失敗したら、dict.json(dict_en.jsonだったかもしれん)を新規作成し、中身を"{}"にする)
4. lang/dict.jsonを編集
5. `$ gulp prod`を編集

## 公開する際の条件・禁止事項

- アイコンを必ず、originalのもにゃと区別がつくようにすること
- AppNameはもにゃと区別がつくように変更すること。(例: もにゃ(missmonacoin ver))
- FlavorNameは必ず変更すること。作者の名前が望ましい
- GNU GPL v3に従うこと

なお、この禁止事項は、実行可能な形式で公開された場合にのみ適用される。
dist.jsを生成しただけでは適用されないが、それが

- github.ioなどでホスティングされる
- アプリケーションとして公開される
- その他比較的簡単に実行可能な形式として公開される

場合、上記の事項に従う必要がある。
