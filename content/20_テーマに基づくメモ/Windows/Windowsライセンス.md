---
tags:
  - Windows
  - プロダクトキー
---

# 概要
こちらの記事「[【備忘録】ミニPCを買ったらやること！クリーンインストールの手順などまとめ](https://hobbyjinsei.com/blog081/)」を読んで、自分のミニPCでもクリーンインストール出来るのか気になって調べたときのメモです。
ライセンスの種類が記事に書かれていたものと異なったので、調査してメモしました。

# 本文
## ミニPC買ったのでプロダクトコード調べてみた
Amazonで2.5万くらいのミニPCを購入したので、お約束のライセンス確認をやってみた。

### ライセンスの種類
まずはslmgrコマンドを使用

#### ライセンスの簡易情報（チャネルなど）を表示
- slmgr /dli
	- **Retail channel** → リテール版（パッケージ / デジタルライセンス） 
	- **OEM_DM channel** → OEM 版（メーカーPCにプリインストール）
	- **Volume_MAK channel** → ボリュームライセンス（MAK）
	- **Volume_KMSClient channel** → ボリュームライセンス（KMS クライアント）

#### 詳細情報（KMS の状態、認証期限など）を表示
- slmgr /dlv
	- **ライセンスの説明（Description）**
	- **ライセンス種別（Retail / OEM / Volume）**
	- **KMS サーバー情報（KMS の場合）**

#### 本来の役割り
- ライセンス情報の確認
	- `slmgr /dli` → ライセンスの簡易情報（チャネルなど）を表示
	- `slmgr /dlv` → 詳細情報（KMS の状態、認証期限など）を表示
- プロダクトキーの操作
	- `slmgr /ipk XXXXX-XXXXX-XXXXX-XXXXX-XXXXX` → プロダクトキーのインストール
	- `slmgr /upk` → プロダクトキーのアンインストール
	- `slmgr /cpky` → レジストリからキー情報を削除
- KMS 関連
	- `slmgr /skms kms.example.com` → KMS サーバーの設定
	- `slmgr /ato` → ライセンス認証の実行

### プロダクトコード取り出し
ライセンスの種類が分かったことで、プロダクトキーを取り出せるか検討してみる。
Windows8以降のOSでは、BIOS/UEFI（MSDMテーブル）に格納していることが多い。（特にOEM版）

#### 取り出し方
OEM版などでBIOS/UEFIに保存されていれば、以下のコマンドで取り出せます。

- (Get-CimInstance -ClassName SoftwareLicensingService).OA3xOriginalProductKey

