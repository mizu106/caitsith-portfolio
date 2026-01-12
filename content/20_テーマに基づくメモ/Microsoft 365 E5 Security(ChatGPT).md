---
tags:
  - 仕事/MicrosoftSecurity
---

# Microsoft 365 E5 Security アドオン - エンジニア向け技術解説

## 1. 概要
Microsoft 365 E5 Securityは、Microsoft 365 E3やOffice 365 E3などの既存サブスクリプションに追加できるセキュリティ強化アドオンです。完全なE5ライセンスを購入せずに、最先端のセキュリティ機能を利用できるコスト効率の高いソリューションとなっています。

### 基本情報
- **対象プラン**: Microsoft 365 E3サブスクリプション保有者
- **価格**: 約6,200円/ユーザー/月（2024年2月時点）
- **注意**: Office 365 E3からの直接追加は制限があり、Microsoft 365 E3が推奨されます

---

## 2. 含まれる主要コンポーネント
Microsoft 365 E5 Securityは、以下の5つの主要セキュリティサービスで構成されています。

### 2.1 Microsoft Defender for Office 365 (Plan 2)
**保護対象**: メール、ドキュメント、Teams、SharePoint、OneDrive

#### 主要機能
- **Safe Links（安全なリンク）**
  - メール本文およびTeams内のURLを動的スキャン
  - 悪意のあるリンクはMicrosoft標準URLプレフィックスに自動置換
  - クリック時に警告ページを表示し、危険サイトへのアクセスをブロック

- **Safe Attachments（安全な添付ファイル）**
  - 添付ファイルを仮想環境（サンドボックス）で開封・検証
  - SharePoint、OneDrive、Teams上のファイルも自動検疫
  - 悪意のあるファイルのダウンロードをブロック

- **高度な機能（Plan 2のみ）**
  - 自動調査と応答（AIR: Automated Investigation and Response）
  - 攻撃シミュレーション トレーニング
  - 脅威トラッカー
  - 脅威エクスプローラー（高度な検索・調査ツール）
  - インシデントとアラートの統合調査

**技術的ポイント**:
- リアルタイムスキャンによる配信時保護
- クリック時の再検証（Time-of-Click Protection）
- スプーフィング対策とフィッシング対策の高度な分析

---

### 2.2 Microsoft Defender for Endpoint (Plan 2)
**保護対象**: Windows、macOS、Linux、iOS、Android、IoTデバイス

#### EDR（Endpoint Detection and Response）機能
- **脅威ハンティング**
  - 高度なクエリベースの脅威検索
  - カスタム検出ルールの作成
  - 6ヶ月間のデータ保持

- **ライブ応答**
  - リモートシェルアクセス
  - ファイルの収集・分析
  - プロセスの強制終了
  - ネットワーク隔離

- **自動調査と修復**
  - 疑わしいアクティビティの自動分析
  - 関連イベントの相関分析
  - 自動的な脅威の無害化

#### 技術実装の詳細

```
【マルウェア検出フロー】
1. ファイル開封/マクロ実行
2. 振る舞い検知エンジンが異常動作を検出
3. 即座にプロセスをブロック
4. ユーザーへ通知（画面右下トースト）
5. 管理者ポータルへインシデント登録
6. 関係ノードの可視化（感染経路、影響範囲）
```

**Plan 1との主な違い**:
- Plan 1: 次世代アンチウイルス、攻撃面の縮小、デバイス制御
- Plan 2: 上記 + EDR、自動調査、脅威ハンティング、脅威インテリジェンス

---

### 2.3 Microsoft Entra ID P2（旧Azure AD Premium P2）
**保護対象**: ユーザーID、アカウント、認証

#### 主要機能
**Identity Protection（ID保護）**
- リスクベースの条件付きアクセス
- 機械学習による異常サインイン検出
- 漏洩した資格情報の検出
- リアルタイムリスク評価

**Privileged Identity Management（PIM）**
- Just-In-Time（JIT）管理者権限の付与
- 時間制限付き特権アクセス
- 承認ワークフローの統合
- 特権操作の監査ログ

**Entra ID Governance**
- アクセスレビュー
- エンタイトルメント管理
- ライフサイクルワークフロー

**実装例**:
```
【条件付きアクセスポリシー設定例】
IF: ユーザーのサインインリスク = 高
AND: デバイス = 管理外
THEN: 多要素認証を要求 + アクセスをブロック

IF: 場所 = 日本国外
AND: ユーザー = 管理者グループ
THEN: 承認ワークフロー + 時間制限付きアクセス
```

**P1との主な違い**:
- P1: 条件付きアクセス、セルフサービスパスワードリセット、多要素認証
- P2: 上記 + Identity Protection、PIM、アクセスレビュー

---

### 2.4 Microsoft Defender for Cloud Apps（旧MCAS）
**保護対象**: SaaSアプリケーション、クラウドサービス

#### CASB（Cloud Access Security Broker）機能
- **シャドウIT検出**
  - 組織内で使用されているクラウドアプリの可視化
  - 未承認アプリの利用状況監視
  - リスクスコアによる評価

- **条件付きアクセス アプリ制御**
  - セッション単位のアクセス制御
  - ダウンロード/アップロードの制限
  - リアルタイムモニタリング

- **App Governance**
  - OAuth認証アプリの監視
  - 過度な権限を持つアプリの検出
  - 自動ポリシーアラート

**使用シナリオ**:
```
【典型的なポリシー設定】
ポリシー名: 機密ファイルの外部共有防止
対象: SharePoint/OneDrive
条件: ラベル = "機密" AND 共有先 = 外部ユーザー
アクション: 共有をブロック + 管理者へアラート
```

---

### 2.5 Microsoft Defender for Identity（旧Azure ATP）
**保護対象**: オンプレミスActive Directory、ハイブリッド環境

#### ITDR（Identity Threat Detection and Response）機能
- **横展開攻撃の検出**
  - Pass-the-Hash攻撃
  - Pass-the-Ticket攻撃
  - Golden Ticket攻撃
  - Overpass-the-Hash攻撃

- **侵害されたアカウントの特定**
  - 異常な認証パターンの検出
  - 特権昇格の試み
  - 異常なDNSクエリ

- **内部脅威の監視**
  - 疑わしいアカウント動作
  - データの大量抽出
  - 不正なグループ変更

**アーキテクチャ**:
```
[オンプレAD] → [Defender for Identity Sensor] → [Cloud Service] → [Microsoft Defender Portal]
                         ↓
                  ドメインコントローラーに
                  軽量センサーを配置
```

---

## 3. E3とE5の機能比較表
 
| 機能カテゴリ                      | E3     | E5 Security アドオン後 |
| --------------------------- | ------ | ----------------- |
| **Defender for Office 365** | Plan 1 | Plan 2            |
| Safe Links/Attachments      | ✓      | ✓                 |
| 自動調査と応答                     | ✗      | ✓                 |
| 攻撃シミュレーション                  | ✗      | ✓                 |
| 脅威エクスプローラー                  | ✗      | ✓                 |
| **Defender for Endpoint**   | なし     | Plan 2            |
| EDR                         | ✗      | ✓                 |
| 脅威ハンティング                    | ✗      | ✓                 |
| ライブ応答                       | ✗      | ✓                 |
| **Entra ID**                | P1     | P2                |
| Identity Protection         | ✗      | ✓                 |
| PIM                         | ✗      | ✓                 |
| アクセスレビュー                    | ✗      | ✓                 |
| **Defender for Cloud Apps** | なし     | ✓                 |
| **Defender for Identity**   | なし     | ✓                 |
 
---
  
## 4. 導入要件と前提条件

### 4.1 ライセンス要件
- **必須**: Microsoft 365 E3サブスクリプション
- **非推奨**: Office 365 E3（機能制限あり）
- **ユーザーベース**: デバイスベースライセンスは非対応

### 4.2 技術要件

```
【クライアント要件】
- Windows 10/11 Enterprise
- macOS 10.15以降
- iOS 13以降
- Android 8.0以降
 
 【サーバー要件（Defender for Identity）】
- Windows Server 2012 R2以降のドメインコントローラー
- .NET Framework 4.7以降
- 最低2コア、6GB RAM（センサー用）

【ネットワーク要件】
- Microsoft 365エンドポイントへのHTTPS通信（*.security.microsoft.com）
- センサーからクラウドサービスへのPort 443アウトバウンド
```

### 4.3 管理ポータル
すべての機能は統合ポータルで管理されます：
- **Microsoft Defender Portal**: https://security.microsoft.com
- **Microsoft Entra admin center**: https://entra.microsoft.com

---

## 5. 実装ベストプラクティス

### 5.1 段階的展開アプローチ
```
【フェーズ1: パイロット】（2週間）
- 小規模グループ（10-20ユーザー）で検証
- ポリシー設定の調整
- 誤検知の確認
  
【フェーズ2: 部門展開】（1ヶ月）
- 部門ごとに段階的展開
- ユーザートレーニング実施
- ヘルプデスク対応準備

【フェーズ3: 全社展開】（2ヶ月）
- 全ユーザーへ展開
- 継続的なモニタリング
- ポリシーの最適化
```

### 5.2 推奨初期設定

**Defender for Office 365**
```
優先度: 高
- 標準保護プロファイルを適用
- Safe Linksを全ユーザーに有効化
- Safe Attachmentsの動的配信を有効化
- スプーフィング対策を"厳密"に設定
```

**Defender for Endpoint**
```
優先度: 高
- 攻撃面の縮小ルールを監査モードで展開
- 次世代保護をクラウド提供保護有効化
- 自動調査と修復を"セミ自動"で開始
- 脅威とインテリジェンスを有効化
```

**Entra ID P2**
```
優先度: 中
- サインインリスクポリシー（中リスク以上でMFA要求）
- ユーザーリスクポリシー（高リスクでパスワード変更要求）
- PIMで管理者ロールのJIT化
- アクセスレビューを四半期ごとに実施
```

---

## 6. 運用上の考慮事項

### 6.1 アラート管理
Microsoft Defender Portalでは大量のアラートが生成される可能性があります。

**推奨対応**:
```
【優先度付けルール】
Critical: 即座に対応（15分以内）
High: 1時間以内に対応
Medium: 4時間以内に確認
Low: 日次レビューで確認

【自動化設定】
- 既知の誤検知を自動抑制
- 低リスクアラートを自動クローズ
- 高リスクインシデントは自動エスカレーション
```

### 6.2 データ保持期間

```
Defender for Endpoint: 6ヶ月（Plan 2）
Defender for Office 365: 30日（標準）、最大90日（延長可能）
Cloud App Security: 180日
監査ログ: 90日（標準）、最大10年（E5 Compliance）
```

### 6.3 パフォーマンスへの影響

```
【クライアント側】
- CPU使用率: 平均 1-3% 増加
- メモリ: 100-200MB（Defender for Endpoint）
- ディスクI/O: スキャン時に一時的増加

【ネットワーク側】
- テレメトリ送信: 1-5MB/日/デバイス
- クラウド参照: ファイルハッシュ検証時のみ
```

---

## 7. トラブルシューティング

### 7.1 よくある問題

**問題1: Defender for Endpointセンサーがオンボーディングできない**

```bash
# 診断ツール実行
cd "C:\Program Files\Microsoft Defender for Endpoint\MsSense.exe"
MsSense.exe -t

# 接続確認
Test-NetConnection -ComputerName winatp-gw-weu.microsoft.com -Port 443

# レジストリ確認
Get-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Windows Advanced Threat Protection\Status"
```

**問題2: Safe Linksが機能しない**

```powershell
# PowerShell接続
Connect-IPPSSession

# ポリシー確認
Get-SafeLinksPolicy | Format-List Name,IsEnabled

# URL書き換え確認
Get-SafeLinksPolicy | Select-Object EnableSafeLinksForEmail
```

**問題3: 条件付きアクセスが適用されない**

```
確認項目:
□ ユーザーにEntra ID P2ライセンスが割り当てられているか
□ ポリシーが"有効"状態か
□ 除外グループに含まれていないか
□ デバイスがEntra IDに登録されているか
□ サインインログでポリシー適用を確認
```

### 7.2 ログ収集先

```
【主要ログ】
Defender Portal: security.microsoft.com > インシデント > アラート
監査ログ: compliance.microsoft.com > 監査
サインインログ: entra.microsoft.com > 監視 > サインインログ
Endpointログ: イベントビューア > Microsoft > Windows > SENSE
```

---

## 8. コスト最適化

### 8.1 アドオンとフルE5の比較

| 項目         | E3 + E5 Security | E5フル版             |
| ---------- | ---------------- | ----------------- |
| 月額コスト/ユーザー | ~9,400円          | ~8,545円           |
| セキュリティ機能   | 同等               | 同等                |
| コンプライアンス機能 | なし               | あり（E5 Compliance） |
| 高度な分析      | なし               | あり（Power BI Pro等） |
| 音声会議       | なし               | あり                |

**判断基準**:
- セキュリティのみ必要 → **E5 Securityアドオン**
- コンプライアンスも必要 → **E5フル版またはE5 Compliance追加**
- 300ユーザー以上 → **E5フル版が割安**

### 8.2 ライセンス最適化のヒント

```
1. 段階的展開でリスク評価
   → 全社展開前に本当に必要か検証

2. ロールベースの割り当て
   → 管理者/経営層のみE5 Security
   → 一般社員はE3 + 基本保護

3. ハイブリッド構成
   → クラウドのみユーザーはE5 Security不要な場合も
   → オンプレAD連携ユーザーのみDefender for Identity

4. 代替案の検討
   → Microsoft Defender for Business（中小企業向け、300名まで）
   → Enterprise Mobility + Security E5（EMS E5）
```

---

## 9. セキュリティ検証事例

### 9.1 標的型攻撃の防御（KDDI実証実験より）

**シナリオ**: フィッシングメールからの侵害

```
【攻撃フロー】
1. 悪質なリンクを含むメールを送信
   ↓
2. Defender for Office 365が検出
   - リンクをMicrosoft標準URLに置換
   ↓
1. ユーザーがリンクをクリック
   - 警告ページを表示
   - 悪質サイトへのアクセスをブロック

【結果】
✓ 100%の検出率
✓ ユーザーへの影響なし（透過的な保護）
✓ 平均応答時間: 0.3秒
```

### 9.2 マルウェア感染の防御

**シナリオ**: マクロ付きWordファイル

```
【攻撃フロー】
1. マルウェアが埋め込まれたWordファイルを開封
   ↓
2. マクロ実行を試行
   ↓
3. Defender for Endpointが検知
   - 振る舞いベース検出エンジン発動
   - プロセスを即座にブロック
   ↓
1. ユーザーへ通知（トースト）
2. 管理者ポータルへアラート送信
   - 関係ノード可視化（影響範囲分析）
   - 自動調査開始

【結果】
✓ 実行前にブロック
✓ 検出から対処まで平均2秒
✓ 自動修復により管理者介入不要
```

---

## 10. まとめ

### Microsoft 365 E5 Securityアドオンが適している組織
- ✓ すでにMicrosoft 365 E3を使用中
- ✓ 高度なセキュリティ対策が急務
- ✓ コンプライアンス機能は不要
- ✓ 段階的なセキュリティ投資を検討中
- ✓ 300名以下の組織

### 導入による期待効果

```
【セキュリティ面】
- フィッシング検出率: 99.9%以上
- マルウェア検出率: 99.8%以上
- 平均脅威対応時間: 80%削減

【運用面】
- セキュリティインシデント調査時間: 70%削減
- 誤検知による業務中断: 最小化
- 統合管理による工数削減: 50%
```

### 次のステップ
1. 現在のセキュリティギャップを評価
2. パイロットグループで2週間トライアル実施
3. ポリシー設定と誤検知の最適化
4. 段階的に全社展開
5. 継続的なモニタリングと改善

---

## 参考リソース
- [Microsoft 365 E5製品ページ](https://www.microsoft.com/ja-jp/microsoft-365/enterprise/e5)
- [Microsoft Defender Portal](https://security.microsoft.com)
- [Microsoft Learn - セキュリティドキュメント](https://learn.microsoft.com/ja-jp/microsoft-365/security/)
- [ライセンスガイド（英語）](https://learn.microsoft.com/en-us/office365/servicedescriptions/microsoft-365-service-descriptions/microsoft-365-tenantlevel-services-licensing-guidance/microsoft-365-security-compliance-licensing-guidance)

---

**更新日**: 2024年11月  
**対象バージョン**: Microsoft 365 E5 Security（2024年後期版）