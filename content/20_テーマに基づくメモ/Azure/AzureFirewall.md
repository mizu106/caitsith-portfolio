---
tags:
  - Azure
  - Firewall
---

※この記事は正確性よりもインフラエンジニアが直感的に理解しやすい構成を意識して書いています。明らかに誤っている点があればご指摘下さい。

## AzureFirewall
AFWは、AVNのリソースを保護するためのクラウドベースのネットワークセキュリティサービスです。
[Azure Firewall のドキュメント | Microsoft Learn](https://learn.microsoft.com/ja-jp/azure/firewall/)


## AzureFirewallの機能
- NAT(FWが受信時)
- ネットワーク規則（IP）（FWが送信時）
- アプリケーション規則（URL、サービスタグ）（FWが送信時）
- TLS検査（証明書必要）
- カテゴリーフィルター
- IDPS（FW通過パケットのみ）

それぞれの機能の詳細は価格設定によって別れています。

### Basic　￥59.64/h
- 参考URL 
  [Azure portal を使用して Azure Firewall の基本とポリシーをデプロイして構成する | Microsoft Learn](https://learn.microsoft.com/ja-jp/azure/firewall/deploy-firewall-basic-portal-policy)

### Standard　￥188.74/h
- 高可用性の組み込み
- 可用性ゾーン：複数の可用性ゾーンにまたがるように
- 無制限のフラウドスケーラビリティ
- アプリケーションFQDNフィルタリングルール：FQDNベース
- ネットワークトラフィックフィルタリングルール：IPアドレス、ポート、プロトコル
- FQDNタグとサービスタグ
- 脅威インテリジェンス
- DNSプロクシとカスタムDNS：希望のDNSサーバに転送します。
- アウトバウンドSNATとインバウンドDNATサポート：
- 複数のパブリックIPをサポートします
- AzureMonitorログ
- 参考URL
  [チュートリアル: Azure portal を使用して Azure Firewall とポリシーをデプロイして構成する | Microsoft Learn](https://learn.microsoft.com/ja-jp/azure/firewall/tutorial-firewall-deploy-portal-policy)

### Premium　￥264.23/h
- TLSインスペクション：外部のトラフィックを復号化し、処理後に再暗号化して送信します。
- IDPS（侵入検知および防止システム）：ネットワーク活動を監視し、悪意のある活動をログに記録し報告、必要に応じてブロックします。
- URLフィルタリング：FQDNフィルタリングを拡張し、URL全体を考慮します。
- Webカテゴリ：ギャンブルやソーシャルメディアなどのWebカテゴリへのアクセスを許可または拒否します。
- 参考URL
  [Azure Firewall Premium 機能の実装ガイド | Microsoft Learn](https://learn.microsoft.com/ja-jp/azure/firewall/premium-features)

## 前提要素
ここではAzureFirewall本体の設計ではないが重要な設計について触れます。

### パブリックIP
- 外部と通信するので返信先のパブリックIPが必要です。この点は意識していませんでした。
- パブリックIPが攻撃された場合、AzureFirewallのフィルタリングルールに従って処理されます。NATの設定をしていなければ、内部のサーバーがさらされる事はありません。

### ルーティング
- UDRの設定の事なのでAzureFirewallとは直接の関係が無いのですが、Internet向けのルーティングを全てAzureFirewallに向けないとフィルタリングは有効になりません。
- - オンプレネットワークの為のExpressRouteなどを使用している場合、少し複雑な設定が必要になります。（クラウド内からオンプレに向かう通信はそのままで、クラウド内からインターネットに向かう通信だけAzureFirewallに向けるなど…）

### AzureFirewall用のSubnet
- AzureFirewallを配置する為のSubnetが必要になります。
- このSubnetを利用してハブ・アンド・スポークを構成することがよくあります。
  [[01_書きかけ/ゼロトラストセキュリティ]]
- 参考URL ハブ・アンド・スポークについて
  [Azure Firewall を使用してマルチハブ およびスポーク トポロジをルーティングする | Microsoft Learn](https://learn.microsoft.com/ja-jp/azure/firewall/firewall-multi-hub-spoke)

### NSG
- AzureFirewallを通過する通信を行うSubnetのNSGには、AzureFirewallからの送受信を許可する設定が必要です。

## 設計要素

### フィルダリング
フィルタリング設定はAWFの中核になる機能なので設計のメインとなります。

#### ネットワーク規則
- IPアドレス、ポート、プロトコルを使用したフィルダリングが可能です。

#### アプリケーション規則
- FQDN、サービスタグを使用したフィルダリングが可能です。サービスタグはマイクロソフトが定義したIPアドレスの集合です。
- サービスタグを指定することでフィルタリングする対象をMicrosoftが管理してくれます。
- URL（HTTP、HTTPS）を対象にしたフィルタリングが可能です。
- 参考URL FQDNフィルターについて
  [Azure Firewall の FQDN フィルター処理 | Microsoft Learn](https://learn.microsoft.com/ja-jp/azure/firewall/domain-filtering-overview)

#### Web カテゴリ
- Microsoftが設定したカテゴリに基づいて、通信先のFQDN、URLを基にフィルタリングする機能です。
- カテゴリの変更にも対応しています。
- 参考URL
  [Azure Firewall の Web カテゴリ | Microsoft Learn](https://learn.microsoft.com/ja-jp/azure/firewall/web-categories)

### IDPS
AzureFirewallは
- IDPSは受信と送信、両方のトラフィックをシグネチャ検査される。
- IDPSはAFWを通過するパケットについてのみ検査する。
- 参考URL
  [Azure Firewall IDPS のシグネチャ規則のカテゴリ | Microsoft Learn](https://learn.microsoft.com/ja-jp/azure/firewall/idps-signature-categories)

### TLSインスペクション
- TLSで暗号化された通信を復号化して検査します。
- IDPSの機能を最大限利用するにはTLSインスペクションを有効にする必要があります。TLインスペクションが無効化されていると、HTTPなどのTLS暗号化されていない通信のみが監視対象になります。
- 参考URL  TLSインスペクションについて
  [TLS インスペクション | Microsoft Learn](https://learn.microsoft.com/ja-jp/azure/firewall/premium-features#tls-inspection)

## 細かい話
ここでは、綺麗に分類できなかったテーマを扱います。

### [[20_テーマに基づくメモ/Azure/AzureFirewall]]のポリシー処理順序
1. 脅威インテリジェンスのフィルターは最優先されます。
2. Rule Collection Group は優先度順に処理されます。
3. Rule Collection は優先度順に処理されます。
4. DNAT設定、ネットワーク規則、アプリケーション規則の順に処理されます。

- 参考URL
  [Azure Firewall ルール処理ロジック | Microsoft Learn](https://learn.microsoft.com/ja-jp/azure/firewall/rule-processing)

### アウトバウンド/インバウンドの区別方法
- IPアドレスが[プライベートIP](https://learn.microsoft.com/ja-jp/azure/firewall/snat-private-range))かどうかを基準に判定しています。

### 課金方法
- 名前は忘れましたが、KQLに対する課金とAzureFirewallのルール数が多いと増える課金、パケットの通過量が多いと増える従量課金（ルール数の課金より高い）の３つに分けられます。
- 因みにルールの作成だけなら無料で試せるので、色々操作してみて納得出来る設定が出来てから、インスタンスを作ることも可能です。


