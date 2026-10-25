---
publish: true
title: Azure Firewallの機能と設計要素
created: 2026-10-05T11:52:21.518Z
modified: 2026-10-25T15:10:14.426Z
tags:
  - Azure
  - Firewall
---

# 概要

Azure Firewall導入案件に参画した際に、AFWで実現できる機能を調査したのでメモを残しました。

# 本文

※この記事は正確性よりもインフラエンジニアが直感的に理解しやすい構成を意識して書いています。明らかに誤っている点があればご指摘下さい。

## AzureFirewall

AFWは、VNetのリソースを保護するためのクラウドベースのネットワークセキュリティサービスです。
[Azure Firewall のドキュメント | Microsoft Learn](https://learn.microsoft.com/ja-jp/azure/firewall/)

## AzureFirewallの機能

- DNAT規則：Azure FirewallのパブリックIP宛ての通信を内部の宛先へ変換する
- ネットワーク規則：送信元・宛先IPアドレス、ポート、プロトコルに基づいて通信を制御する
- アプリケーション規則：主にHTTP/Sなどの宛先FQDNに基づいて通信を制御する
- 脅威インテリジェンス：既知の悪意あるIPアドレスやドメインを検出する
- Webカテゴリ：Webサイトをカテゴリ単位で許可または拒否する
- TLSインスペクション：暗号化された通信を復号して検査する
- IDPS：シグネチャに基づいて不審な通信を検出・防止する
- URLフィルタリング：URL全体を基準に通信を制御する

それぞれの機能の詳細は価格設定によって分かれています。

| 観点          | Basic      | Standard     | Premium |
| ----------- | ---------- | ------------ | ------- |
| 主な用途        | 小規模・基本的な保護 | 一般的な企業ネットワーク | 高度な脅威検査 |
| ネットワーク規則    | 対応         | 対応           | 対応      |
| アプリケーション規則  | 対応         | 対応           | 対応      |
| 脅威インテリジェンス  | 制限あり       | 対応           | 対応      |
| DNSプロキシ     | 要確認        | 対応           | 対応      |
| Webカテゴリ     | 非対応        | 対応           | 対応      |
| TLSインスペクション | 非対応        | 非対応          | 対応      |
| IDPS        | 非対応        | 非対応          | 対応      |
| URLフィルタリング  | 非対応        | 非対応          | 対応      |

### Basic

- 参考URL
  [Azure portal を使用して Azure Firewall の基本とポリシーをデプロイして構成する | Microsoft Learn](https://learn.microsoft.com/ja-jp/azure/firewall/deploy-firewall-basic-portal-policy)

### Standard

- 参考URL
  [チュートリアル: Azure portal を使用して Azure Firewall とポリシーをデプロイして構成する | Microsoft Learn](https://learn.microsoft.com/ja-jp/azure/firewall/tutorial-firewall-deploy-portal-policy)

### Premium

- 参考URL
  [Azure Firewall Premium 機能の実装ガイド | Microsoft Learn](https://learn.microsoft.com/ja-jp/azure/firewall/premium-features)

## 前提要素

ここではAzure Firewall本体の設計ではないが重要な設計について触れます。

### パブリックIP

- インターネット送受信構成では、Azure FirewallにパブリックIPの関連付けが必要です。この点は意識していませんでした。
- Azure FirewallのパブリックIP宛てに通信を受信しても、DNAT規則がなければ、その通信がAzure Firewall経由で内部リソースへ転送されることはありません。

### ルーティング

- UDRの設定の事なのでAzure Firewallとは直接の関係が無いのですが、Internet向けのルーティングを全てAzure Firewallに向けないとフィルタリングは有効になりません。
- オンプレネットワークの為のExpressRouteなどを使用している場合、少し複雑な設定が必要になります。（クラウド内からオンプレに向かう通信はそのままで、クラウド内からインターネットに向かう通信だけAzure Firewallに向けるなど…）

### AzureFirewall用のSubnet

- Azure Firewallを配置する為のSubnetが必要になります。
- このSubnetを利用してハブ・アンド・スポークを構成することがよくあります。
  [[01_書きかけ/ゼロトラストセキュリティ]]
- 参考URL ハブ・アンド・スポークについて
  [Azure Firewall を使用してマルチハブ およびスポーク トポロジをルーティングする | Microsoft Learn](https://learn.microsoft.com/ja-jp/azure/firewall/firewall-multi-hub-spoke)

### NSG

- 保護対象リソース側のサブネットにNSGを適用している場合は、Azure Firewallを経由する必要な通信がNSGによって拒否されないことを確認します。Azure FirewallとNSGは異なる層で通信を制御するため、両方の規則で矛盾が生じないよう疎通経路を設計します。

## 設計要素

### フィルタリング

フィルタリング設定はAFWの中核になる機能なので設計のメインとなります。

#### ネットワーク規則

- 送信元・宛先IPアドレス、ポート、プロトコルを基準に通信を制御します。 AzureサービスのIPアドレス範囲を指定する場合は、サービスタグを利用できます。
- サービスタグを指定することでフィルタリングする対象をMicrosoftが管理してくれます。

#### アプリケーション規則

- 主にHTTP/Sなどの通信について、宛先FQDNを基準に制御します。 既知のAzureサービスについてはFQDNタグを利用できる場合があります。
- Premiumでは、FQDNだけでなくURL全体を考慮するURLフィルタリングも利用できます。
- 参考URL FQDNフィルターについて
  [Azure Firewall の FQDN フィルター処理 | Microsoft Learn](https://learn.microsoft.com/ja-jp/azure/firewall/domain-filtering-overview)

#### Web カテゴリ

- Microsoftが設定したカテゴリに基づいて、通信先のFQDN、URLを基にフィルタリングする機能です。
- カテゴリの変更にも対応しています。
- 参考URL
  [Azure Firewall の Web カテゴリ | Microsoft Learn](https://learn.microsoft.com/ja-jp/azure/firewall/web-categories)

### IDPS

- Azure Firewallを通過する受信・送信トラフィックをシグネチャに基づいて検査します。
- IDPSはAzure Firewallを通過する通信のみを検査対象とします。
- 参考URL
  [Azure Firewall IDPS のシグネチャ規則のカテゴリ | Microsoft Learn](https://learn.microsoft.com/ja-jp/azure/firewall/idps-signature-categories)

### TLSインスペクション

- TLSで暗号化された通信を復号化して検査します。
- TLSで暗号化された通信の内容をIDPSで検査するには、TLSインスペクションが必要です。TLSインスペクションを使用しない場合、暗号化されたペイロードの内容は検査できないため、IDPSによる検査範囲が制限されます。
- 参考URL  TLSインスペクションについて
  [TLS インスペクション | Microsoft Learn](https://learn.microsoft.com/ja-jp/azure/firewall/premium-features#tls-inspection)

# 細かい話

ここでは、綺麗に分類できなかったテーマを扱います。

### AzureFirewallのポリシー処理順序

1. 脅威インテリジェンスのフィルターは最優先されます。
2. Rule Collection Group は優先度順に処理されます。
3. Rule Collection は優先度順に処理されます。
4. DNAT設定、ネットワーク規則、アプリケーション規則の順に処理されます。

- 参考URL
  [Azure Firewall ルール処理ロジック | Microsoft Learn](https://learn.microsoft.com/ja-jp/azure/firewall/rule-processing)

### アウトバウンド/インバウンドの区別方法

- IPアドレスが[プライベートIP](https://learn.microsoft.com/ja-jp/azure/firewall/snat-private-range))かどうかを基準に判定しています。

### 料金を構成する主な要素

Azure Firewallの料金を検討する際は、少なくとも次の要素を分けて確認します。

- Azure Firewallのデプロイ時間に対する料金
- Azure Firewallで処理されるデータ量に応じた料金
- パブリックIPなど関連リソースの料金
- 診断ログをLog Analyticsなどへ送信・保存・照会する場合の料金
- 因みにルールの作成だけなら無料で試せるので、色々操作してみて納得出来る設定が出来てから、インスタンスを作ることも可能です。

実際の料金はSKU、リージョン、処理データ量、ログの保存先などによって変わるため、最新の公式料金表と料金計算ツールで確認してください。
