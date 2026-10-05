---
draft: false
tags:
  - PowerShell
---

# PowerShell 実践システム管理ガイド

## 第4章 PowerShellのリモート機能
### リモートコマンドを使用する準備（WinRM有効化）
リモートコマンドを使用するには、コマンドレットを送る側/受け取る側双方で、winrmサービスが実行されている必要があります。
ここでは、winrmサービスの実行状況確認と、サービス起動方法をまとめます。

- WinRMサービスの実行状態を確認する
``` powershell
Get-Service winrm
```

- WinRMサービスを有効化する
``` powershell
Start-Service -Name WinRM  # WinRMサービスを起動する
Set-Service WinRM -StartupType Automatic      # 自動起動に設定
```

- コマンド受け入れの準備
コマンドレットを受け取る側では、Enable-PSRemotingを実行して受け入れ準備をする必要があります。
``` powershell
Enable-PSRemoting -Force  # 自動
```

- TrustedHosts設定
信頼されているドメイン以外の場所にある場合、送る側でWinRMにTrustedHosts登録する必要があります。
以下の方法で登録します。
``` powershell
Set-Item wsman:\localhost\Client\TrustedHosts -Value "<対象のFQDNやIP>" -Force
```

### Invoke-Command
PowerShellのコマンドレットをリモートで実行する為には、Invoke-Commandを使用します。
対象ホストの指定を単体/複数選べます。
``` powershell
# コンピューターに対してコマンドレットを送る
Invoke-Command -ComputerName $hostname -Credential (Get-Credential) -ScriptBlock { $env:COMPUTERNAME }

# 複数台のコンピューターに対してコマンドレットを送る
Invoke-Command -ComputerName $hostname1, $hostname2 -Credential (Get-Credential) -ScriptBlock { $env:COMPUTERNAME }
```

- Credentialを変数に入れて便利に使う
``` powershell
$cred = Get-Credential
Invoke-Command -ComputerName $hostname -Credential $cred -ScriptBlock { $env:COMPUTERNAME }
```

### セッション型リモートコマンド
#### ローカルで宣言した変数をリモートで使用する
Invoke-Command の { ... }（ScriptBlock）の中身は、**あなたのPCではなくリモート側で実行**されます。だから、ローカルで定義した変数はそのままでは中に届きません。
``` powershell
$name = "Server01"  # ❌ これはリモート側で $name が空になる
Invoke-Command -ComputerName $hostname -ScriptBlock { Write-Output $name }
```

- $using: で解決する
``` powershell
$name = "Server01"  # ✅ ローカルの $name の値がリモートに渡る
Invoke-Command -ComputerName $hostname -ScriptBlock { Write-Output $using:name }
```

- -ArgumentList
※param() で受ける
``` powershell
$name = "Server01"
Invoke-Command -ComputerName $hostname -ScriptBlock {
    param($n)
    Write-Output $n
} -ArgumentList $name
```


- $using と ArgumentList の使い分け

| 方法            | 特徴                | 向いている場面                       |
| ------------- | ----------------- | ----------------------------- |
| $using:変数     | 記述が短い・直感的         | 変数をサッと1〜数個渡したいとき（**基本これでOK**） |
| -ArgumentList | param() で受けるので明示的 | 引数が多い・関数っぽく整理したいとき            |

- 注意点
1. `$using:` は**値のコピー**が渡る（一方通行）、リモート側で値を変えてもローカルには戻らない
2. `$using:` には代入できない
3. ここで使っている `$env:COMPUTERNAME` は `$using:` 不要（リモートの環境変数を使用しているので当たり前）

### 対話型リモートコマンド（Enter-PSSession）
Invoke-Command は「コマンドを投げて結果を受け取る」バッチ型だが、
Enter-PSSession はリモート先に入り込んで対話的に操作するためのコマンドレット。
接続中に打ったコマンドはすべてリモート側で実行される。

- ホスト名/IPを直接指定して入る
``` powershell
Enter-PSSession -ComputerName $hostname -Credential (Get-Credential)
```

- 作成済みセッションに入る（New-PSSessionでセッションを作って接続する）
``` powershell
$session = New-PSSession -ComputerName $ipaddress -Credential (Get-Credential)
Enter-PSSession -Session $session
```

-  リモートから抜けてローカルに戻る
``` powershell
Exit-PSSession   # または exit
```

- セッション破棄
``` powershell
Remove-PSSession $session
```

#### 動作イメージ
- 接続するとプロンプトが PS C:\> のようにリモート名付きに変わる
- 抜けた後の状態
   --ComputerName で直接入った場合：セッションは破棄される
   --Session で入った場合：Exit後もセッションは生き続ける（再度Enter-PSSession可能）


####  使い分け（Invoke-Command と Enter-PSSession）

| 用途                 | コマンドレット                        | 特徴          |
| ------------------ | ------------------------------ | ----------- |
| 一括で処理を投げる／複数台へ同時実行 | Invoke-Command                 | 非対話・スクリプト向き |
| その場で試行錯誤しながら操作する   | Enter-PSSession                | 対話・1台に集中    |
| 変数/関数を定義して連続処理する   | New-PSSession + Invoke-Command | 状態を保持できる    |
