---
draft: true
tags:
  - GEMINI
  - Programming
---

# 概要
GEMINI-CLI は、 npm でインストールするのですが、私の環境では mise を使って node.js をインストールしたので、シンボリックリンクでバージョンを切り替えられるようになっていました。

その影響を受けて、インストールした GEMINI-CLI が起動できないという問題にぶつかったので、メモを残しました。

# 本文
本来のGEMINI-CLIのインストールコマンド。
``` powershell
npm install -g @google/gemini-cli
```
mise を使用している環境で、普通に npm を使用して GEMINI-CLI をインストールすると、 mise が管理するパスを認識できなくて GEMINI-CLIの パスが通らなくなります。

そこで、このように入力することで、「--」行こうのコマンドを、miseが指定したバージョンの node.js で実行することが出来るので、これを利用してインストールします。
``` powershell
mise exec -- <実行したいコマンド>
```

mise 環境の npm で GEMINI-CLI をインストールするには、以下のようにします。
``` powershell
mise exec -- npm install -g @google/gemini-cli
```

