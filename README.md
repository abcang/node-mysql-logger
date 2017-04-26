node-mysql-logger
===

[abcang/mysql2-client-general_log](https://github.com/abcang/mysql2-client-general_log)の移植版です。

### インストール
```bash
$ npm i -S abcang/node-mysql-logger
```

そのうち気が向いたらnpmにも登録するかもしれません。

### 使い方

```js
import { createKoa2Middleware } from 'node-mysql-logger';
// koa 1系は createKoaMiddleware を使用

app.use(createKoa2Middleware('/tmp/sql.log'));
```

### 出力されるデータ
リクエストが来るたびに、指定したファイルに以下のようなデータが出力されます。

```
REQUEST	POST	/api/csrf_token	1
SQL	9ms	SELECT `id`, `csrf_token`, `created_at` FROM `tokens` WHERE id = ?	[50012]	step (/app/app.js:41:191) <- selectOne (/app/app.js:68:7) <- step (/app/app.js:41:191)
```

* REQUEST	[メソッド]	[パス]	[実行されたSQL文の数]
  * 飛んできたリクエスト
  * それぞれタブ区切りになっている
  * リクエストだけ抽出
    * `cat /tmp/sql.log  | sed '/^REQUEST/!d'`
  * 発行クエリの多い順に並び替え
    * `cat /tmp/sql.log  | sed '/^REQUEST/!d' | sort -nrk4`

* SQL	[SQLの実行時間]	[SQL文]	[渡された値の配列]	[スタックトレース]
  * 実行されたSQLの情報
  * スタックトレースは`<-`という文字で区切られている
  * それぞれタブ区切りになっている
  * SQLの行だけ抽出
    * `cat /tmp/sql.log  | sed '/^SQL/!d'`
  * 抽出して速度の遅い順に並び替える
    * `cat /tmp/sql.log  | sed '/^SQL/!d' | sort -nrk2`
