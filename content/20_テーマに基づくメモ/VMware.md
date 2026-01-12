---
tags:
  - 仮想化/VMware
  - Azure/AVS
---
### AVSについて学ぶ
#### 背景
業務でAVS（[[AzureVMwareSolution]]）を使うことになった。オンプレVMwareからのリフト（HCXのvMotionやVulkMigration）を行うので、vCenterやvSphereについて知識をつけたい。
実務経験によってオンプレ２AVSの注意点や癖を把握したい。
#### Keyword's
- AVSとは（Azure VMware Solution）
	- 専用ベアメタルホスト上にVMware、vSphereクラスタを構築
	- Azure上でvSphere、vSAN、NSX-T、HCX、vCenterServerをネイティブに利用可能
	- 3ノード～16ノードまで構成可能
	- HCXによるvMotionやBulkMigrationを使った移行が可能
	- Azureハイブリッド特典や予約インスタンスを利用した割引が可能
	- RiverMeadowなどの移行パートナーソリューションも利用可能
- HCXとは（Hybrid Cloud Extention）
	- VMwareが提供するハイブリッドクラウド環境構築ツール、特にAVSとオンプレ間をシームレスに接続する。
#### 疑問
- OVF/OVA形式でエクスポートとは何か？
- AVSでスケールセットは利用するか？
- AVSでのDRSとは何か？（AzureVMのDRSとの関係性）
- vCenterをオンプレ側とクラウド側それぞれに配置可能か？（片方に配置したvCenterに接続するのか）
- VMwareの機能、vSphereHAやvSphereDRSなどのクラスタリングは使用するか？
#### 移行手順
1. 準備
	1. ホストクォータのリクエスト
	2. ネットワーク設計（ExpressrouteやVPNGatewayでオンプレと接続する）
	3. IPアドレスの重複回避
2. デプロイ
	1. [[AzureVMwareSolution]]から、AVSプライベートクラウドの作成。（リージョン、ノード数、CIDRなど入力する）
	2. 約4時間程でvSphere環境がデプロイされる。（vCenter、ESXi、vSAN、NSX-Tなど）
3. HCXペアリング
	1. HCXをデプロイする。
	2. オンプレとAVS上のvSphereをHCXでペアリングする。
	3. L2Extensionを使用して、IPアドレス変更無しでVMを移行できる。
4. 移行
	1. HCXのvMotionやBulkMigrationを使用してVMを移行する。
	2. 移行後もVMwareツールなどを使用して運用する。

#### AVSのハードウェア構成
- サーバー：SKU毎にコア数やvSANで接続するストレージ容量が変わる
- ストレージ：vSAN経由でRAID機器接続
- ネットワーク：Azureとの接続にはExpressRouteを利用する。管理ツールはNSX-Tでオンプレとの接続にはHCXを利用する。
- 管理GUI:vCenterServer


### VMware徹底入門（第4版）
著：ヴイエムウェア株式会社
出版：SHOEISHA
#### vCenterServer
- vSphere仮想基盤の可用性について計画的メンテナンスと計画外停止に対する機能がある。　P14
- 計画的メンテナンスの場合、vSphere vMotion（7.1.1 vMotionとは）/Storage vMotion（7.3.1 Storage vMotionのしくみ）
- 計画外停止の場合、vShpere High Availability（9.1.1 vSphere HAの構成）/VMware Fault Tolerance（9.2.1 vSphere FTとは）
- ESXiの負荷分散の機能としてDRS（vSphere Distributed Resource Scheduler）がある。（8.2 vSphere DRS によるリソース利用の最適化）（8.3.2 Storage DRS）
- セキュリティ機能としては、VMware NSX
#### CPU/memoryの仮想化

#### ストレージ仮想化

#### ネットワーク仮想化

#### 仮想マシンの管理

#### ライブマイグレーション

#### バックアップと災害対策

### VMware vSphere クラスタ構築/運用の技法
著：Duncan Epping/Frank Denneman
訳：小川大地/後藤僚哉/清水亮夫/三田泰正
出版：SHOEISHA

VMware vSphereは、ESXiを使用したクラスター製品の名前。主にHA、vMotion、DRSに関するテーマを扱う書籍。

### [[AVSのBCP機能]]

### [[AzureVMwareSolution]]


