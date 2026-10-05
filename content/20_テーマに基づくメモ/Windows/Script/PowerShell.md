---
draft: true
tags:
  - Windows
  - Script
---

# 概要
PowerShellについて学んだことをメモしました。

# 本文
## オブジェクトを出力するコマンドレット

## フィルター、出力のコントロールをするコマンドレット

## リモートマシンを操作するコマンドレット

### WinRMサービス
リモートコマンドを実行するには、サーバークライアント両方でWinRMサービスが実行されている必要があります。
管理者モードで実行します。

- WinRMの状態確認
``` PowerShell
Get-Service WinRM
```
- リモート管理の有効化
WinRMサービスの状態を「自動（自動遅延）」かつ「実行中」にします。
``` PowerShell
Enable-PSRemoting -Force
```
- リモート管理の無効化
``` PowerShell
Disable-PSRemoting -Force
```
- TrustedHostsの設定
ワークグループでリモートコントロールする場合は、NTLM認証出来るようにWinRMの信頼済みホストとしてリモートホストを登録します。
``` PowerShell
Set-Item WSMan:\localhost\Client\TrustedHosts -Value "<リモートホストのIP>" -Force
```

### セッション接続してリモートコマンドを実行する


### 複数のホストを指定してリモートコマンドを実行する


## Windowsの構成を変更するコマンドレット

### DSC


