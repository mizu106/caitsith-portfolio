---
draft: true
tags:
  - PowerShell
  - Azure
  - Windows
---

# 概要
AzurePowerShell のまとまった情報を読みたくて購入しました。
少々古く（2016年）今から学んでも無駄になる部分があるけれど、AzureをPowerShellで管理するための基本的な考え方が載っている稀な書籍です。

# 本文
## 2章 AzurePowerShell最初の一歩
Azureへの**モジュールインストール**の話から始まる。今は↓にOS毎のインストール方法が書かれているので、公式サイトを読めばよいと思います。
- [Azure PowerShellをインストールする方法 | Microsoft Learn](https://learn.microsoft.com/ja-jp/powershell/azure/install-azure-powershell?view=azps-15.4.0)
**モジュールのアンインストール**
- [Azure PowerShellのアンインストール | Microsoft Learn](https://learn.microsoft.com/ja-jp/powershell/azure/uninstall-az-ps?view=azps-15.4.0)

ここに、**ASM**というAPIの話が登場するけれど、2024年8月に廃止されているので**無視**して良いと思います。
- [Azure Service Manager の廃止 - Azure Resource Manager | Microsoft Learn](https://learn.microsoft.com/ja-jp/azure/azure-resource-manager/management/asm-retirement)
同じく**PowerShell DSC 拡張機能**（WindowsのDSCをAzureに拡張した機能）についても触れているが、こちらも2028年3月に廃止予定です。**無視**して良いと思います。
- [Azure Desired State Configuration 拡張機能ハンドラー - Azure Virtual Machines | Microsoft Learn](https://learn.microsoft.com/ja-jp/azure/virtual-machines/extensions/dsc-windows)
また、この章には**証明書を使った認証方法**が書かれているが、権限が強すぎて危険なので現在使用されていない。これも無視して良いと思います。

[自動化シナリオで非対話形式でAzure PowerShellにサインインする | Microsoft Learn](https://learn.microsoft.com/ja-jp/powershell/azure/authenticate-noninteractive?view=azps-15.4.0#certificate-based-authentication)

## 3章 Azure ストレージの管理と保守
### ストレージアカウントの作成
- [Azure Storage アカウントを作成する - Azure Storage | Microsoft Learn](https://learn.microsoft.com/ja-jp/azure/storage/common/storage-account-create?tabs=azure-powershell)
#### 作成時のオプション
- [New-AzResourceGroup (Az.Resources) | Microsoft Learn](https://learn.microsoft.com/ja-jp/powershell/module/az.resources/new-azresourcegroup?view=azps-15.5.0)
``` powershell
$resourceGroup = "<resource-group>"
$location = "<location>"
New-AzResourceGroup -Name $resourceGroup -Location $location

# ロケーションに代入する値がわからない時
Get-AzLocation | select Location
```
### ストレージアカウントの削除
- [Azure Storage アカウントを作成する - Azure Storage | Microsoft Learn](https://learn.microsoft.com/ja-jp/azure/storage/common/storage-account-create?toc=%2Fazure%2Fstorage%2Fblobs%2Ftoc.json&bc=%2Fazure%2Fstorage%2Fblobs%2Fbreadcrumb%2Ftoc.json&tabs=azure-powershell#delete-a-storage-account)
``` powershell
Remove-AzStorageAccount -Name <storage-account> -ResourceGroupName <resource-group>
```
#### 削除したストレージアカウントは14日以内だと復旧できる場合がある
以下のページを参考にポータルから操作します。
- [削除されたストレージ アカウントを復旧します - Azure Storage | Microsoft Learn](https://learn.microsoft.com/ja-jp/azure/storage/common/storage-account-recover)
### ストレージアカウントの設定変更
- [Set-AzCurrentStorageAccount (Az.Storage) | Microsoft Learn](https://learn.microsoft.com/ja-jp/powershell/module/az.storage/set-azcurrentstorageaccount?view=azps-15.4.0)
- [Set-AzStorageAccount (Az.Storage) | Microsoft Learn](https://learn.microsoft.com/ja-jp/powershell/module/az.storage/set-azstorageaccount?view=azps-15.4.0)
``` powershell
Set-AzCurrentStorageAccount -ResourceGroupName "RG01" -Name "mystorageaccount"
```
### ストレージアカウントの一覧を表示する
- [ストレージ アカウントの構成情報を取得する - Azure Storage | Microsoft Learn](https://learn.microsoft.com/ja-jp/azure/storage/common/storage-account-get-info?toc=%2Fazure%2Fstorage%2Fblobs%2Ftoc.json&bc=%2Fazure%2Fstorage%2Fblobs%2Fbreadcrumb%2Ftoc.json&tabs=powershell)
- [Get-AzStorageAccount (Az.Storage) | Microsoft Learn](https://learn.microsoft.com/ja-jp/powershell/module/az.storage/get-azstorageaccount?view=azps-15.4.0)
``` powershell
# ストレージアカウントの一覧を表示する
Get-AzStorageAccount
# リソースグループ毎のストレージアカウント一覧を表示する
Get-AzStorageAccount -ResourceGroupName "<リソースグループ名>"
```
### カレントストレージアカウントの設定
Azure PowerShellにおける「カレントストレージアカウント」は、ストレージ操作コマンド(Az.Storage)でアカウント名を省略した際に使用される既定のアカウントです。

カレントストレージアカウントの変更
- [Set-AzCurrentStorageAccount (Az.Storage) | Microsoft Learn](https://learn.microsoft.com/ja-jp/powershell/module/az.storage/set-azcurrentstorageaccount?view=azps-15.4.0)
ストレージアカウントを作成する

### Blob ストレージ
細かい違いは置いておいて、コンテナを作らないと使用できません。

Blobの概要
- [BLOB (オブジェクト) ストレージの概要 - Azure Storage | Microsoft Learn](https://learn.microsoft.com/ja-jp/azure/storage/blobs/storage-blobs-introduction)
ストレージアカウントにBlobのコンテナを作る
- [PowerShell から BLOB コンテナーを操作する - Azure Storage | Microsoft Learn](https://learn.microsoft.com/ja-jp/azure/storage/blobs/blob-containers-powershell)
#### ページBlobについて
- [Azure ページ BLOB の概要 | Microsoft Learn](https://learn.microsoft.com/ja-jp/azure/storage/blobs/storage-blob-pageblob-overview)



## 参考資料
Microsoft Azure 自習書 - 仮想マシンの作成と操作
- [Download Microsoft Azure 自習書 - 仮想マシンの作成と操作 from Official Microsoft Download Center](https://www.microsoft.com/ja-jp/download/details.aspx?id=49503)
Microsoft Azure 自習書一式
- [Download Microsoft Azure 自習書一式 from Official Microsoft Download Center](https://www.microsoft.com/ja-jp/download/details.aspx?id=43120)
