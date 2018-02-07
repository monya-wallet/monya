const storage=require("../js/storage")
module.exports=require("./question.html")({
  data(){
    return {
      questionNumber:0,
      questions:qList,
      answers:[]
    }
  },
  methods:{
    answer(ans){
      this.answers[this.questionNumber]=ans.value;
      if(ans.callback){
        ans.callback(function(flag){
          if(flag===true){
            this.questionNumber=ans.to;
          }
        })
        return
      }
      switch(ans.to){
        case -1://User seems to be a great Monacoiner.
        case -2://User declined.Go to key generation
          storage.set("settings",{
            includeUnconfirmedFunds:false,
            zaifPay:{
              enabled:!!this.answers[8],
              apiKey:"",
              secret:""
            },
            useEasyUnit:!!this.answers[7],
            absoluteTime:false,
            fiat:"jpy",
            paySound:false,
            monappy:{
              enabled:false,
              myUserId:""
            },
            monaparty:{
              enabled:true,
              bgClass:"sand"
            }
          })
          this.$emit("push",require("./generateKeyWarn.js"))
          break;
        case -3:
          //User has passphrase so start recover
          this.$emit("push",require("./restorePassphrase.js"))
          break;
        case -4:
          this.questionNumber=1;
          break;
        default:
          this.questionNumber=ans.to|0;
      }
    }
  }
})

const qList=[{"text":"言語を選んでください","answers":[{"label":"日本語","value":"ja","to":-4}]},{"text":"以前にこのアプリケーションを利用したことがありますか？","answers":[{"label":"ないです","value":false,"to":2},{"label":"ありますあります","value":true,"to":-3}]},{"text":"初期設定と、ユーザーの暗号通貨に対する知識を測るためにいくつかの質問に答えてください。","answers":[{"label":"わかりました。","value":true,"to":3},{"label":"自分で設定するので答えません。","value":false,"to":-2}]},{"text":"「モナコイン」といえば","answers":[{"label":"今初めて聞いた","value":0,"to":4},{"label":"モナーから派生したやつ？","value":1,"to":4},{"label":"Twitterで変なひとがくれるやつ？","value":2,"to":4},{"label":"暴騰したと聞きました","value":3,"to":4},{"label":"どんどこわっしょーい","value":4,"to":5},{"label":"脇山珠美ちゃんかわいい！","value":5,"to":6}]},{"text":"「暗号通貨」といえば","answers":[{"label":"今初めて聞いた","value":0,"to":7},{"label":"電子マネー","value":1,"to":7},{"label":"ビットコイン","value":2,"to":5},{"label":"詐欺","value":3,"to":7},{"label":"仮想通貨のこと？","value":4,"to":7},{"label":"海外送金に便利","value":5,"to":5},{"label":"Blockchain","value":6,"to":5}]},{"text":"好きな暗号通貨は?","answers":[{"label":"この中にない","value":"none","to":8},{"label":"モナコイン","value":"mona","to":8},{"label":"ビットコイン","value":"btc","to":8},{"label":"Ethereum","value":"eth","to":8},{"label":"OmiseGo","value":"omg","to":8},{"label":"Ripple","value":"xrp","to":8}]},{"text":"だいたい察した。大丈夫ですね。","answers":[{"label":"次へ","value":1,"to":-1}]},{"text":"暗号通貨とは、「暗号」のトリックを利用し、\n改ざんができない\n・安全\n・国家の支配によらない\n「通貨」すなわちお金です。\nこれは日本円、米ドルなどとは独立し、独自の価値をもちます。\nこのアプリはそのうちの「モナコイン」を送ったり、受け取ったりするアプリです。","answers":[{"label":"わかった","value":"understood","to":8},{"label":"難しいなあ","value":"difficult","to":8}]},{"text":"表示する単位は何にしますか？\n(あとで変更できます。)","answers":[{"label":"MONA,JPYなど通貨コード","value":0,"to":9},{"label":"もにゃ,円など親しみやすい形式","value":1,"to":9}]},{"text":"利用目的はなんですか？","answers":[{"label":"業務用","value":1,"to":10},{"label":"個人用途","value":0,"to":10}]},{"text":"やってもいいことは何？","answers":[{"label":"この中にやってもいいものはない","value":3,"to":12},{"label":"「秘密鍵」画面をスクリーンショット","value":0,"to":11},{"label":"このアプリの初期設定を友達などの他人にやってもらう","value":1,"to":11},{"label":"「秘密鍵」を付箋に書いてデスクに貼っておく","value":1,"to":11},{"label":"パスワードを「123456」を設定する","value":2,"to":11}]},{"text":"それは行ってはいけません！！\n「秘密鍵」というものは、文字通り、秘密にしなければいけない鍵です。\nこの「秘密鍵」は、お金を金庫から取り出す時のように、あなたが持つモナコインを利用するために使う鍵です。\n紛失すると、モナコインを使えなくなり、\n誰かに盗まれたら、その人にモナコインを悪用されます。\nそのために、スクリーンショット、コピー＆貼り付けでデータを保存せず、\n秘密鍵は、自力で紙に手書きして、その紙を、安全な場所に保管してください。\n鍵を保護するためのパスワードも強固なものにしてください。\n手書きと聞いて、面倒臭そうだと思った方もいらっしゃると思いますが、\n簡単にできる工夫がされていますので、ご安心ください。","answers":[{"label":"戻る","value":1,"to":10}]},{"text":"「秘密鍵」というものは、文字通り、秘密にしなければいけない鍵です。\nスクリーンショット、コピー＆貼り付けでデータを保存せず、\n秘密鍵は、自力で紙に手書きして、その紙を、安全な場所に保管してください。\nこれで質問は以上です。","answers":[{"label":"次へ","value":0,"to":-1}]}]
  
