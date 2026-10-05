---
title: "Node.js環境のバージョン管理"
draft: true
---


# Node.js環境のバージョン管理
とりあえずnvm使っていたけど、もっと良いのが有るのではないかと思って調べてみました。
いくつか候補が有った中で、Python含めかなりの言語に対応したツールがあるようなので使ってみました。

## mise
Node.js、Python、Ruby、Goなどのバージョン管理が出来るらしい。

- 公式サイト
  [Home | mise-en-place](https://mise.jdx.dev/)
- [Getting Started | mise-en-place](https://mise.jdx.dev/getting-started.html)


## 🔧 Node.js のインストールとバージョン管理
| コマンド                       | 説明                                            |
| -------------------------- | --------------------------------------------- |
| `mise install node`        | デフォルトのバージョン（`.tool-versions` に記載されたもの）をインストール |
| `mise install node@18`     | Node.js のバージョン 18 をインストール                     |
| `mise install`             | `.tool-versions` に基づいて必要なツールをすべてインストール        |
| `mise uninstall node@18`   | 指定バージョンの Node.js をアンインストール                    |
| `mise install node@latest` | 最新の Node.js をインストールする                         |
| `mise install node@lts`    | LTS（Long Term Support）版をインストールする              |

## 📌 バージョンの指定と切り替え
| コマンド                   | 説明                                               |
| ---------------------- | ------------------------------------------------ |
| `mise use -g node@18`  | グローバルで Node.js 18 を使用するよう設定                      |
| `mise use node@20`     | カレントディレクトリで Node.js 20 を使用（`.tool-versions` に記録） |
| `mise use node@lts`    | 最新の LTS バージョンを使用                                 |
| `mise default node@20` | デフォルトで使用するバージョンを設定                               |
| `mise current`         | 現在使用中のバージョンを表示                                   |
| `mise ls node`         | インストール済みの Node.js バージョン一覧を表示                     |
| `mise list`            | インストール済みの Node.js バージョン一覧を表示                     |
| `mise ls-remote node`  | 利用可能な Node.js のバージョン一覧を表示                        |

## 📄 `.tool-versions` ファイルの操作
| コマンド                  | 説明                                            |
| --------------------- | --------------------------------------------- |
| `mise use node@18`    | `.tool-versions` に `node 18` を追加（カレントディレクトリ用） |
| `mise use -g node@18` | グローバルの `.tool-versions` に設定                   |
| `mise env`            | 現在の環境変数を確認（PATH など）                           |

## 🧹 その他便利コマンド
| コマンド                        | 説明                         |
| --------------------------- | -------------------------- |
| `mise which node`           | 実際に使用されている `node` のパスを表示   |
| `mise exec node -- node -v` | 指定バージョンの Node.js でコマンドを実行  |
| `mise outdated`             | アップデート可能なツールの一覧を表示         |
| `mise upgrade`              | すべてのツールをアップグレード            |
| `mise self-update`          | `mise` 自体を最新バージョンにアップデートする |
| `mise -v`                   | `mise` のバージョンを表示する         |

## .tool-versions
`.tool-versions` ファイルを直接編集しても OK！たとえば：
```plain
node 20.11.1
```
と書いておけば、そのディレクトリでは常に Node.js 20.11.1 が使われます。

## miseインストール（Windows）
MicrosoftStoreからダウンロードしてインストールする方法。ターミナルを起動して以下のコマンドを実行する。

```PowerShell
winget install jdx.mise
```

## shimsのパスを通す
普通は通っているのか分からないんだけど、自分の環境では shims（node.jsのバージョンを切り替える為のクラッチのようなファイル）へのPATHが通っていなくて、node -v に失敗した。

### 動かない時は mise doctor
`mise doctor` を実行すると、miseのどこに問題が有るのかチェックしてくれる。
自分の環境では`「mise shims are not on PATHm」` と出ていて、shimsへのPATHが通っていないことが分かった。
なので、環境変数の編集で`mise doctor` で表示された `shims` のPATHを追加した。

