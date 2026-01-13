---
tags:
  - Azure/KQL
---

### AzureMonitorリファレンス

- [Azure Monitor のドキュメント - Azure Monitor | Microsoft Learn](https://learn.microsoft.com/ja-jp/azure/azure-monitor/)
AzureMonitorのドキュメント
- [Azure Monitor データ参照 - Azure Monitor | Microsoft Learn](https://learn.microsoft.com/ja-jp/azure/azure-monitor/reference/)
リファレンスのルート
- [Azure Monitor リソース ログ/ログ分析テーブル - Azure Monitor | Microsoft Learn](https://learn.microsoft.com/ja-jp/azure/azure-monitor/reference/tables-index)
LogAnalyticsのテーブルを解説するブロック
- [Azure Monitor ログのリファレンス - イベント - Azure Monitor | Microsoft Learn](https://learn.microsoft.com/ja-jp/azure/azure-monitor/reference/tables/event)
Windowsイベントログ
- [Azure Monitor ログ リファレンス - SecurityEvent - Azure Monitor | Microsoft Learn](https://learn.microsoft.com/ja-jp/azure/azure-monitor/reference/tables/securityevent)Windowsセキュリティイベントログ
- [[20_テーマに基づくメモ/Azure/Azureのログデータ収集]]
DCRの設定方法（エビデンス）

### イベントログ抽出KQL
Windowsのイベントログを検索して、DescriptionにTLS、EventIDに36874か36870を含んでいるメッセージを抽出する。

Event
| where RenderedDescription contains "TLS"
| where EventID == "36874" or EventID == "355870"
| project TimeGenerated Computer, EventLevelName, Source, EventID, RenderdDescription

### RDPアクセスFlowログ抽出

let startDateTime = datetime("2025/09/01 12:00:00")-9h;
let endDateTime = datetime("2025/09/01 13:00:00")-9h;
AzureNetworkAnalytics_CL
| where DestPort_d == "3389"
| where  DestIP_s contains "10.20.1."
| where not( SrcIP_s startswith("10.20.1."))
| where FlowStartTime_t >= startDateTime
| where FlowStartTIme_t < endDateTime
//脆弱性スキャンサーバーのIP（172.28.10.68)

### NSGフローログを収集してKQLで抽出する方法
NSGフローログを収集してKQLで抽出するには、以下の**2つの主要なステップ**が必要です。
1. **NSGフローログの有効化とストレージへの格納** 
2. **トラフィック分析の有効化とLog Analyticsへの取り込み**

#### 1. ネットワークセキュリティグループ (NSG) フローログの有効化
NSGフローログをKQLで分析可能にするには、まず**Network Watcher**を使用してログを有効にし、ストレージアカウントに格納する必要があります。

##### 手順
1. **Network Watcher**をデプロイします（通常、リージョンごとにデプロイが必要です）。 
2. Network Watcherのメニューから**「NSG フロー ログ」**を選択します。
3. ログを有効にしたい**NSG**を選択します。
4. 設定で以下を指定します。
    - **バージョン:** `V2` (推奨)
    - **トラフィック インテリジェンス:** 有効にします。
    - **ログの保存先:** **ストレージ アカウント**を選択します。

このステップにより、NSGのネットワークトラフィックデータ（送信元IP、送信先IP、ポート、プロトコル、アクションなど）がストレージアカウントのBLOBとしてJSON形式で格納されます。

#### 2. トラフィック分析の有効化とKQLでの抽出
KQLでクエリを実行するには、ストレージアカウントに保存されたフローログデータを解析し、Log Analyticsワークスペースに取り込む**「トラフィック分析」**機能が必要です。

##### 手順
1. Network Watcherのメニューから**「トラフィック分析」**を選択します。
2. **「構成の作成または更新」**を選択します。
3. **ストレージ アカウント**（手順1でフローログを保存した場所）を指定します。
4. **Log Analytics ワークスペース**（KQLクエリを実行する場所）を指定します。
5. 解析頻度（デフォルトは1時間ごと）を設定し、保存します。

トラフィック分析が有効になると、解析されたフローログデータが自動的に指定されたLog Analyticsワークスペースに取り込まれ、**`AzureNetworkAnalyticsFlow`**テーブルに格納されます。

#### 3. KQLでの抽出
Log Analyticsワークスペースで、以下のテーブル名とクエリを使用して、NSGフローログのデータを抽出・分析できます。

##### KQLテーブル名

| **ログの種類**    | **KQLのテーブル名**                   |
| ------------ | ------------------------------- |
| 解析済みNSGフローログ | **`AzureNetworkAnalyticsFlow`** |

##### 抽出クエリ例
特定の送信元IPアドレスからの拒否されたトラフィックを検索する一般的なクエリ例です。

コード スニペット
```
AzureNetworkAnalyticsFlow
| where FlowType == "AzurePublic" // Azure Public IPとのトラフィック
| where FlowDirection == "Inbound"
| where Action == "D" // DはDeny (拒否)
| where RemoteIP == "203.0.113.10" // 抽出したい送信元IP
| project TimeGenerated, VMName, SubSystem, RemoteIP, FlowDirection, Action
| order by TimeGenerated desc
| limit 100
```

この方法により、膨大なNSGフローログデータから、セキュリティインシデントの調査やネットワークトラフィックの可視化を効率的に行うことができます。


