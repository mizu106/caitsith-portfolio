
## この記事の内容

1. [P2S で使用されるプロトコル](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/point-to-site-about#protocol)
2. [P2S VPN クライアントの認証方法](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/point-to-site-about#authentication)
3. [クライアントの構成要件について](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/point-to-site-about#what-are-the-client-configuration-requirements)
4. [P2S VPN がサポートされるゲートウェイ SKU の種類](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/point-to-site-about#gwsku)

ポイント対サイト (P2S) VPN ゲートウェイ接続では、個々のクライアント コンピューターから仮想ネットワークへの、セキュリティで保護された接続を作成することができます。 P2S 接続は、クライアント コンピューターから接続を開始することによって確立されます。 このソリューションは、在宅勤務者が自宅や会議室など、遠隔地から Azure VNet に接続する場合に便利です。 P2S VPN は、VNet への接続を必要とするクライアントが数台である場合に、S2S VPN の代わりに使用するソリューションとしても便利です。 ポイント対サイト構成には、**ルートベース**の VPN の種類が必要です。

この記事は、現行のデプロイ モデルに適用されます。 従来のデプロイについては、[P2S - クラシック](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/vpn-gateway-howto-point-to-site-classic-azure-portal)に関するページを参照してください。

## P2S で使用されるプロトコル

ポイント対サイト VPN では、次のいずれかのプロトコルを使用できます。

- SSL/TLS ベースの VPN プロトコルである **OpenVPN® プロトコル**。 ほとんどのファイアウォールは、TLS で使用されるアウトバウンド TCP ポート 443 を開いているため、TLS VPN ソリューションはファイアウォールを通過できます。 OpenVPN は、Android、iOS (バージョン 11.0 以上)、Windows、Linux、および Mac デバイス (macOS バージョン 10.13 以上) から接続する際に使用できます。
- **Secure Socket トンネリング プロトコル (SSTP)**。これは、TLS ベースの独自の VPN プロトコルです。 ほとんどのファイアウォールは、TLS で使用されるアウトバウンド TCP ポート 443 を開いているため、TLS VPN ソリューションはファイアウォールを通過できます。 SSTP は、Windows デバイスでのみサポートされます。 Azure では、SSTP を備え、TLS 1.2 をサポートするすべてのバージョンの Windows (Windows 8.1 以降) がサポートされています。
- **IKEv2 VPN**。これは、標準ベースの IPsec VPN ソリューションです。 IKEv2 VPN は、Mac デバイス (macOS バージョン 10.11 以上) から接続する際に使用できます。

## P2S VPN クライアントの認証方法

Azure が P2S VPN 接続を受け入れる前に、ユーザーはまず認証を受ける必要があります。 P2S ゲートウェイを構成するときに選択できる認証の種類は 3 つあります。 オプションは次のとおりです。

- Azure 証明書
- Microsoft Entra ID
- RADIUS と Active Directory ドメイン サーバー

P2S ゲートウェイ構成には、複数の認証の種類を選択できます。 複数の認証の種類を選択した場合、使用する VPN クライアントは、少なくとも 1 つの認証の種類と対応するトンネルの種類によってサポートされている必要があります。 たとえば、トンネルの種類が "IKEv2 と OpenVPN" で、認証の種類が "Microsoft Entra ID と Radius" または "Microsoft Entra ID と Azure 証明書" の場合、Microsoft Entra ID は、IKEv2 でサポートされていないため、OpenVPN のトンネルの種類のみを使用します。

選択したトンネルの種類と互換性のある認証メカニズムを、次の表に示します。 それぞれのメカニズムでは、接続デバイス上の対応する VPN クライアント ソフトウェアを、VPN クライアント プロファイル構成ファイルで使用できる適切な設定で構成する必要があります。

| トンネルの種類 | 認証メカニズム |
| --- | --- |
| OpenVPN | Microsoft Entra ID、Radius 認証、Azure 証明書のサブセット |
| SSTP | Radius 認証/Azure 証明書 |
| IKEv2 | Radius 認証/Azure 証明書 |
| IKEv2 と OpenVPN | Radius 認証/Azure 証明書/Microsoft Entra ID と Radius 認証/Microsoft Entra ID と Azure 証明書 |
| IKEv2 と SSTP | Radius 認証/Azure 証明書 |

### 証明書の認証

証明書認証用に P2S ゲートウェイを構成する場合は、信頼されたルート証明書の公開キーを Azure ゲートウェイにアップロードします。 エンタープライズ ソリューションを使って生成されたルート証明書を使用することも、自己署名証明書を生成することもできます。

認証するには、接続する各クライアントに、信頼されたルート証明書から生成されたクライアント証明書がインストールされている必要があります。 これは、VPN クライアント ソフトウェアの他に実施します。 クライアント証明書の検証は、P2S VPN 接続が確立される間、VPN ゲートウェイによって実行されます。

### 証明書のワークフロー

証明書認証を構成するために、実行する必要のある手順の概要を以下に示します。

1. 追加の必要な設定 (クライアント アドレス プールなど) を行って、P2S ゲートウェイで証明書認証を有効にし、ルート CA 公開キー情報をアップロードします。
2. VPN クライアント プロファイル構成ファイル (プロファイル構成パッケージ) を生成してダウンロードします。
3. 接続している各クライアント コンピューターにクライアント証明書をインストールします。
4. VPN プロファイル構成パッケージで見つかった設定を使用して、クライアント コンピューターで VPN クライアントを構成します。
5. 接続。

### Microsoft Entra ID 認証

VPN ユーザーが Microsoft Entra ID 資格情報を使用して認証できるように P2S ゲートウェイを構成できます。 Microsoft Entra ID 認証では、VPN に Microsoft Entra 条件付きアクセスと多要素認証 (MFA) 機能を使用できます。 Microsoft Entra ID 認証は、OpenVPN プロトコルに対してのみサポートされています。 認証と接続を行うには、クライアントが Azure VPN クライアントを使用する必要があります。

VPN Gateway では、最新バージョンの Azure VPN クライアントに対して、Microsoft 登録済みアプリ ID とそれに対応する対象ユーザー値をサポートするようになりました。 新しい対象ユーザー値を使用して P2S VPN ゲートウェイを構成する場合は、Microsoft Entra テナント用に Azure VPN クライアント アプリを手動で登録するプロセスをスキップします。 アプリ ID は既に作成されており、追加の登録手順を実行しなくても、テナントはそのアプリ ID を自動的に使用できます。 このプロセスは、アプリの承認や、グローバル管理者ロールによるアクセス許可の割り当てを行う必要がないため、Azure VPN クライアントを手動で登録するよりも安全です。

以前は、Azure VPN クライアント アプリを Microsoft Entra テナントに手動で登録 (統合) する必要がありました。 クライアント アプリを登録すると、Azure VPN クライアント アプリケーションの ID を表すアプリ ID が作成され、グローバル管理者ロールを使用して認証を行う必要があります。 アプリケーション オブジェクトの種類の違いをより深く理解するには、「[アプリケーションを Microsoft Entra ID に追加する方法と理由](https://learn.microsoft.com/ja-jp/entra/identity-platform/how-applications-are-added)」を参照してください。

可能な場合は、Azure VPN クライアント アプリをテナントに手動で登録するのではなく、Microsoft 登録済み Azure VPN クライアント アプリ ID とそれに対応する対象ユーザー値を使用して、新しい P2S ゲートウェイを構成することをお勧めします。 Microsoft Entra ID 認証を使用する Azure VPN Gateway を既に構成している場合は、新しい Microsoft 登録済みアプリ ID を利用するようにゲートウェイとクライアントを更新できます。 Linux クライアントを接続するには、P2S ゲートウェイを新しい対象ユーザー値に更新する必要があります。 Linux 用 Azure VPN クライアントは、古い対象ユーザー値と下位互換性がありません。

既存の P2S ゲートウェイを、新しい対象ユーザー値を使用するように更新する必要がある場合は、[P2S VPN ゲートウェイの対象ユーザーの変更](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/point-to-site-entra-gateway-update)に関するページを参照してください。 カスタム対象ユーザーの値を作成または変更する場合は、[P2S VPN Microsoft Entra ID 認証用のカスタム対象ユーザー アプリ ID の作成](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/point-to-site-entra-register-custom-app)に関するページを参照してください。

考慮事項と制限:

- P2S VPN ゲートウェイでサポートできる対象ユーザー値は 1 つのみです。 同時に複数の対象ユーザー値をサポートすることはできません。
- 現時点では、新しい Microsoft 登録済みアプリ ID は、手動で登録される古いアプリほど多くの対象ユーザー値をサポートしていません。 Azure パブリックまたはカスタム以外の対象ユーザー値が必要な場合は、古い手動による登録方法と値を使用します。
- Linux 用 Azure VPN Client は、手動で登録されたアプリに対応する古い対象ユーザー値を使用するように構成された P2S ゲートウェイと下位互換性がありません。 Linux 用 Azure VPN クライアントでは、カスタム対象ユーザー値はサポートされています。
- 
    
    Linux 用 Azure VPN クライアントは他の Linux ディストリビューションやリリースで動作する可能性もありますが、Linux 用 Azure VPN クライアントは次のリリースでのみサポートされています。
    
    - Ubuntu 20.04
    - Ubuntu 22.04
- macOS および Windows 用 Azure VPN クライアントは、手動で登録されたアプリに対応する古い対象ユーザー値を使用するように構成された P2S ゲートウェイと下位互換性があります。 これらのクライアントでは、カスタム対象ユーザー値を使用することもできます。

次の表は、各アプリ ID でサポートされている Azure VPN クライアントのバージョンと、対応する使用可能な対象ユーザー値を示しています。

| アプリ ID | サポートされている対象ユーザー値 | サポートされるクライアント |
| --- | --- | --- |
| Microsoft 登録済み | - Azure パブリック: `c632b3df-fb67-4d84-bdcf-b95ad541b5c8` | - Linux- Windows- macOS |
| 手動による登録 | - Azure パブリック: `41b23e61-6c1e-4545-b367-cd054e0ed4b4`- Azure Government: `51bb15d4-3a4f-4ebf-9dca-40096fe32426`- Azure Germany: `538ee9e6-310a-468d-afef-ea97365856a9`- 21Vianet によって運営される Microsoft Azure: `49f817b6-84ae-4cc0-928c-73f27289b3aa` | - Windows - macOS |
| Custom | `<custom-app-id>` | - Linux- Windows - macOS |

### Microsoft Entra ID ワークフロー

Microsoft Entra ID 認証を構成するために、実行する必要のある手順の概要を以下に示します。

1. アプリの手動登録を使用する場合は、Entra テナントで必要な手順を実行します。
2. 追加の必要な設定 (クライアント アドレス プールなど) を行って、P2S ゲートウェイで Microsoft Entra ID 認証を有効にします。
3. VPN クライアント プロファイル構成ファイル (プロファイル構成パッケージ) を生成してダウンロードします。
4. Azure VPN クライアントをクライアント コンピューターにダウンロードし、インストールし、構成します。
5. 接続。

### Active Directory (AD) ドメイン サーバー

AD ドメイン認証では、ユーザーは組織のドメイン資格情報を使用して Azure に接続できます。 これには AD サーバーと統合する RADIUS サーバーが必要です。 また、組織は既存の RADIUS デプロイを利用することもできます。

RADIUS サーバーは、オンプレミスまたは Azure VNet にデプロイできます。 認証が行われる間、Azure VPN ゲートウェイがパススルーとして機能し、接続するデバイスと RADIUS サーバーの間で認証メッセージを転送します。 そのため、ゲートウェイが RADIUS サーバーにアクセスできることが重要です。 RADIUS サーバーがオンプレミスに存在する場合、アクセスのために、Azure からオンプレミス サイトへの VPN サイト間接続が必要になります。

また、RADIUS サーバーは、AD 証明書サービスとも統合できます。 これにより、Azure 証明書認証の代替手段として、P2S 証明書認証に RADIUS サーバーとエンタープライズ証明書デプロイを使用できます。 この利点は、ルート証明書と失効した証明書を Azure にアップロードする必要がないことです。

RADIUS サーバーは、他の外部 ID システムと統合することもできます。 これにより、多要素認証のオプションなど、P2S VPN 向けの多数の認証オプションを利用できるようになります。

[オンプレミス サイトを使用したポイント対サイト VPN を示す図。](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/media/point-to-site-about/p2s.png#lightbox)

![](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/media/point-to-site-about/p2s.png)

P2S ゲートウェイの構成手順については、[P2S の構成 - RADIUS](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/point-to-site-how-to-radius-ps) に関するページを参照してください。

## クライアントの構成要件について

クライアント構成の要件は、使用する VPN クライアント、認証の種類、プロトコルによって異なります。 次の表に、使用可能なクライアントと、各構成に対応する記事を示します。

| 認証 | トンネルの種類 | クライアントの OS | VPN client |
| --- | --- | --- | --- |
| 証明書 |  |  |  |
|  | IKEv2、SSTP | Windows | [ネイティブ VPN クライアント](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/point-to-site-vpn-client-certificate-windows-native) |
|  | IKEv2 | macOS | [ネイティブ VPN クライアント](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/point-to-site-vpn-client-cert-mac) |
|  | IKEv2 | Linux | [strongSwan](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/point-to-site-vpn-client-certificate-ike-linux) |
|  | OpenVPN | Windows | [Azure VPN クライアント](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/point-to-site-vpn-client-certificate-windows-azure-vpn-client) [OpenVPN クライアント](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/point-to-site-vpn-client-certificate-windows-openvpn-client) |
|  | OpenVPN | macOS | [OpenVPN クライアント](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/point-to-site-vpn-client-certificate-openvpn-mac) |
|  | OpenVPN | iOS | [OpenVPN クライアント](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/point-to-site-vpn-client-certificate-openvpn-ios) |
|  | OpenVPN | Linux | [Azure VPN クライアント](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/point-to-site-certificate-client-linux-azure-vpn-client)[OpenVPN クライアント](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/point-to-site-vpn-client-certificate-openvpn-linux) |
| Microsoft Entra ID |  |  |  |
|  | OpenVPN | Windows | [Azure VPN クライアント](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/point-to-site-entra-vpn-client-windows) |
|  | OpenVPN | macOS | [Azure VPN クライアント](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/point-to-site-entra-vpn-client-mac) |
|  | OpenVPN | Linux | [Azure VPN クライアント](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/point-to-site-entra-vpn-client-linux) |

## P2S VPN がサポートされるゲートウェイ SKU の種類

次の表に、トンネル、接続、スループット別のゲートウェイ SKU を示します。 詳細については、「[ゲートウェイの SKU について](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/about-gateway-skus)」を参照してください。

| **VPNGateway世代** | **SKU** | **S2S/VNet-to-VNetトンネル** | **P2S SSTP 接続** | **P2S IKEv2/OpenVPN 接続** | **Aggregateスループット ベンチマーク** | **BGP** | **ゾーン冗長** | **Virtual Network でサポートされている VM の数** |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **Generation1** | **Basic** | 最大 10 | 最大 128 | サポートされていません | 100 Mbps | サポートされていません | いいえ | 200 |
| **Generation1** | **VpnGw1** | 最大 30 | 最大 128 | 最大 250 | 650 Mbps | サポートされています | いいえ | 450 |
| **Generation1** | **VpnGw2** | 最大 30 | 最大 128 | 最大 500 | 1 Gbps | サポートされています | いいえ | 1300 |
| **Generation1** | **VpnGw3** | 最大 30 | 最大 128 | 最大 1000 | 1.25 Gbps | サポートされています | いいえ | 4000 |
| **Generation1** | **VpnGw1AZ** | 最大 30 | 最大 128 | 最大 250 | 650 Mbps | サポートされています | はい | 1000 |
| **Generation1** | **VpnGw2AZ** | 最大 30 | 最大 128 | 最大 500 | 1 Gbps | サポートされています | はい | 2,000 |
| **Generation1** | **VpnGw3AZ** | 最大 30 | 最大 128 | 最大 1000 | 1.25 Gbps | サポートされています | はい | 5000 |
|  |  |  |  |  |  |  |  |  |
| **Generation2** | **VpnGw2** | 最大 30 | 最大 128 | 最大 500 | 1.25 Gbps | サポートされています | いいえ | 685 |
| **Generation2** | **VpnGw3** | 最大 30 | 最大 128 | 最大 1000 | 2.5 Gbps | サポートされています | いいえ | 2240 |
| **Generation2** | **VpnGw4** | 最大 100* | 最大 128 | 最大 5000 | 5 Gbps | サポートされています | いいえ | 5300 |
| **Generation2** | **VpnGw5** | 最大 100* | 最大 128 | 最大 10000 | 10 Gbps | サポートされています | いいえ | 6700 |
| **Generation2** | **VpnGw2AZ** | 最大 30 | 最大 128 | 最大 500 | 1.25 Gbps | サポートされています | はい | 2,000 |
| **Generation2** | **VpnGw3AZ** | 最大 30 | 最大 128 | 最大 1000 | 2.5 Gbps | サポートされています | はい | 3300 |
| **Generation2** | **VpnGw4AZ** | 最大 100* | 最大 128 | 最大 5000 | 5 Gbps | サポートされています | はい | 4400 |
| **Generation2** | **VpnGw5AZ** | 最大 100* | 最大 128 | 最大 10000 | 10 Gbps | サポートされています | はい | 9000 |

注意

Basic SKU には制限があり、IKEv2、IPv6、RADIUS 認証はサポートされていません。 詳細については、[VPN Gateway の設定](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/vpn-gateway-about-vpn-gateway-settings#gwsku)に関するページを参照してください。

## P2S 用に VPN ゲートウェイではどの IKE/IPsec ポリシーが構成されていますか。

このセクションの表では、既定のポリシーの値を示します。 ただし、カスタム ポリシーでサポートされている使用可能な値は反映されません。 カスタム ポリシーの場合は、[New-AzVpnClientIpsecParameter](https://learn.microsoft.com/ja-jp/powershell/module/az.network/new-azvpnclientipsecparameter) PowerShell コマンドレットに一覧表示されている**指定可能な値**を参照してください。

**IKEv2**

| **暗号化** | **整合性** | **PRF** | **DH グループ** |
| --- | --- | --- | --- |
| GCM_AES256 | GCM_AES256 | SHA384 | GROUP_24 |
| GCM_AES256 | GCM_AES256 | SHA384 | GROUP_14 |
| GCM_AES256 | GCM_AES256 | SHA384 | GROUP_ECP384 |
| GCM_AES256 | GCM_AES256 | SHA384 | GROUP_ECP256 |
| GCM_AES256 | GCM_AES256 | SHA256 | GROUP_24 |
| GCM_AES256 | GCM_AES256 | SHA256 | GROUP_14 |
| GCM_AES256 | GCM_AES256 | SHA256 | GROUP_ECP384 |
| GCM_AES256 | GCM_AES256 | SHA256 | GROUP_ECP256 |
| AES256 | SHA384 | SHA384 | GROUP_24 |
| AES256 | SHA384 | SHA384 | GROUP_14 |
| AES256 | SHA384 | SHA384 | GROUP_ECP384 |
| AES256 | SHA384 | SHA384 | GROUP_ECP256 |
| AES256 | SHA256 | SHA256 | GROUP_24 |
| AES256 | SHA256 | SHA256 | GROUP_14 |
| AES256 | SHA256 | SHA256 | GROUP_ECP384 |
| AES256 | SHA256 | SHA256 | GROUP_ECP256 |
| AES256 | SHA256 | SHA256 | GROUP_2 |

**IPsec**

| **暗号化** | **整合性** | **PFS グループ** |
| --- | --- | --- |
| GCM_AES256 | GCM_AES256 | GROUP_NONE |
| GCM_AES256 | GCM_AES256 | GROUP_24 |
| GCM_AES256 | GCM_AES256 | GROUP_14 |
| GCM_AES256 | GCM_AES256 | GROUP_ECP384 |
| GCM_AES256 | GCM_AES256 | GROUP_ECP256 |
| AES256 | SHA256 | GROUP_NONE |
| AES256 | SHA256 | GROUP_24 |
| AES256 | SHA256 | GROUP_14 |
| AES256 | SHA256 | GROUP_ECP384 |
| AES256 | SHA256 | GROUP_ECP256 |
| AES256 | SHA1 | GROUP_NONE |

## P2S 用に VPN ゲートウェイではどの TLS ポリシーが構成されていますか。

**TLS**

**ポリシー**

---

TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384

---

TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256

---

TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA384

---

TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA256

---

- *TLS_AES_256_GCM_SHA384

---

- *TLS_AES_128_GCM_SHA256

---

- *OpenVPN を使用する TLS1.3 でのみサポートされます

## P2S 接続の構成方法

P2S 構成で必要な手順には、特有のものが非常に多くあります。 次の記事では、一般的な P2S 構成の手順について順を追って説明します。

- [証明書の認証](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/vpn-gateway-howto-point-to-site-resource-manager-portal)
- [Microsoft Entra ID 認証](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/point-to-site-entra-gateway)
- [RADIUS 認証](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/point-to-site-how-to-radius-ps)

### P2S 接続の構成を削除するには

PowerShell または CLI を使用して、接続の構成を削除できます。 例については、「[FAQ](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/vpn-gateway-vpn-faq#removeconfig)」を参照してください。

## P2S ルーティングのしくみ

次の記事をご覧ください。

- [ポイント対サイト VPN ルーティングについて](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/vpn-gateway-about-point-to-site-routing)
- [カスタム ルートを公開するには](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/vpn-gateway-p2s-advertise-custom-routes)

## よく寄せられる質問

ポイント対サイトには複数の FAQ エントリがあります。 「[VPN Gateway に関する FAQ](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/vpn-gateway-vpn-faq)」を参照してください。必要に応じて、[証明書認証](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/vpn-gateway-vpn-faq#P2S)と [RADIUS](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/vpn-gateway-vpn-faq#P2SRADIUS) のセクションに特に注意を払ってください。

## 次のステップ

- [P2S 接続の構成 - Azure 証明書認証](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/vpn-gateway-howto-point-to-site-resource-manager-portal)
- [P2S 接続を構成する - Microsoft Entra ID 認証](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/point-to-site-entra-gateway)**"OpenVPN" は OpenVPN Inc. の商標です**