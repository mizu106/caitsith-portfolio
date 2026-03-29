---
tags:
  - OS/Windows
---

# 概要
以前、仕事でWindowsUpdateについて調べたので、その時に使用したサイトなどをメモしました。

# Windows Update関連

## キャッシュの破損で発生するエラーについて

[Windows Update のエラー 0x800736cc の対処方法](https://freesoft.tvbok.com/tips/update_error_code/0x800736cc.html)

## キャッシュ破損をコマンドプロンプトで修理する

[調子が悪くなった Windows Update を コマンドプロンプト で修正する方法 - ぼくんちのTV 別館](https://freesoft.tvbok.com/tips/windows_update/repair_with_cmd.html)

’#操作対象のフォルダ
%systemroot%\SoftwareDistribution
更新プログラムを確認するための署名ファイルが保存されたフォルダ。
%systemroot%\System32\catroot2
Windows Update 構成ファイルが保存されている。過去にダウンロード、もしくは現在ダウンロード中の更新プログラムが保存されたフォルダ。
%ALLUSERSPROFILE%\Microsoft\Network\Downloader\
　└ qmgr0.dat、qmgr1.datファイル

ダウンロード中の更新プログラムを管理しているファイル。

ダウンロードに失敗した更新プログラムが BITS キューから消えずに残ってしまった場合、このファイルの削除が必要です。

## Copilotに作成させた手順書

1.       **Windows Update****トラブルシューティングツールの実行**:

- `Windows``キー + R`を押して、`control`と入力し、Enterキーを押します。
- `トラブルシューティング`をクリックし、左側の`すべて表示`をクリックします。
- `Windows Update`を選択し、トラブルシューティングツールを実行します。

2.       **クリーンブートの実行**:

- `Windows``キー + R`を押して、`msconfig`と入力し、Enterキーを押します。
- `サービス`タブをクリックし、`すべてのMicrosoftサービスを隠す`にチェックを入れ、`すべて無効にする`をクリックします。
- `スタートアップ`タブをクリックし、`タスクマネージャーを開く`をクリックします。
- スタートアップ項目をすべて無効にし、PCを再起動します。

3.       **暗号化サービスの確認**:

- `Windows``キー + R`を押して、`services.msc`と入力し、Enterキーを押します。
- `暗号化サービス`を右クリックし、`プロパティ`を選択します。
- `スタートアップの種類`を`自動`に設定し、`開始`をクリックしてから`適用`をクリックします。

4.       **SFC****スキャンの実行**:

- `Windows``キー + X`を押して、`コマンドプロンプト（管理者）`を選択します。
- `sfc /scannow`と入力し、Enterキーを押します。

5.       **DISM****ツールの実行**:

- `Windows``キー + X`を押して、`コマンドプロンプト（管理者）`を選択します。
- `DISM /Online /Cleanup-Image /RestoreHealth`と入力し、Enterキーを押します。

6.       **Windows Update****のキャッシュクリア**:

- `Windows``キー + X`を押して、`コマンドプロンプト（管理者）`を選択します。
- 以下のコマンドを順に入力し、Enterキーを押します:

```
net stop wuauserv
net stop cryptSvc
net stop bits
net stop msiserver
ren C:\\Windows\\SoftwareDistribution SoftwareDistribution.old
ren C:\\Windows\\System32\\catroot2 catroot2.old
net start wuauserv
net start cryptSvc
net start bits
net start msiserver

```

`net start msiserver`