---
tags:
  - Azure/AVS
---

# 概要
「AVSでBCPする時に、ASR使えるのかな？」という疑問を起点に調べてみました。
なぜその疑問が発生したのか…
- ASRはディスクのレプリケーションという認識なので、VMwareのホストマシンを取り込んだAVSではどのレベルでレプリケーションするのか疑問に感じたこと
- WMwareはBCPの機能でも有名なのにその機能は活かさないのか？（AVSの存在意義に反する感じがしました）

結果、AVSではWMwareの**vSphere High Availability**を使用するため、BCP先のリージョンにもAVSを構築しておく必要がある…（ASRと比較してお金がかかる）事が分かりました。

最近、AVS＋ASR型のBCPを採用している案件を見かけるので、AVS導入企業でも**vSphere High Availability**は避けているのかもしれません…

# 本文
### AVSのBCP機能
**Azure VMware Solution（AVS）のBCP機能には、ストレッチクラスター、バックアップ、フェールオーバー設計などが含まれ、事業継続と災害復旧（BCDR）を支援します。**

以下に、AVSで利用可能なBCP（Business Continuity Planning）機能を体系的にまとめます：

---

### 🧩 主なBCP機能と設計要素

#### 1. **vSphere High Availability（HA）**

- _AVSでは標準で有効化_
- 単一ノード障害時に、他ノードでVMを自動再起動
- **HAポリシーによりリソース予約**が行われ、フェールオーバー時の容量を確保

#### 2. **vSAN ストレッチクラスター**

- _2つの可用性ゾーンにまたがる構成_
- 可用性ゾーン障害にも耐えられる高可用性設計
- **vSANポリシー**でデータ冗長性を制御（例：RAID1）

#### 3. **Azure Backup / MARS / DPM**

- Microsoft Azure Backup Server（MABS）やMARSエージェントを利用可能
- vSphere VMのバックアップに対応
- **ExpressRoute経由でAVSと接続されたVNetにバックアップ構成**するのが推奨

#### 4. **パイロットライト構成**

- 最小限のリソースでDRサイトを構成
- 災害時にスケールアウトして本番相当のリソースを展開

#### 5. **フェールオーバー設計**

- セカンダリサイトに同等のストレージ容量を確保
- コンピュート・メモリ集中型ワークロードに対応するための設計が必要

#### 6. **管理コンポーネントのバックアップ**

- vCenter Server、NSX-T Manager、HCX ManagerはAzureによって**自動バックアップ**
- 復元にはAzureサポート経由でリクエスト

---

### 📌 補足：BCP設計のベストプラクティス

- **ホスト数に応じた障害許容設計**
    - 3〜5ホスト：1ホスト障害まで許容
    - 6〜16ホスト：2ホスト障害まで許容
- **VMごとのストレージポリシー適用**で柔軟な可用性設計が可能
- **ExpressRoute Global Reach**を活用すれば、ペアリージョン間のDR構成も可能

---

BCP設計は、単なるバックアップではなく、**可用性・復旧時間・コストのバランス**を取ることが重要です。AVSはVMwareベースの運用を維持しながら、Azureの冗長性とスケーラビリティを活用できるのが強みです。

必要なら、具体的な構成例や設計テンプレートもご紹介できますよ [Microsoft Learn](https://learn.microsoft.com/ja-jp/azure/cloud-adoption-framework/scenarios/azure-vmware/eslz-business-continuity-and-disaster-recovery)。

---


### AVSをペアリージョンを利用して冗長構成する機能名は？
Azure VMware Solution（AVS）でペアリージョンを利用して冗長構成を実現する際に関連する主な機能名は以下の通りです：

### 🛡️ 冗長構成に関連する主な機能名

- **HCX Network Extension（HCX-NE）冗長化**
    
    - VMware HCXの機能で、L2ネットワークを延伸する際に冗長構成を可能にします。
    - **Enterprise Edition**で利用可能（AVSでは標準でサポート） [blog.jbs.co.jp](https://blog.jbs.co.jp/entry/2025/01/20/134953)
    - Active/Standby構成で、障害時のフェールオーバーに対応
    - ペアリージョン間でのL2延伸を冗長化することで、可用性を向上
- **Service Mesh（サービスメッシュ）構成**
    
    - HCXのコンポーネントをペアリージョンにまたがって配置する際に使用
    - 冗長化のために複数のHCX-NEを設定し、**HA（High Availability）グループ**を構成 [blog.jbs.co.jp](https://blog.jbs.co.jp/entry/2025/01/20/134953)
- **ExpressRoute Global Reach**
    
    - 異なるAzureリージョン間でのネットワーク接続を可能にする機能
    - ペアリージョン間の冗長ネットワーク構成に活用される [qiita.com](https://qiita.com/Azuro/items/a755d343b4806e1b16f6)
- **Azure リージョンペア（Region Pair）**
    
    - Microsoftが定義するペアリージョン構成。地理的に近接したリージョン同士で、災害時の復旧や更新の順序制御などに利用される [learn.microsoft.com](https://learn.microsoft.com/ja-jp/azure/reliability/regions-paired)

---

これらの機能を組み合わせることで、AVS環境をペアリージョン間で高可用性かつ災害復旧対応の構成にすることが可能です。特にHCX-NEの冗長化は、AVSでのL2延伸において重要な役割を果たします。

もっと詳しく設計したい場合は、構成例やベストプラクティスも紹介できますよ。興味ありますか？
[HCX-NEの冗長化 - JBS Tech Blog](https://blog.jbs.co.jp/entry/2025/01/20/134953)

---

### AVSリホストOVFとは
「AVSリホストOVF」とは、**Azure VMware Solution（AVS）環境に仮想マシンを移行（リホスト）する際に、OVF形式を利用する手法**を指します。

### 🧳 OVFとは？

OVF（Open Virtualization Format）は、仮想マシンの構成情報やディスクイメージを含む**標準化されたパッケージ形式**です。以下のようなファイルで構成されます：

- `.ovf`：仮想マシンの構成情報（XML形式）
- `.vmdk`：仮想ディスクファイル
- `.mf`：メタ情報（オプション）

OVFは、VMware環境間で仮想マシンを**エクスポート／インポート**する際に使われます [techdocs.broadcom.com](https://techdocs.broadcom.com/jp/ja/vmware-cis/vsphere/vsphere/8-0/vsphere-virtual-machine-administration-guide-8-0/deploying-ovf-templatesvsphere-vm-admin.html)。

---

### 🚀 AVSへのリホストでOVFを使う理由

AVSはAzure上で稼働するVMware環境なので、オンプレミスのvSphere環境からAVSへ仮想マシンを移行する際に、OVF形式が便利です。以下のような流れになります：

1. **オンプレミス環境で仮想マシンをOVF形式でエクスポート**
    - vSphere Clientや`ovftool`を使用
2. **AVS環境にOVFファイルをインポート**
    - vSphere Web ClientでOVFテンプレートをデプロイ
3. **仮想マシンを起動・設定**

この方法は、**ネットワーク接続が制限されている環境**や、**HCXなどの移行ツールが使えない場合**の代替手段としても有効です。

---

### 🛠️ 関連ツール

- **VMware OVF Tool**：CLIベースでOVFファイルのエクスポート／インポートを行う公式ツール [qiita.com](https://qiita.com/Raccoon_/items/48680ef33f354d1bfbe7)
- **vSphere Client**：GUIでOVFテンプレートのデプロイが可能

---

もし「OVFでの移行手順」や「HCXとの違い」など、さらに深掘りしたい内容があれば、どんどん聞いてくださいね。
[OVF および OVA テンプレートのデプロイとエクスポート](https://techdocs.broadcom.com/jp/ja/vmware-cis/vsphere/vsphere/8-0/vsphere-virtual-machine-administration-guide-8-0/deploying-ovf-templatesvsphere-vm-admin.html)

