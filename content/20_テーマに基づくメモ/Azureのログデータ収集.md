---
tags:
  - Azure/Monitor
---

### DCRを使ったログの収集

- [【Azure】Log Analyticsを理解する（初級） - APC 技術ブログ](https://techblog.ap-com.co.jp/entry/2025/02/28/103702)
AzurePortalでDCRを作成するときのスクリーンショット付きの解説

- [データ収集ルール作成時のデータ収集エンドポイントの構成について | Japan Azure Monitoring Support Blog](https://jpazmon-integ.github.io/blog/LogAnalytics/DataCollectionEndpoint/)
DCRの宛先に当たるDCE（データ収集エンドポイント）について詳しく解説

#### このステップで処理する
1. データソース
2. 変換（KQR）
3. 出力先

#### 対象リソースとは独立して作成する

#### 作成時に依存するリソース
- データ収集エンドポイント
- リソース（指定しなくても作れる）
- LogAnaliticsワークスペース

#### 作成時のプロパティ
##### 基本タブ

- ルール名
- サブスクリプション
	- リソースグループ
- リージョン
- プラットフォームの種類
	- ◯ Windows
	- ◯ Linux
	- ◯ All
- データ収集エンドポイント（必須）

##### リソースタブ

- ＋リソース追加
- ＋エンドポイントの作成
- □データ収集エンドポイントを有効にする

##### 収集と配信タブ

- ＋データソースの追加
	- パフォーマンスカウンター
	- Windowsイベントログ
	- IISのログ
	- ファイアウォールのログ
	- カスタムテキストログ
	- カスタムJSONログ
	- Prometheusメトリック
- ターゲット（必須）
	- LogAnaliticsワークスペースのリソース

### AzurePortal以外の作成方法

##### 🧭 DCRの管理方法

DCRは以下の方法で作成・管理できます：
- Azure Portal（GUIで設定可能）    
- Azure CLI（`az monitor data-collection rule` コマンド）    
- ARMテンプレート / Bicep / Terraform（IaCで一括管理）    
- PowerShell（`New-AzDataCollectionRule` コマンド）

##### 🧰 参考：関連リソース

- **Azure Monitor Agent (AMA)** → 実際にデータを収集するエージェント
- **DCR (Data Collection Rule)** → 収集内容の設定  
- **Log Analytics Workspace** → データを保存・分析する場所

### NEXT
#### [[カスタムログ]]

ここまでで、Windowsのイベントログ収集は出来るようになったので、次はLinuxのテキストログを収集する方法を調査していく。
併せて実際のログ収集も試したい。

#### [[プライベートリンク]]

ログの収集が一通り出来たら、次はインターネットを経由しないプライベートリンクを使ったログ収集に挑戦したい。
1. デフォルトルートのインターネット向けの通信を塞いで、ログ収集出来なくなることを確認する。
2. プライベートリンクを設定して再度ログが収集出来るようになることを確認する。

