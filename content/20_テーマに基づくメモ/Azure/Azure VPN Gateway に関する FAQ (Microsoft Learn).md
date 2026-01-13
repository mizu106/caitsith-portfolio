

いいえ。 ゲートウェイの種類は、ポリシー ベースからルート ベースに変更することも、ルート ベースからポリシー ベースに変更することもできません。 ゲートウェイの種類を変更するには、次の手順を実行して、ゲートウェイを削除して再作成する必要があります。 このプロセスには約 60 分かかります。 新しいゲートウェイを作成するときに、元のゲートウェイの IP アドレスを保持することはできません。

1. ゲートウェイに関連付けられているすべての接続を削除してください。
2. ゲートウェイを削除するには、次のいずれかの記事を利用します: 
    - [Azure Portal](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/vpn-gateway-delete-vnet-gateway-portal)
    - [Azure PowerShell](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/vpn-gateway-delete-vnet-gateway-powershell)
    - [Azure PowerShell - クラシック](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/vpn-gateway-delete-vnet-gateway-classic-powershell)
3. 目的のゲートウェイの種類を使用して新しいゲートウェイを作成し、VPN のセットアップを完了します。 手順については、[サイト間のチュートリアル](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/tutorial-site-to-site-portal#VNetGateway)を参照してください。

### 独自のポリシー ベースのトラフィック セレクターを指定できますか?

はい。[New-AzIpsecTrafficSelectorPolicy](https://learn.microsoft.com/ja-jp/powershell/module/az.network/new-azipsectrafficselectorpolicy) Azure PowerShell コマンドを使用して、接続で `trafficSelectorPolicies` 属性を使用して、トラフィック セレクターを定義できます。 指定したトラフィック セレクターを有効にするには、[ポリシー ベースのトラフィック セレクターを有効に](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/vpn-gateway-connect-multiple-policybased-rm-ps#enablepolicybased)してください。

カスタム構成のトラフィック セレクターは、VPN ゲートウェイが接続を開始する場合にのみ提案されます。 VPN ゲートウェイでは、リモート ゲートウェイ (オンプレミス VPN デバイス) によって提案されたすべてのトラフィック セレクターが受け入れられます。 この動作は、すべての接続モード (`Default`、`InitiatorOnly`、`ResponderOnly`) 間で一貫しています。

### ゲートウェイ サブネットは必要ですか?

はい。 ゲートウェイ サブネットには、仮想ネットワーク ゲートウェイ サービスが使用する IP アドレスが含まれます。 仮想ネットワーク ゲートウェイを構成するには、仮想ネットワークのゲートウェイ サブネットを作成する必要があります。

すべてのゲートウェイは、正常に動作させるために `GatewaySubnet` という名前を付ける必要があります。 ゲートウェイ サブネットに他の名前を付けないでください。 また、ゲートウェイ サブネットには VM などをデプロイしないでください。

ゲートウェイ サブネットを作成するときに、サブネットに含まれる IP アドレスの数を指定します。 ゲートウェイ サブネット内の IP アドレスは、ゲートウェイ サービスに割り当てられます。

一部の構成では、他の構成よりも多くの IP アドレスをゲートウェイ サービスに割り当てる必要があります。 ゲートウェイ サブネットには、将来の拡大や新しい接続構成の追加に対応できる十分な IP アドレスが含まれるようにしてください。

/29 のような小さいゲートウェイ サブネットも作成できますが、/27 以上 (/27、/26、/25 など) のゲートウェイ サブネットを作成することをお勧めします。 既存のゲートウェイ サブネットが、作成する構成の要件を満たしていることを確認します。

### ゲートウェイ サブネットに仮想マシンやロール インスタンスをデプロイできますか?

いいえ。

### ゲートウェイを作成する前に VPN Gateway の IP アドレスを取得できますか。

Azure の Standard SKU のパブリック IP リソースでは、静的な割り当て方法を使用する必要があります。 使用する Standard SKU のパブリック IP リソースを作成するとすぐに、VPN ゲートウェイ用のパブリック IP アドレスが作成されます。

### VPN ゲートウェイに静的なパブリック IP アドレスを指定することはできますか?

Standard SKU のパブリック IP リソースでは、静的な割り当て方法を使用します。 今後、新しい VPN ゲートウェイを作成するときは、Standard SKU のパブリック IP アドレスを使用する必要があります。 この要件は、Basic SKU を除くすべてのゲートウェイ SKU に適用されます。 Basic SKU では現在、Basic SKU のパブリック IP アドレスのみがサポートされています。 Basic SKU の Standard SKU パブリック IP アドレスのサポートの追加に取り組んでいます。

ゾーン冗長および非ゾーン ゲートウェイ (名前に *AZ* が入っていないゲートウェイ SKU) の場合、動的 IP アドレスの割り当てがサポートされますが、段階的に廃止されています。動的 IP アドレスを使用する場合、その IP アドレスは VPN ゲートウェイに割り当てられた後も変更されません。 VPN ゲートウェイの IP アドレスが変更されるのは、ゲートウェイが削除されてから、再度作成された場合だけです。 パブリック IP アドレスは、VPN ゲートウェイのサイズ変更、リセット、またはその他の内部メンテナンスまたはアップグレードを完了しても変更されません。

### Basic SKU パブリック IP アドレスの廃止は VPN ゲートウェイにどのような影響を与えますか?

Basic SKU パブリック IP アドレスを利用するデプロイ済み VPN ゲートウェイの継続的な操作を確実に行うために、アクションを実行しています。 Basic SKU パブリック IP アドレスを持つ VPN ゲートウェイが既にある場合は、何の操作も行う必要はありません。

ただし、Basic SKU のパブリック IP アドレスは段階的に廃止されています。今後、新しい VPN ゲートウェイを作成するときは、Standard SKU のパブリック IP アドレスを使用する必要があります。 Basic SKU パブリック IP アドレスの提供終了の詳細については、「[Azure 更新プログラムのお知らせ](https://azure.microsoft.com/updates/upgrade-to-standard-sku-public-ip-addresses-in-azure-by-30-september-2025-basic-sku-will-be-retired)」を参照してください。

### VPN トンネルはどのように認証されますか?

Azure VPN Gateway では、事前共有キー (PSK) 認証が使用されます。 VPN トンネルを作成するときに PSK が生成されます。 Set Pre-Shared Key REST API または PowerShell コマンドレットを使用して、自動生成された PSK を独自の PSK に変更できます。

### ポリシー ベース (静的ルーティング) ゲートウェイ VPN を構成する際に Set Pre-Shared Key REST API を使用できますか?

はい。 はい。Set Pre-Shared Key REST API および PowerShell コマンドレットは、Azure のポリシー ベース (静的ルーティング) の VPN とルート ベース (動的ルーティング) の VPN のどちらを構成する場合にも使用できます。

### ほかの認証オプションを使用することはできますか

事前共有キーによる認証のみに制限されています。

### VPN Gateway を通過するトラフィックの種類は、どのようにすれば指定できますか。

Azure Resource Manager デプロイ モデルの場合:

- Azure PowerShell: `AddressPrefix` を使用してローカル ネットワーク ゲートウェイのトラフィックを指定します。
- Azure portal: *[ローカル ネットワーク ゲートウェイ]*>**[構成]**>**[アドレス空間]** に移動します。

クラシック デプロイ モデルの場合:

- Azure portal: [クラシック仮想ネットワーク] に移動し、**[VPN 接続]**>**[サイト間 VPN 接続]**>*[ローカル サイト名]*>*[ローカル サイト]*>**[クライアント アドレス空間]** に移動します。

### VPN 接続で NAT-T を使用できますか。

はい。ネットワーク アドレス変換トラバーサル (NAT-T) がサポートされています。 Azure VPN Gateway は、IPsec トンネルへの内部パケットまたは IPsec トンネルからの内部パケットに対して NAT のような機能を実行*しません*。 この構成では、オンプレミスのデバイスによって IPsec トンネルが開始されるようにします。

### Azure で自社の VPN サーバーをセットアップし、オンプレミス ネットワークへの接続に使用することはできますか。

はい。 はい。Azure Marketplace から、または独自の VPN ルーターを作成して、独自の VPN ゲートウェイやサーバーを Azure 内にデプロイできます。 仮想ネットワーク内でユーザー定義ルートを構成して、オンプレミス ネットワークと仮想ネットワークのサブネットの間でトラフィックが適切にルーティングされるようにする必要があります。

### 仮想ネットワーク ゲートウェイで特定のポートが開かれているのはなぜですか。

Azure インフラストラクチャの通信に必要です。 Azure 証明書は、それらをロックダウンして保護するのに役立ちます。 対象のゲートウェイの顧客を含め、適切な証明書を持たない外部エンティティは、これらのエンドポイントに影響を与えることはできません。

仮想ネットワーク ゲートウェイは、基本的にマルチホーム デバイスです。 1 つのネットワーク アダプターが顧客のプライベート ネットワークをタップし、1 つのネットワーク アダプターがパブリック ネットワークに接続します。 Azure インフラストラクチャのエンティティは、コンプライアンス上の理由から顧客のプライベート ネットワークに接続できないため、インフラストラクチャの通信用にパブリック エンドポイントを利用する必要があります。 Azure セキュリティ監査は、パブリック エンドポイントを定期的にスキャンします。

### ポータルで Basic SKU を使用して VPN Gateway を作成できますか?

いいえ。 Basic SKU はポータルでは使用できません。 Azure CLI または [Azure PowerShell](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/create-gateway-basic-sku-powershell) の手順を使って、Basic SKU VPN ゲートウェイを作成できます。

### ゲートウェイの種類、要件、スループットに関する情報はどこで確認できますか?

次の記事をご覧ください。

- [VPN Gateway の構成設定について](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/vpn-gateway-about-vpn-gateway-settings)
- [ゲートウェイ SKU について](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/about-gateway-skus)

## 古い SKU の廃止

Standard および High Performance SKU は、2025 年 9 月 30 日に非推奨になります。 お知らせは、[Azure 更新プログラム サイト](https://go.microsoft.com/fwlink/?linkid=2255127)で確認できます。 製品チームは、2024 年 11 月 30 日までに、これらの SKU の移行パスを利用できるようにします。 詳しくは、「[VPN Gateway レガシ SKU](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/vpn-gateway-about-skus-legacy#sku-deprecation)」をご覧ください。

*現時点では、実行する必要があるアクションはありません*。

### 2023 年 11 月 30 日の非推奨発表後に Standard SKU または High Performance SKU を使用する新しいゲートウェイを作成できますか?

いいえ。 2023 年 12 月 1 日の時点で、Standard SKU または High Performance SKU を使用するゲートウェイを作成することはできません。 VpnGw1 と VpnGw2 を使用して、Standard と High Performance の SKU と同じ価格で新しいゲートウェイを作成できます。これらは、[価格ページ](https://azure.microsoft.com/pricing/details/vpn-gateway/)にそれぞれ記載されています。

### Standard と High Performance の SKU の既存のゲートウェイはいつまでサポートされますか?

Standard SKU または High Performance SKU を使用するすべての既存のゲートウェイは、2025 年 9 月 30 日までサポートされます。

### 今すぐ、Standard または High Performance SKU からゲートウェイを移行する必要がありますか?

いいえ。今必要なアクションはありません。 ゲートウェイを移行できるのは 2024 年 12 月からです。 移行手順に関する詳細なドキュメントを含むお知らせをお送りします。

### どの SKU にゲートウェイを移行できますか?

ゲートウェイ SKU の移行が可能になると、SKU は次のように移行できます。

- Standard から VpnGw1
- High Performance から VpnGw2

### AZ SKU に移行する場合はどうすればよいですか?

非推奨の SKU を AZ SKU に移行することはできません。 ただし、2025 年 9 月 30 日を過ぎても Standard または High Performance SKU を使用しているすべてのゲートウェイは、次のように自動的に移行され、AZ SKU にアップグレードされます。

- Standard から VpnGw1AZ
- High Performance から VpnGw2AZ

この戦略を使用して、SKU を自動的に移行し、AZ SKU にアップグレードすることができます。 その後、必要に応じて、その SKU ファミリ内で SKU をサイズ変更できます。 AZ SKU の価格については、[価格に関するページ](https://azure.microsoft.com/pricing/details/vpn-gateway/)を参照してください。 SKU 別のスループット情報については、「[ゲートウェイ SKU について](https://go.microsoft.com/fwlink/?linkid=2256302)」を参照してください。

### 移行後にゲートウェイの価格に違いはありますか?

2025 年 9 月 30 日までに SKU を移行する場合、価格に違いはありません。 VpnGw1 と VpnGw2 の SKU はそれぞれ、Standard と High Performance の SKU と同じ価格で提供されます。

その日付までに移行しない場合、SKU は自動的に移行され、AZ SKU にアップグレードされます。 その場合、価格に違いがあります。

### この移行によるゲートウェイのパフォーマンスへの影響はありますか?

はい。 VpnGw1 と VpnGw2 を使用すると、パフォーマンスが向上します。 現在、650 Mbps の VpnGw1 では、Standard SKU と同じ価格で 6.5 倍のパフォーマンスが向上しています。 1 Gbps の VpnGw2 は、High Performance SKU と同じ価格で 5 倍のパフォーマンス向上を実現します。 SKU スループットの詳細については、「[ゲートウェイ SKU について](https://go.microsoft.com/fwlink/?linkid=2256302)」を参照してください。

### 2025 年 9 月 30 日までに移行しない場合はどうなりますか?

引き続き Standard SKU または High Performance SKU を使用しているすべてのゲートウェイは、自動的に移行され、次の AZ SKU にアップグレードされます:

- Standard から VpnGw1AZ
- High Performance から VpnGw2AZ

ゲートウェイで移行を始める前に、通知をお送りします。

### VPN Gateway Basic SKU も廃止されますか?

いいえ。VPN Gateway Basic SKU は廃止されません。 VPN ゲートウェイは、Azure PowerShell または Azure CLI を使用して Basic SKU を使用して作成できます。

現在、VPN Gateway Basic SKU では、Basic SKU パブリック IP アドレス リソースのみがサポートされています (これは廃止予定ではありません)。 Standard SKU パブリック IP アドレス リソースのサポートを VPN Gateway Basic SKU に追加する作業を行っています。

## サイト間接続と VPN デバイス

### VPN デバイスを選択する場合の考慮事項について教えてください。

Microsoft では、デバイス ベンダーと協力して複数の標準的なサイト間 VPN デバイスを検証しました。 既知の互換性のある VPN デバイスの一覧、対応する構成手順またはサンプル、およびデバイスの仕様については、「[VPN デバイスについて」](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/vpn-gateway-about-vpn-devices)の記事を参照してください。

互換性が確認されているデバイス ファミリに属するすべてのデバイスも仮想ネットワークで動作します。 VPN デバイスを構成するには、デバイスの構成サンプル、または適切なデバイス ファミリに対応するリンクを参照してください。

### VPN デバイスの構成設定はどこにありますか。

ご利用の VPN デバイスによっては、VPN デバイス構成スクリプトをダウンロードできる場合があります。 詳細については、[VPN デバイス構成スクリプトのダウンロード](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/vpn-gateway-download-vpndevicescript)に関するページを参照してください。

次のリンクには、構成の詳細についての情報が掲載されています。

- 適合する VPN デバイスについては、「[VPN デバイスについて](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/vpn-gateway-about-vpn-devices)」を参照してください。
- VPN デバイスを構成する前に、[デバイスの互換性に関する既知の問題](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/vpn-gateway-about-vpn-devices#known)がないか確認します。
- デバイスの構成設定へのリンクについては、[検証済みの VPN デバイス](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/vpn-gateway-about-vpn-devices#devicetable)に関するページを参照してください。 デバイス構成リンクはベストエフォート ベースで提供されていますが、最新の構成情報については常にデバイスの製造元に確認することをお勧めします。
    
    この一覧には、テストしたバージョンが表示されます。 VPN デバイスの OS バージョンが一覧にない場合でも、互換性がある可能性があります。 デバイスの製造元に問い合わせてください。
    
- VPN デバイス構成に関する基本情報については、「[パートナー VPN デバイス構成の概要](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/vpn-gateway-3rdparty-device-config-overview)」を参照してください。
- デバイス構成サンプルの編集については、[サンプルの編集](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/vpn-gateway-about-vpn-devices#editing)に関するセクションを参照してください。
- 暗号化の要件については、「[About cryptographic requirements and Azure VPN gateways](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/vpn-gateway-about-compliance-crypto)」(暗号化要件と Azure VPN ゲートウェイについて) を参照してください。
- 構成を完了するために必要なパラメーターについては、「[既定の IPsec/IKE パラメーター](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/vpn-gateway-about-vpn-devices#ipsec)」を参照してください。 この情報には、IKE バージョン、Diffie-Hellman (DH) グループ、認証方法、暗号化とハッシュ アルゴリズム、セキュリティ アソシエーション (SA) の有効期間、前方秘匿性 (PFS)、およびデッド ピア検出 (DPD) が含まれます。
- IPsec/IKE ポリシーの構成手順については、[サイト間 VPN と VNet 間のカスタム IPsec/IKE 接続ポリシーの構成](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/vpn-gateway-ipsecikepolicy-rm-powershell)に関するページを参照してください。
- 複数のポリシーベース VPN デバイスを接続するには、「[VPN ゲートウェイをオンプレミス ポリシーベースの VPN デバイスに接続する](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/vpn-gateway-connect-multiple-policybased-rm-ps)」を参照してください。

### VPN デバイス構成サンプルは、どのように編集すればよいですか。

「[デバイス構成のサンプルの編集](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/vpn-gateway-about-vpn-devices#editing)」を参照してください。

### IPsec および IKE パラメーターはどこにありますか。

「[既定の IPsec/IKE パラメーター](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/vpn-gateway-about-vpn-devices#ipsec)」を参照してください。

### トラフィックがアイドル状態のときにポリシー ベースの VPN トンネルがダウンするのはなぜですか。

これは、ポリシー ベースの (*静的ルーティング*とも呼ばれる) VPN ゲートウェイの予期される動作です。 トンネル経由のトラフィックが 5 分以上アイドル状態になると、そのトンネルは破棄されます。 どちらかの方向のトラフィック フローが開始されると、トンネルはすぐに再び確立されます。

### ソフトウェア VPN を使用して Azure に接続することはできますか。

Windows Server 2012 ルーティングとリモート アクセス (RRAS) サーバーでは、クロスプレミス構成のサイト間接続をサポートしています。

その他のソフトウェア VPN ソリューションについては、業界標準の IPsec の実装に準拠していればゲートウェイで動作します。 構成とサポートの手順については、ソフトウェアのベンダーにお問い合わせください。

### サイト間接続がアクティブなサイトにあるとき、ポイント対サイトを利用して VPN Gateway に接続できますか?

はい。ただし、ポイント対サイト クライアントのパブリック IP アドレスは、サイト間 VPN デバイスが使用するパブリック IP アドレスとは異なる必要があります。そうしないと、ポイント対サイト接続は機能しません。 IKEv2 を使用するポイント対サイト接続は、同じ VPN ゲートウェイでサイト間 VPN 接続が構成されている同じパブリック IP アドレスから開始できません。

## ポイント対サイト接続

### ポイント対サイト構成でいくつの VPN クライアント エンドポイントを使用できますか。

それは、ゲートウェイ SKU によって異なります。 サポートされる接続の数の詳細については、「[ゲートウェイ SKU](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/vpn-gateway-about-vpngateways#gwsku)」を参照してください。

### ポイント対サイト接続で使用できるクライアント オペレーティング システムを教えてください。

次のクライアント オペレーティング システムがサポートされています。

- Windows Server 2008 R2 (64 ビットのみ)
- Windows 8.1 (32 ビットと 64 ビット)
- Windows Server 2012 (64 ビットのみ)
- Windows Server 2012 R2 (64 ビットのみ)
- Windows Server 2016 (64 ビットのみ)
- Windows Server 2019 (64 ビットのみ)
- Windows Server 2022 (64 ビットのみ)
- Windows 10
- Windows 11
- macOS、バージョン 10.11 以降
- Linux (StrongSwan)
- iOS

### ポイント対サイト機能を使用してプロキシとファイアウォールを走査できますか?

Azure では、次の 3 種類のポイント対サイト VPN オプションをサポートしています。

- **Secure Socket Tunneling Protocol (SSTP)**: ほとんどのファイアウォールが 443 SSL で使用する送信 TCP ポートを開いているため、ファイアウォールに侵入できる Microsoft 独自の SSL ベースのソリューションです。
- **OpenVPN**: ほとんどのファイアウォールが 443 SSL で使用する送信 TCP ポートを開いているため、ファイアウォールに侵入できる SSL ベースのソリューションです。
- **IKEv2 VPN**: IP プロトコル番号 50 と共に送信 UDP ポート 500 と 4500 を使用する標準ベースの IPsec VPN ソリューション。 ファイアウォールによってこれらのポートが開かれるとは限らないため、IKEv2 VPN がプロキシとファイアウォールを通過できない可能性があります。

### ポイント対サイト接続用に構成されたクライアント コンピューターを再起動した場合、VPN は自動的に再接続されますか?

自動再接続は、お使いのクライアントの機能です。 Windows では、**Always On VPN** クライアント機能を構成することで、自動再接続がサポートされています。

### ポイント対サイトでは VPN クライアントの DDNS はサポートされていますか。

現在、Dynamic DNS (DDNS) はポイント対サイト VPN でサポートされていません。

### サイト間構成とポイント対サイト構成は、同じ仮想ネットワークで共存できますか?

はい。 Resource Manager デプロイ モデルの場合には、ゲートウェイにルートベースの VPN が必要になります。 クラシック デプロイ モデルの場合は、動的ゲートウェイが必要です。 静的ルーティング VPN ゲートウェイと、ポリシーベースの VPN ゲートウェイでは、ポイント対サイト接続はサポートされません。

### ポイント対サイト接続のクライアントを同時に複数の仮想ネットワーク ゲートウェイに接続するように構成することはできますか。

使用する VPN クライアント ソフトウェアによっては、複数の仮想ネットワーク ゲートウェイに接続できる場合があります。 ただし、これは、接続先の仮想ネットワークの間、またはクライアントが接続しているネットワークとの間に競合するアドレス空間がない場合に限られます。 Azure VPN クライアントは多数の VPN 接続をサポートしていますが、接続できる接続はいつでも 1 つだけです。

### ポイント対サイト クライアントを、複数の仮想ネットワークに同時に接続するように設定できますか。

はい。 他の VNet とピアリングされている VNet にデプロイされた VPN ゲートウェイへのポイント対サイト クライアント接続は、特定の構成基準を満たしている限り、他のピアリングされた VNet にアクセスできます。 ポイント対サイト クライアントがピアリングされた VNet にアクセスできるようにするには、ピアリングされた VNet (ゲートウェイのない VNet) を **Use remote gateways** 属性で構成する必要があります。 VPN ゲートウェイを使用する VNet は、"**ゲートウェイ転送を許可**" で構成する必要があります。 詳細については、「[ポイント対サイト VPN ルーティングについて](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/vpn-gateway-about-point-to-site-routing)」を参照してください。

### サイト間接続またはポイント対サイト接続ではどの程度のスループットが得られますか?

VPN トンネルのスループットを正確に一定レベルに維持することは困難です。 IPsec と SSTP は、VPN プロトコルの中でも暗号化処理の負荷が高いものです。 また、プレミスとインターネット間の遅延と帯域幅によりスループットが制限を受ける場合があります。

IKEv2 ポイント対サイト VPN 接続のみを使用する VPN ゲートウェイでは、期待できるスループットの総量がゲートウェイの SKU に応じて変わります。 スループットの詳細については、「[ゲートウェイの SKU](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/vpn-gateway-about-vpngateways#gwsku)」を参照してください。

### SSTP または IKEv2 をサポートしているポイント対サイト接続では、ソフトウェア VPN クライアントを使用できますか?

いいえ。 SSTP については Windows のネイティブ VPN クライアント、IKEv2 については Mac のネイティブ VPN クライアントのみ使用できます。 ただし、すべてのプラットフォーム上で OpenVPN クライアントを使用して、OpenVPN プロトコル経由で接続できます。 [サポートされているクライアント オペレーティング システム](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/vpn-gateway-vpn-faq#supportedclientos)の一覧を参照してください。

### ポイント対サイト接続の認証の種類は変更できますか。

はい。 ポータルで、**[VPN ゲートウェイ]**>**[ポイント対サイト構成]** に移動します。 **[認証の種類]** では、使用する認証の種類を選択します。

認証の種類を変更した後、新しい VPN クライアント構成プロファイルを生成してダウンロードし、各 VPN クライアントに適用するまで、現在のクライアントが接続できない場合があります。

### 新しい VPN クライアント プロファイルの構成パッケージを生成する必要があるのはどんな場合ですか?

トンネルの種類の追加や認証の種類の変更など、P2S VPN ゲートウェイの構成設定を変更する場合は、新しい VPN クライアント プロファイルの構成パッケージを生成する必要があります。 新しいパッケージには、VPN クライアントが P2S ゲートウェイに接続するために必要な更新された設定が含まれています。 パッケージを生成したら、ファイルの設定を使用して VPN クライアントを更新します。

### Azure は、Windows で IKEv2 VPN をサポートしていますか。

IKEv2 は、Windows 10 および Windows Server 2016 でサポートされています。 ただし、特定の OS バージョンで IKEv2 を使用するには、更新プログラムをインストールして、ローカルでレジストリ キーの値を設定する必要があります。 Windows 10 より前の OS バージョンはサポートされておらず、SSTP または OpenVPN プロトコルのみを使用できます。

注意

Windows 10 バージョン 1709 および Windows Server 2016 バージョン 1607 よりも新しい Windows OS ビルドでは、これらの手順は不要です。

Windows 10 または Windows Server 2016 を IKEv2 用に準備するには:

1. OS のバージョンに基づいて更新プログラムをインストールします。 
    
    
    | OS バージョン | Date | 数/リンク |
    | --- | --- | --- |
    | Windows Server 2016Windows 10 バージョン 1607 | 2018 年 1 月 17 日 | [KB4057142](https://support.microsoft.com/help/4057142/windows-10-update-kb4057142) |
    | Windows 10 バージョン 1703 | 2018 年 1 月 17 日 | [KB4057144](https://support.microsoft.com/help/4057144/windows-10-update-kb4057144) |
    | Windows 10 バージョン 1709 | 2018 年 3 月 22 日 | [KB4089848](https://www.catalog.update.microsoft.com/search.aspx?q=kb4089848) |
    |  |  |  |
2. レジストリ キーの値を設定します。 レジストリで `HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Services\RasMan\ IKEv2\DisableCertReqPayloadREG_DWORD` キーを作成するか、`1` に設定します。

### ポイント対サイト接続の IKEv2 トラフィック セレクターの制限は何ですか。

Windows 10 バージョン 2004 (2021 年 9 月リリース) では、トラフィック セレクターの制限が 255 に増えています。 以前のバージョンの Windows では、トラフィック セレクターの制限は 25 です。

Windows のトラフィック セレクターの制限は、仮想ネットワーク内のアドレス空間の最大数と、ローカル ネットワーク、VNet 間接続、およびゲートウェイに接続されているピアリングされた VNet の最大合計を決定します。 Windows ベースのポイント対サイト クライアントは、この制限を超えた場合、IKEv2 経由で接続に失敗します。

### ポイント対サイト接続に対する OpenVPN トラフィック セレクターの制限はどのようなものですか?

OpenVPN のトラフィック セレクターは 1,000 ルートに制限されています。

### P2S VPN 接続に対して SSTP と IKEv2 の両方を構成した場合、何が起こりますか。

Windows デバイスと Mac デバイスで構成される混在環境で SSTP と IKEv2 の両方を構成する場合、Windows VPN クライアントは常に最初に IKEv2 トンネルを試行します。 IKEv2 接続が成功しなかった場合、クライアントは SSTP にフォールバックします。 MacOS は IKEv2 経由でのみ接続します。

ゲートウェイで SSTP と IKEv2 の両方が有効になっている場合、ポイント対サイトのアドレス プールは 2 つの間で静的に分割されるため、異なるプロトコルを使用するクライアントの IP アドレスは、どちらかのサブ範囲からのものになります。 アドレス範囲が /24 より大きい場合でも、SSTP クライアントの最大数は常に 128 です。 その結果、IKEv2 クライアントで使用できるアドレスの数が多くなります。 それより小さい範囲の場合、プールは均等に二分割されます。 ゲートウェイが使用するトラフィック セレクターには、ポイント対サイトのアドレス範囲の Classless Inter-Domain Routing (CIDR) ブロックが含まれていない場合がありますが、2 つのサブ範囲の CIDR ブロックが含まれている場合があります。

### Azure で P2S VPN をサポートしているプラットフォームはどれですか?

Azure では、P2S VPN 向けに Windows、Mac、および Linux がサポートされています。

### VPN ゲートウェイを既にデプロイしています。 ここで RADIUS または IKEv2 VPN または両方を有効にできますか?

はい。 使用しているゲートウェイ SKU が RADIUS または IKEv2 をサポートしている場合は、Azure PowerShell または Azure portal を使用して、既にデプロイしたゲートウェイでこれらの機能を有効にすることができます。 Basic SKU では RADIUS も IKEv2 もサポートされていません。

### P2S 接続の構成を削除するにはどうすればよいですか。

P2S 構成は、次の Azure PowerShell または Azure CLI コマンドを使用して削除できます:

```
$gw=Get-AzVirtualNetworkGateway -name <gateway-name>`
$gw.VPNClientConfiguration = $null`
Set-AzVirtualNetworkGateway -VirtualNetworkGateway $gw`

```

```
az network vnet-gateway update --name <gateway-name> --resource-group <resource-group name> --remove "vpnClientConfiguration"

```

## 証明書認証を使用したポイント対サイト接続

### ポイント対サイト証明書認証接続で証明書の不一致が発生した場合はどうすればよいですか?

**[証明書を検証してサーバーの ID を確認する]** チェック ボックスをオフにします。 または、プロファイルを手動で作成するときに、サーバーの完全修飾ドメイン名 (FQDN) と証明書を追加します。 これを行うには、コマンド プロンプトから `rasphone` を実行し、ドロップダウン リストからプロファイルを選択します。

一般的に、サーバー ID の検証をバイパスすることはお勧めしません。 ただし、Azure 証明書認証では、VPN トンネリング プロトコル (IKEv2 または SSTP) と拡張認証プロトコル (EAP) でのサーバー検証にも同じ証明書が使用されます。 VPN トンネリング プロトコルは既にサーバー証明書と FQDN を検証しているため、EAP でもう一度検証することのは冗長的です。

![](https://learn.microsoft.com/ja-jp/azure/includes/media/vpn-gateway-faq-p2s-all-include/servercert.png)

### 内部 PKI ルート CA を使用して、ポイント対サイト接続用に証明書を生成できますか?

はい。 以前は、自己署名ルート証明書のみを使用できました。 現在も 20 ルート証明書までアップロードできます。

### Azure Key Vault の証明書を使用できますか?

いいえ。

### 証明書の作成にどのようなツールを使用できますか。

エンタープライズ公開キー基盤 (PKI) ソリューション (内部 PKI)、Azure PowerShell、MakeCert、OpenSSL を使用できます。

### 証明書の設定およびパラメーターに関する指示はありますか。

.cer ファイル形式と .pfx ファイル形式については、次を参照してください:

- [PowerShell](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/vpn-gateway-certificates-point-to-site)
- [MakeCert](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/vpn-gateway-certificates-point-to-site-makecert)

.pem ファイル形式については、次を参照してください。

- [Linux - OpenSSL](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/point-to-site-certificates-linux-openssl)
- [Linux: strongSwan](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/vpn-gateway-certificates-point-to-site-linux)

## RADIUS 認証を使用したポイント対サイト接続

### RADIUS 認証はすべての Azure VPN Gateway SKU でサポートされていますか。

RADIUS 認証は、Basic SKU を除くすべての SKU でサポートされます。

従来の SKU の場合、Standard SKU と High Performance SKU で RADIUS 認証をサポートしています。

### クラシック デプロイ モデルでは RADIUS 認証がサポートされていますか。

いいえ。

### RADIUS サーバーに送信される RADIUS 要求のタイムアウト期間はどのくらいですか。

RADIUS 要求は 30 秒後にタイムアウトになるように設定されています。 ユーザー定義のタイムアウト値は現在サポートされていません。

### サード パーティ製の RADIUS サーバーはサポートされていますか?

はい。

### Azure ゲートウェイがオンプレミスの RADIUS サーバーに到達できるための接続の要件は何ですか?

適切なルートが構成されているオンプレミスのサイトに対するサイト間 VPN 接続が必要です。

### ExpressRoute 接続を使って (VPN ゲートウェイから) オンプレミスの RADIUS サーバーに対するトラフィックをルーティングすることはできますか?

いいえ。 サイト対サイト接続でのみルーティングできます。

### RADIUS 認証でサポートされる SSTP 接続の数に変更はありますか? サポートされる SSTP 接続と IKEv2 接続の最大数はそれぞれどのくらいですか?

RADIUS 認証を使用するゲートウェイでサポートされる SSTP 接続の最大数には変更ありません。 SSTP については 128 のままですが、IKEv2 のゲートウェイ SKU によって異なります。 サポートされる接続の数の詳細については、「[ゲートウェイ SKUについて](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/about-gateway-skus)」を参照してください。

### RADIUS サーバーによる証明書認証と、信頼された証明書のアップロードによる Azure ネイティブ証明書認証の違いは何ですか?

RADIUS による証明書認証では、認証要求が証明書の検証を担当する RADIUS サーバーに転送されます。 このオプションは、RADIUS を使用する証明書認証インフラストラクチャが既にあり、それを統合したい場合に有用です。

証明書認証に Azure を使用する場合には、VPN ゲートウェイが証明書の検証を担当します。 ユーザーの側では、ゲートウェイに証明書の公開キーをアップロードする必要があります。 このほか、接続を許可してはならない失効した証明書の一覧を指定することもできます。

### RADIUS 認証は、多要素認証のネットワーク ポリシー サーバー統合をサポートしていますか?

多要素認証がテキスト ベース (SMS やモバイル アプリ検証コードなど) で、ユーザーが VPN クライアント UI にコードまたはテキストを入力する必要がある場合、認証は成功しないため、サポートされているシナリオではありません。 「[多要素認証のために、Azure VPN Gateway RADIUS 認証と NPS サーバーを統合する](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/vpn-gateway-radius-mfa-nsp)」を参照してください。

### RADIUS 認証は、IKEv2 と SSTP VPN の両方で機能しますか?

はい、RADIUS 認証は、IKEv2 と SSTP VPN の両方でサポートされています。

### RADIUS 認証は、OpenVPN クライアントで機能しますか。

OpenVPN プロトコルでは、RADIUS 認証はサポートされていません。

## VNet 間接続とマルチサイト接続

このセクションの VNet 間情報は、VPN ゲートウェイ接続に適用されます。 VNet ピアリングについては、「[仮想ネットワーク ピアリング](https://learn.microsoft.com/ja-jp/azure/virtual-network/virtual-network-peering-overview)」を参照してください。

### Azure では VNet 間のトラフィックに対して料金が発生しますか。

VPN ゲートウェイ接続を使用している場合は、同じリージョン内の VNet 間トラフィックは双方向で無料です。 リージョンを越えて送信される VNet 間エグレス トラフィックには、ソース リージョンに基づき、アウトバウンド VNet 内データ転送料金が課せられます。 詳細については、「[Azure VPN Gateway の価格](https://azure.microsoft.com/pricing/details/vpn-gateway/)」を参照してください。 VPN ゲートウェイの代わりに VNET ピアリングを使用して VNet を接続している場合は、「[Azure Virtual Network の価格](https://azure.microsoft.com/pricing/details/virtual-network/)」を参照してください。

### VNet 間のトラフィックは、インターネット経由で送信されますか。

いいえ。 VNet 間のトラフィックは、インターネットではなく Microsoft Azure のバックボーンを経由して送信されます。

### Microsoft Entra テナント間で VNet 間接続を確立できますか?

はい。 VPN ゲートウェイを使用する VNet 間接続は、Microsoft Entra テナント間で動作します。

### VNet 間のトラフィックはセキュリティで保護されていますか。

IPsec と IKE 暗号化は、VNet 間トラフィックの保護に役立ちます。

### VNet 同士を接続するには VPN デバイスが必要ですか。

いいえ。 複数の Azure 仮想ネットワークを接続するときは、クロスプレミス接続が必要な場合を除いて、VPN デバイスは必要ありません。

### VNet は同じリージョンに属している必要がありますか。

いいえ。 仮想ネットワークが属している Azure リージョン (場所) は異なっていてもかまいません。

### VNet が同じサブスクリプションにない場合、サブスクリプションを同じ Microsoft Entra テナントに関連付ける必要がありますか?

いいえ。

### 別々の Azure インスタンスに存在する仮想ネットワークを VNet 間接続で接続することはできますか。

いいえ。 VNet 間接続でサポートされるのは、同じ Azure インスタンス内の仮想ネットワークの接続だけです。 たとえば、グローバル Azure と中国/ドイツ/米国政府の Azure インスタンスとの間で接続を作成することはできません。 これらのシナリオについては、サイト間 VPN 接続の使用をご検討ください。

### VNet 間接続はマルチサイト接続と併用できますか。

はい。 仮想ネットワーク接続は、マルチサイト VPN と同時に使用することができます。

### 1 つの仮想ネットワークから接続できるオンプレミス サイトと仮想ネットワークの数を教えてください。

[ゲートウェイの要件](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/about-gateway-skus#benchmark)表を参照してください。

### VNet 間接続を使用して VNet の外部の VM やクラウド サービスを接続することはできますか?

いいえ。 VNet 間接続によって仮想ネットワークを接続できます。 仮想ネットワーク内に存在しない仮想マシンやクラウド サービスを接続することはできません。

### クラウド サービスや負荷分散エンドポイントは複数の VNet にまたがることができますか。

いいえ。 クラウド サービスや負荷分散エンドポイントは、仮にそれらが相互に接続されていたとしても、仮想ネットワークの境界を越えることはできません。

### VNet 間接続やマルチサイト接続にポリシー ベースの VPN の種類を使用することはできますか?

いいえ。 VNet 間接続とマルチサイト接続には、VPN の種類がルート ベース (以前は "*動的ルーティング*" と呼ばれていました) である VPN ゲートウェイが必要です。

### VPN の種類がルート ベースの VNet を VPN の種類がポリシー ベースの VNet に接続できますか?

いいえ。 両方の仮想ネットワークでルート ベース (以前は "*動的ルーティング*" と呼ばれていました) の VPN を使用している必要があります。

### VPN トンネルは帯域幅を共有しますか。

はい。 仮想ネットワークのすべての VPN トンネルは、VPN ゲートウェイで使用可能な帯域幅と、Azure での VPN ゲートウェイのアップタイムに関する同じサービス レベル アグリーメントを共有します。

### 冗長トンネルはサポートされますか。

1 つの仮想ネットワーク ゲートウェイがアクティブ/アクティブ構成になっている場合、仮想ネットワークのペア間の冗長トンネルがサポートされます。

### VNet 間接続の構成で、重複するアドレス空間を使用できますか。

いいえ。 重複する IP アドレス範囲は使用できません。

### 接続されている仮想ネットワークとオンプレミスのローカル サイトで、重複するアドレス空間を使用できますか。

いいえ。 重複する IP アドレス範囲は使用できません。

### サイト間 VPN 接続と ExpressRoute の間のルーティングを有効にするにはどうすればいいですか?

ExpressRoute に接続されているブランチと、サイト間 VPN に接続されているブランチとの間のルーティングを有効にするには、[Azure Route Server](https://learn.microsoft.com/ja-jp/azure/route-server/expressroute-vpn-support) をセットアップする必要があります。

### オンプレミス サイトや別の仮想ネットワークに向けてトラフィックを通過させるときに、VPN ゲートウェイを使用できますか?

- **Resource Manager デプロイ モデル**
    
    はい。 詳細については、「[BGP とルーティング](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/vpn-gateway-vpn-faq#bgp)」セクションを参照してください。
    
- **クラシック デプロイ モデル**
    
    クラシック デプロイ モデルを使用する場合は、VPN ゲートウェイ経由でトラフィックを転送できますが、ネットワーク構成ファイル内の静的に定義されたアドレス空間に依存します。 Border Gateway Protocol (BGP) は、現在、クラシック デプロイ モデルを介した Azure 仮想ネットワークと VPN ゲートウェイではサポートされていません。 BGP がないと、トランジット アドレス空間を手動で定義することはエラーが発生しやすいんため、推奨されません。
    

### Azure では、同一仮想ネットワークのすべての VPN 接続に対して同一の IPsec/IKE 事前共有キーが生成されるのですか?

いいえ。 既定では、Azure は異なる VPN 接続に対してそれぞれ異なる事前共有キーを生成します。 ただし、Set VPN Gateway Key REST API または PowerShell コマンドレットを使用すると、お好みのキー値を設定することができます。 キーには、スペース、ハイフン (-) またはチルダ (~) を除く、印刷可能な ASCII 文字のみを含める必要があります。

### 1 つの仮想ネットワークよりも多くのサイト間 VPN を確立した方がより広い帯域幅を得られるのでしょうか。

いいえ。 ポイント対サイト VPN を含むすべての VPN トンネルは、同一の VPN ゲートウェイとそこで利用可能な帯域幅を共有します。

### 仮想ネットワークとオンプレミス サイトの間に、マルチサイト VPN を使用して複数のトンネルを構成できますか?

はい。ただし、両方のトンネルの BGP を同じ場所に構成する必要があります。

### VPN Gateway では、AS パス プリペンドが優先され、これがオンプレミス サイトへの複数の接続間でのルーティング決定に影響しますか。

はい。Azure VPN Gateway では、BGP が有効になっているときにルーティングの決定を行うために、事前に保留されている自律システム (AS) パスが優先されます。 BGP パスの選択では、より短い AS パスが優先されます。

### 新しい VPN VirtualNetworkGateway 接続を作成するときに RoutingWeight プロパティを使用できますか?

いいえ。 このような設定は ExpressRoute ゲートウェイ接続用に予約されています。 複数の接続間のルーティングの決定に影響を与える場合は、AS パスの事前保留を使用する必要があります。

### 仮想ネットワークを持つポイント対サイト VPN を複数の VPN トンネルで使用できますか。

はい。 ポイント対サイト VPN は、複数のオンプレミス サイトやその他の仮想ネットワークに接続する VPN ゲートウェイと共に使用できます。

### IPsec VPN を使用している仮想ネットワークを自社の ExpressRoute 回線に接続できますか。

はい、これはサポートされています。 詳細については、「[ExpressRoute とサイト間の共存接続の構成](https://learn.microsoft.com/ja-jp/azure/expressroute/expressroute-howto-coexist-classic)」に関する記事を参照してください。

## IPsec/IKE ポリシー

### カスタム IPsec/IKE ポリシーはすべての Azure VPN Gateway SKU でサポートされていますか?

カスタム IPsec/IKE ポリシーは、Basic SKU を除くすべての Azure VPN Gateway SKU でサポートされています。

### 1 つの接続に対してポリシーはいくつ指定できますか。

接続に指定できるポリシーの組み合わせは 1 つだけです。

### 接続で部分的なポリシーを指定できますか (たとえば、IKE アルゴリズムのみを指定し、IPsec を指定しない)?

いいえ。IKE (メイン モード) と IPsec (クイック モード) の両方について、すべてのアルゴリズムとパラメーターを指定する必要があります。 ポリシーを部分的に指定することはできません。

### カスタム ポリシーでサポートされているアルゴリズムとキーの強度は何ですか?

次の表は、構成可能なサポートされている暗号アルゴリズムとキーの強度を一覧にしたものです。 各フィールドについて、オプションを 1 つ選択する必要があります。

| IPsec/IKEv2 | [オプション] |
| --- | --- |
| IKEv2 暗号化 | GCMAES256、GCMAES128、AES256、AES192、AES128 |
| IKEv2 整合性 | SHA384、SHA256、SHA1、MD5 |
| DH グループ | DHGroup24、ECP384、ECP256、DHGroup14、DHGroup2048、DHGroup2、DHGroup1、なし |
| IPsec 暗号化 | GCMAES256、GCMAES192、GCMAES128、AES256、AES192、AES128、DES3、DES、なし |
| IPsec 整合性 | GCMAES256、GCMAES192、GCMAES128、SHA256、SHA1、MD5 |
| PFS グループ | PFS24、ECP384、ECP256、PFS2048、PFS2、PFS1、なし |
| クイック モード SA の有効期間 | (省略可能。指定がない場合は既定値)秒 (整数。最小 300、既定値は 27,000)キロバイト (整数。最小 1,024、既定値は 102,400,000) |
| トラフィック セレクター | `UsePolicyBasedTrafficSelectors` (`$True` または `$False`、省略可能。指定がない場合は既定値である `$False`) |
| DPD タイムアウト | 秒 (整数。最小 9、最大 3,600、既定値は 45) |
- オンプレミス VPN デバイスの構成は、ユーザーが Azure IPsec または IKE ポリシーで指定した次のアルゴリズムおよびパラメーターと一致しているか、それを含んでいる必要があります。
    - IKE 暗号化アルゴリズム (メイン モード、フェーズ 1)
    - IKE 整合性アルゴリズム (メイン モード、フェーズ 1)
    - DH グループ (メイン モード、フェーズ 1)
    - IPsec 暗号化アルゴリズム (クイック モード、フェーズ 2)
    - IPsec 整合性アルゴリズム (クイック モード、フェーズ 2)
    - PFS グループ (クイック モード、フェーズ 2)
    - トラフィック セレクター (`UsePolicyBasedTrafficSelectors` を使用する場合)
    - SA の有効期間 (一致する必要のないローカル仕様)
- IPsec 暗号化アルゴリズムに GCMAES を使用する場合は、IPsec 整合性で同じ GCMAES アルゴリズムとキー長を選択する必要があります。 たとえば、両方に GCMAES128 を使用します。
- アルゴリズムとキーの表では:
    - IKE はメイン モードまたはフェーズ 1 に対応します。
    - IPsec はクイック モードまたはフェーズ 2 に対応しています。
    - DH グループは、メイン モードまたはフェーズ 1 で使用される Diffie-Hellman グループを指定します。
    - PFS グループは、クイック モードまたはフェーズ 2 で使用される Diffie-Hellman グループを指定します。
- IKE メイン モード SA の有効期間は、Azure VPN ゲートウェイで 28,800 秒に固定します。
- `UsePolicyBasedTrafficSelectors` は、接続上のオプション パラメーターです。 接続上で `UsePolicyBasedTrafficSelectors` を `$True` に設定すると、オンプレミスのポリシーベース VPN ファイアウォールに接続するように VPN ゲートウェイが構成されます。
    
    `UsePolicyBasedTrafficSelectors` を有効にする場合は、VPN デバイスで、Any-to-Any ではなく、オンプレミス ネットワーク (ローカル ネットワーク ゲートウェイ) プレフィックスと Azure 仮想ネットワーク プレフィックスの双方向のすべての組み合わせについて、一致トラフィック セレクターが定義されていることを確認します。 この VPN ゲートウェイは、VPN ゲートウェイで構成されている内容に関係なく、リモート VPN ゲートウェイが提案するトラフィック セレクターをすべて受け入れます。
    
    たとえば、オンプレミス ネットワークのプレフィックスが 10.1.0.0/16 と 10.2.0.0/16 で、仮想ネットワークのプレフィックスが 192.168.0.0/16 と 172.16.0.0/16 である場合、次のトラフィック セレクターを指定する必要があります。
    
    - 10.1.0.0/16 <====> 192.168.0.0/16
    - 10.1.0.0/16 <====> 172.16.0.0/16
    - 10.2.0.0/16 <====> 192.168.0.0/16
    - 10.2.0.0/16 <====> 172.16.0.0/16
    
    ポリシーベースのトラフィック セレクターについて詳しくは、「[VPN ゲートウェイを複数のオンプレミスのポリシー ベースの VPN デバイスに接続する](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/vpn-gateway-connect-multiple-policybased-rm-ps)」をご覧ください。
    
- タイムアウトを短い期間に設定するほど、IKE はより積極的にキー更新を行います。 場合によっては、そのとき接続が切断されるように見えることがあります。 この状況は、オンプレミスの場所が VPN ゲートウェイが存在する Azure リージョンから離れている場合や、物理的なリンク条件によってパケット損失が発生する可能性がある場合には望ましくない場合があります。 一般的には、タイムアウトを "30 秒から 45 秒の間" に設定することをお勧めします。

詳細については、「[VPN ゲートウェイを複数のオンプレミスのポリシーベースの VPN デバイスに接続する](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/vpn-gateway-connect-multiple-policybased-rm-ps)」を参照してください。

### カスタム ポリシーでサポートされている Diffie-Hellman グループはどれですか?

次の表に、カスタム ポリシーでサポートされる対応する Diffie-Hellman グループを示します:

| Diffie-Hellman グループ | DHGroup | PFSGroup | キーの長さ |
| --- | --- | --- | --- |
| 1 | DHGroup1 | PFS1 | 768 ビット MODP |
| 2 | DHGroup2 | PFS2 | 1024 ビット MODP |
| 14 | DHGroup14DHGroup2048 | PFS2048 | 2048 ビット MODP |
| 19 | ECP256 | ECP256 | 256 ビット ECP |
| 20 | ECP384 | ECP384 | 384 ビット ECP |
| 24 | DHGroup24 | PFS24 | 2048 ビット MODP |

詳細については、[RFC3526](https://tools.ietf.org/html/rfc3526) と [RFC5114](https://tools.ietf.org/html/rfc5114) を参照してください。

### VPN ゲートウェイに対する既定の IPsec/IKE ポリシー セットは、カスタム ポリシーによって置き換えられるのでしょうか?

はい。 接続でカスタム ポリシーを指定した後、Azure VPN Gateway では、IKE イニシエーターと IKE レスポンダーの両方として、そのポリシーのみが接続で使用されます。

### カスタム IPsec/IKE ポリシーを削除した場合、接続は保護されなくなるのですか。

いいえ、IPsec/IKE は接続の保護に引き続き役立ちます。 接続からカスタム ポリシーを削除した後、VPN ゲートウェイは[既定の IPsec/IKE 候補リスト](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/vpn-gateway-about-vpn-devices#RouteBasedOffers)に戻り、オンプレミス VPN デバイスとの IKE ハンドシェイクを開始し直します。

### IPsec/IKE ポリシーを追加または更新した場合、VPN 接続は中断されますか。

はい。 VPN ゲートウェイは既存の接続を破棄し、IKE ハンドシェイクを開始し直して、新しい暗号化アルゴリズムとパラメーターを使って IPsec トンネルを再確立するため、短い中断 (数秒) が発生する可能性があります。 中断を最小限に抑えるため、オンプレミスの VPN デバイスも一致するアルゴリズムとキー強度を使って構成されていることを確認してください。

### 接続ごとに異なるポリシーを使用することはできますか。

はい。 カスタム ポリシーは接続ごとに適用されます。 接続ごとに異なる IPsec/IKE ポリシーを作成して適用することができます。

また、接続の一部に対してカスタム ポリシーを適用することもできます。 それ以外の部分では、Azure の既定の IPsec/IKE ポリシー セットが使用されます。

### VNet 間接続でカスタム ポリシーを使用できますか?

はい。 カスタム ポリシーは、IPsec クロスプレミス接続と VNet 間接続のどちらにでも適用できます。

### VNet 間接続の両方のリソースに同じポリシーを指定する必要はありますか。

はい。 VNet 間トンネルは、Azure 内の 2 つの接続リソースで構成されます (1 方向につき 1 つ)。 両方の接続リソースに同じポリシーがあることを確認します。 それ以外の場合、VNet 間接続は確立されません。

### DPD タイムアウトの既定値は何ですか。 別の DPD タイムアウトを指定できますか。

VPN ゲートウェイの既定の DPD タイムアウトは 45 秒です。 IPsec または VNet 間接続ごとに、9 秒から 3,600 秒の範囲で、異なる DPD タイムアウト値を指定できます。

注意

タイムアウトを短い期間に設定するほど、IKE はより積極的にキー更新を行います。 場合によっては、そのとき接続が切断されるように見えることがあります。 この状況は、オンプレミスの場所が VPN ゲートウェイが存在する Azure リージョンから離れている場合や、物理的なリンク条件によってパケット損失が発生する可能性がある場合には望ましくない場合があります。 一般的には、タイムアウトを "30 秒から 45 秒の間" に設定することをお勧めします。

### ExpressRoute 接続でカスタム IPsec/IKE ポリシーは機能しますか?

いいえ。 IPsec/IKE ポリシーは、VPN ゲートウェイを介した サイト間 VPN と VNet 間接続でのみ機能します。

### プロトコルの種類 IKEv1 または IKEv2 で接続を作成するにはどうすればよいですか?

Basic SKU、Standard SKU、その他の[以前の SKU](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/vpn-gateway-about-skus-legacy#gwsku) を除き、すべてのルート ベースの VPN タイプの SKU で IKEv1 接続を作成できます。

接続の作成時に、接続プロトコルの種類として IKEv1 または IKEv2 を指定できます。 接続プロトコルの種類を指定しない場合は、IKEv2 が既定のオプションとして使用されます (該当する場合)。 詳細については、[Azure PowerShell コマンドレット](https://learn.microsoft.com/ja-jp/powershell/module/az.network/new-azvirtualnetworkgatewayconnection)に関するドキュメントを参照してください。

SKU の種類と IKEv1 と IKEv2 のサポートについては、「[VPN ゲートウェイを複数のオンプレミスのポリシー ベースの VPN デバイスに接続する](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/vpn-gateway-connect-multiple-policybased-rm-ps)」を参照してください。

### IKEv1 と IKEv2 の接続間での転送は許可されていますか。

はい。

### ルート ベースの VPN の種類に対して Basic SKU で IKEv1 サイト間接続を作成できますか?

いいえ。 Basic SKU では、この構成はサポートされていません。

### 接続の作成後に接続プロトコルの種類を変更できますか (IKEv1 から IKEv2 またはその逆)。

いいえ。 接続を作成した後は、IKEv1 プロトコルと IKEv2 プロトコルを変更することはできません。 削除し、必要なプロトコルの種類を使用して新しい接続を作成し直す必要があります。

### IKEv1 接続が頻繁に再接続される理由

静的ルーティングまたはルートベースの IKEv1 接続が一定の間隔で切断している場合は、VPN ゲートウェイがインプレースでのキーの更新をサポートしていないためである可能性があります。 メイン モードがキー更新されている場合、IKEv1 トンネルは切断され、再接続に最大 5 秒かかります。 メイン モードのネゴシエーション タイムアウト値によって、キー更新の頻度が決まります。 この再接続を防ぐには、インプレース キー更新をサポートする IKEv2 の使用に切り替えます。

接続がランダムな時間で再接続される場合は、[トラブルシューティング ガイド](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/vpn-gateway-troubleshoot-site-to-site-disconnected-intermittently)に従ってください。

### 構成の詳細と手順はどこで確認できますか?

次の記事をご覧ください。

- [サイト間 VPN と VNet 間のカスタム IPsec/IKE 接続ポリシーを構成する: Azure portal](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/ipsec-ike-policy-howto)
- [サイト間 VPN および VNet 間のカスタム IPsec/IKE 接続ポリシーを構成する: PowerShell](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/vpn-gateway-ipsecikepolicy-rm-powershell)

## BGP とルーティング

### BGP はすべての Azure VPN Gateway SKU でサポートされていますか。

BGP は、Basic SKU を除くすべての Azure VPN Gateway SKU でサポートされています。

### Azure Policy の VPN Gateway では BGP を使用できますか。

いいえ、BGP は、ルートベースの VPN Gateway でのみサポートされています。

### どのような ASN を使用できますか?

オンプレミスのネットワークと Azure 仮想ネットワークの両方に対して独自のパブリック自律システム番号 (ASN) またはプライベート ASN を使用できます。

次の予約済み ASN を使用することはできません:

- Azure によって予約済み:
    - パブリック ASN: 8074, 8075, 12076
    - プライベート ASN: 65515, 65517, 65518, 65519, 65520
- [IANA によって予約済み](http://www.iana.org/assignments/iana-as-numbers-special-registry/iana-as-numbers-special-registry.xhtml):
    - 23456、64496-64511、65535-65551、429496729

これらの AS 番号は、VPN ゲートウェイに接続する際にオンプレミスの VPN デバイスには指定できません。

### 32 ビット (4 バイト) の AS 番号を使用できますか。

はい、Azure VPN Gateway では 32 ビット (4 バイト) の AS 番号がサポートされるようになりました。 10 進数形式の AS 番号を使用してを構成するには、PowerShell、Azure CLI、または Azure SDK を使用します。

### どのプライベート AS 番号を使用できますか。

プライベート AS 番号の有効な範囲は次のとおりです。

- 64512 ～ 65514 および 65521 ～ 65534

これらの AS 番号は IANA でも Azure でも予約されないため、VPN ゲートウェイに割り当てることができます。

### Azure VPN Gateway では、BGP ピア IP にどのようなアドレスが使用されますか?

既定では、Azure VPN Gateway は、アクティブ/スタンバイ VPN ゲートウェイに対して `GatewaySubnet` 範囲から 1 つの IP アドレスを割り当てます。アクティブ/アクティブ VPN ゲートウェイには 2 つの IP アドレスを割り当てます。 これらのアドレスは、VPN Gateway の作成時に自動的に割り当てられます。

割り当てられた BGP IP アドレスは、Azure PowerShell または Azure portal を使用して確認できます。 PowerShell で `Get-AzVirtualNetworkGateway` を使用し、`bgpPeeringAddress` プロパティを探します。 Azure portal の **[ゲートウェイの構成]** ページで、 **[BGP AS 番号の構成]** プロパティを確認します。

オンプレミスの VPN ルーターが BGP IP アドレスとして自動プライベート IP アドレス指定 (APIPA) IP アドレス (169.254.x.x) を使用している場合は、VPN ゲートウェイで、1 つ以上の Azure APIPA BGP IP アドレスを指定する必要があります。 Azure VPN Gateway では、ローカル ネットワーク ゲートウェイに指定されているオンプレミスの APIPA BGP ピアで使用する APIPA アドレス、または非 APIPA のオンプレミス BGP ピア用のプライベート IP アドレスが選択されます。 詳細については、「[Azure VPN Gateway の BGP の構成](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/bgp-howto)」をご覧ください。

### VPN デバイスの BGP ピア IP アドレスに関する要件はどんなものですか。

オンプレミスの BGP ピア アドレスを、ご使用の VPN デバイスまたは VPN Gateway の VNet アドレス空間のパブリック IP アドレスと同じにすることはできません。 VPN デバイスでは BGP ピア IP に別の IP アドレスを使用してください。 デバイス上のループバック インターフェイスに割り当てられたアドレス (通常の IP アドレスまたは APIPA アドレス) を使用することができます。

デバイスで BGP に APIPA アドレスを使用する場合は、「[Azure VPN Gateway の BGP の構成](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/bgp-howto)」の説明に従って、VPN ゲートウェイで 1 つ以上の APIPA BGP IP アドレスを指定する必要があります。 この場所を表している、対応するローカル ネットワーク ゲートウェイにこれらのアドレスを指定します。

### BGP を使用する際、ローカル ネットワーク ゲートウェイのアドレス プレフィックスとして何を指定する必要がありますか。

重要

これは、以前に記載された要件からの変更です。

Azure VPN Gateway では、IPsec トンネルを介したオンプレミスの BGP ピア IP へのホスト ルートが内部的に追加されます。 /32 ルートは冗長であるため、**[アドレス空間]** フィールドに追加しないでください。 オンプレミスの VPN デバイスの BGP IP として APIPA アドレスを使用する場合、このフィールドに追加することはできません。

**[アドレス空間]** フィールドにその他のプレフィックスを追加すると、BGP 経由で学習したルートに加えて、Azure VPN Gateway で静的ルートとして追加されます。

### オンプレミスの VPN ネットワークと Azure 仮想ネットワークの両方に同じ AS 番号を使用できますか。

いいえ。 BGP を使用して接続している場合は、オンプレミスのネットワークと Azure 仮想ネットワークに異なる AS 番号を割り当てる必要があります。

Azure VPN Gateway には、クロスプレミス接続向けに BGP が有効になっているかどうかにかかわらず、AS 番号の既定値として 65515 が割り当てられています。 VPN Gateway を作成する際に異なる AS 番号を割り当てて既定値をオーバーライドするか、ゲートウェイの作成後に AS 番号を変更することができます。 対応する Azure ローカル ネットワーク ゲートウェイにオンプレミスの AS 番号を割り当てる必要があります。

### Azure VPN Gateway はどんなアドレス プレフィックスを私にアドバタイズしますか?

ゲートウェイでは、オンプレミスの BGP デバイスに次のルートをアドバタイズします。

- VNet のアドレス プレフィックス
- VPN ゲートウェイに接続されている各ローカル ネットワーク ゲートウェイのアドレス プレフィックス
- VPN ゲートウェイに接続されている他の BGP ピアリング セッションから学習したルート。ただし、既定のルートまたは仮想ネットワーク プレフィックスと重複しているルートは除外されます

### 何個のプレフィックスを Azure VPN Gateway にアドバタイズできますか。

Azure VPN Gateway では最大 4,000 個のプレフィックスがサポートされます。 プレフィックスの数がこの制限を超えると、BGP セッションは切断されます。

### VPN ゲートウェイへの既定のルート (0.0.0.0/0) をアドバタイズできますか?

はい。 既定のルートをアドバタイズすると、すべての VNet エグレス トラフィックがオンプレミス サイトに強制的に送信されます。 また、仮想ネットワーク VM が、リモート デスクトップ プロトコル (RDP) や Secure Shell (SSH) など、インターネットから VM へのパブリック通信を直接受け入れることもできなくなります。

### 自分の仮想ネットワーク プレフィックスとまったく同じプレフィックスをアドバタイズすることはできますか。

いいえ。 Azure では、いずれかの VNet アドレス プレフィックスと同じプレフィックスのアドバタイズをブロックまたはフィルター処理します。 ただし、仮想ネットワークの内部に存在するアドレス空間のスーパーセットであるプレフィックスをアドバタイズすることができます。

たとえば、仮想ネットワークでアドレス空間 10.0.0.0/16 が使用された場合、10.0.0.0/8 をアドバタイズすることができます。 しかし、10.0.0.0/16 や 10.0.0.0/24 をアドバタイズすることはできません。

### 仮想ネットワーク間の接続に BGP を使用できますか。

はい。 クロスプレミス接続と仮想ネットワーク間接続の両方で BGP を使用できます。

### Azure VPN Gateway で BGP 接続を BGP 以外の接続と混在させることはできますか。

はい、同じ Azure VPN Gateway に対して BGP 接続と非 BGP 接続の両方を混在させることができます。

### Azure VPN Gateway では、BGP トランジット ルーティングをサポートしていますか。

はい。 BGP トランジット ルーティングはサポートされています。ただし、VPN ゲートウェイは既定のルートを他の BGP ピアにアドバタイズしません。 複数の VPN ゲートウェイでトランジット ルーティングを有効にするには、仮想ネットワーク間のすべての中間接続で BGP を有効にする必要があります。 詳細情報は、「[BGP および VPN Gateway について](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/vpn-gateway-bgp-overview)」を参照してください。

### VPN ゲートウェイとオンプレミス ネットワークの間で複数のトンネルを確立することはできますか?

はい、VPN ゲートウェイとオンプレミス ネットワークの間に複数のサイト間 VPN トンネルを確立することができます。 これらのトンネルはすべて Azure VPN Gateway のトンネルの合計数にカウントされる点に注意してください。さらに、両方のトンネルの BGP を有効にする必要があります。

たとえば、VPN ゲートウェイとオンプレミス ネットワークのいずれかの間に 2 つの冗長トンネルがある場合は、VPN ゲートウェイの合計クォータから 2 つのトンネルが消費されることになります。

### BGP で 2 つの Azure 仮想ネットワークの間に複数のトンネルを確立することはできますか。

はい、ただし少なくとも 1 つの仮想ネットワーク ゲートウェイが、アクティブ/アクティブ構成になっている必要があります。

### Azure ExpressRoute とサイト間 VPN の共存構成でサイト間 VPN に BGP を使用することはできますか?

はい。

### BGP ピアリング セッション向けにオンプレミスの VPN デバイスに何を追加する必要がありますか。

VPN デバイスに Azure BGP ピア IP アドレスのホスト ルートを追加します。 このルートは、IPsec サイト間 VPN トンネルを指しています。

たとえば、Azure VPN ピア IP が 10.12.255.30 の場合は、10.12.255.30 のホスト ルートを VPN デバイスに追加し、対応する IPsec トンネル インターフェイスの次ホップ インターフェイスを指定する必要があります。

### 仮想ネットワーク ゲートウェイは、BGP を使用したサイト間接続用の BFD をサポートしていますか。

いいえ。 双方向フォワーディング検出 (BFD) は、BGP と共に使用して、標準の BGP キープアライブ間隔を使用して、近隣のダウンタイムをより迅速に検出できるプロトコルです。 BFD では、LAN 環境で動作するように設計された秒未満タイマーが使用されますが、パブリック インターネットや WAN 接続向けではありません。

パブリック インターネット経由の接続では、特定のパケットが遅延したりドロップされたりすることは珍しくありません。そのため、これらの積極的なタイマーの導入は不安定さを増長する可能性があります。 この不安定性により、BGP がルートを減衰させる可能性があります。

別の方法として、既定の 60 秒のキープアライブ間隔未満のタイマー、または 180 秒のホールド タイマー未満のタイマーを使用して、オンプレミス デバイスを構成することもできます。 この構成により、収束時間が短縮されます。 ただし、既定の 60 秒間のキープアライブ間隔未満のタイマー、または既定の 180 秒間のホールド タイマー未満のタイマーは信頼することができません。 タイマーは既定値以上にすることをお勧めします。

### VPN ゲートウェイは、BGP ピアリング セッションまたは接続を開始しますか?

VPN ゲートウェイは、VPN ゲートウェイのプライベート IP アドレスを使用して、ローカル ネットワーク ゲートウェイ リソースに指定されたオンプレミス BGP ピア IP アドレスに対する BGP ピアリング セッションを開始します。 このプロセスは、オンプレミスの BGP IP アドレスが APIPA 範囲内にあるか、通常のプライベート IP アドレスであるかに関係ありません。 オンプレミス VPN デバイスに BGP IP として APIPA アドレスが使用されている場合、接続を開始するための構成を BGP スピーカーに対して行う必要があります。

### 強制トンネリングを構成できますか。

はい。 [強制トンネリングについて](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/vpn-gateway-about-forced-tunneling)を参照してください。

## NAT

### NAT はすべての Azure VPN Gateway SKU でサポートされていますか?

NAT は、VpnGw2 から VpnGw25、および VpnGw2AZ から VpnGw5AZ でサポートされています。

### VNet 間接続や P2S 接続で NAT は使用できますか。

いいえ。

### VPN Gateway で使用できる NAT 規則はいくつですか。

VPN ゲートウェイには、最大 100 個の NAT 規則 (イングレス規則とエグレス規則の合計) を作成できます。

### NAT 規則名にスラッシュ (/) を使用できますか?

いいえ。 エラーが表示されます。

### NAT は、VPN Gateway のすべての接続に適用されるのですか。

NAT は、NAT 規則が設定されている接続に適用されます。 接続に NAT 規則が設定されていない場合、その接続では NAT は無効となります。 同じ VPN ゲートウェイに、NAT のある接続と NAT のない接続を混在させることができます。

### VPN ゲートウェイでサポートされている NAT の種類は何ですか?

VPN ゲートウェイでサポートされるのは 1:1 の静的 NAT と動的 NAT のみです。 NAT64 はサポートされません。

### アクティブ/アクティブの VPN Gateway で NAT は機能しますか。

はい。 NAT は、アクティブ/アクティブとアクティブ/スタンバイの両方の VPN Gateway で機能します。 各 NAT 規則は、VPN ゲートウェイの 1 つのインスタンスに適用されます。 アクティブ/アクティブ ゲートウェイで、**[IP 構成 ID]** フィールドを使用して、ゲートウェイ インスタンスごとに個別の NAT 規則を作成します。

### NAT は BGP 接続で機能しますか。

はい。NAT で BGP を使用できます。 重要な考慮事項をいくつか以下に示します。

- 学習済みのルートとアドバタイズされたルートが、接続に関連付けられている NAT 規則に基づいて NAT 後のアドレス プレフィックス (外部マッピング) に確実に変換されるよう、NAT 規則の構成ページで **[BGP ルートの変換を有効にする]** を選択します。 オンプレミスの BGP ルーターが、**IngressSNAT** 規則に定義されているとおりにプレフィックスをアドバタイズする必要があります。
- APIPA ではない通常のアドレスがオンプレミス VPN ルーターで使用されていて、それが VNet アドレス空間や他のオンプレミス ネットワーク空間と競合する場合は、**IngressSNAT** 規則で BGP ピア IP を重複しない一意のアドレスに変換してください。 ローカル ネットワーク ゲートウェイの **[BGP ピアの IP アドレス]** フィールドには NAT 後のアドレスを設定してください。
- NAT は BGP APIPA アドレスではサポートされていません。

### SNAT 規則に対応する DNAT 規則を作成する必要はありますか。

いいえ。 1 つの送信元ネットワーク アドレス変換 (SNAT) 規則で、特定のネットワークの "両" 方向の変換が定義されます。

- **IngressSNAT** 規則では、オンプレミス ネットワークから VPN ゲートウェイに入ってくる送信元 IP アドレスの変換が定義されます。 また、仮想ネットワークから同じオンプレミス ネットワークへの移行先 IP アドレスの変換も処理します。
- **EgressSNAT** 規則では、オンプレミス ネットワークに向かって VPN ゲートウェイから出ていく VNet の送信元 IP アドレスの変換が定義されます。 また、**EgressSNAT** 規則が設定された接続を介して仮想ネットワークに送信されるパケットの宛先 IP アドレスの変換も処理します。

どちらの場合も、宛先ネットワーク アドレス変換 (DNAT) 規則は必要ありません。

### VNet またはローカル ネットワーク ゲートウェイのアドレス空間に複数のプレフィックスがある場合は、どうすればよいでしょうか。 NAT を適用できるのはそれらのすべてですか、サブセットのみですか?

プレフィックスごとに NAT 規則を 1 つ作成する必要があります。というのは、各 NAT 規則に含めることができる NAT のアドレス プレフィックスは 1 つだけだからです。 たとえば、ローカル ネットワーク ゲートウェイのアドレス空間が 10.0.1.0/24 と 10.0.2.0/25 から成る場合、次のように 2 つの規則を作成できます:

- **IngressSNAT** 規則 1: 10.0.1.0/24 を 100.0.1.0/24 にマップ。
- **IngressSNAT 規則** 2: 10.0.2.0/25 を 100.0.2.0/25 にマップ。

2 つの規則で、対応するアドレス プレフィックスのプレフィックス長が一致している必要があります。 同じガイドラインが、VNet アドレス空間の **EgressSNAT** 規則にも適用されます。

重要

上記の接続に 1 つしか規則をリンクさせなかった場合、もう一方のアドレス空間は変換されません。

### 外部マッピングに使用できる IP の範囲は何ですか?

外部マッピングには、パブリック IP とプライベート IP を含む、任意の適切な IP 範囲を使用できます。

### 複数の EgressSNAT 規則を使用して、VNet アドレス空間をオンプレミス ネットワークの異なるプレフィックスに変換することはできますか?

はい。 同じ VNet アドレス空間に複数の **EgressSNAT** 規則を作成してから、その **EgressSNAT** 規則を異なる接続に適用することができます。

### 同じ IngressSNAT 規則を異なる接続に使用できますか。

はい。 冗長性を確保するために同じオンプレミス ネットワークに対する接続が複数ある場合、一般的には、同じ **IngressSNAT** 規則を使用します。 複数の接続が別々のオンプレミス ネットワーク用である場合は、同じイングレス規則を使用することはできません。

### NAT 接続にはイングレスとエグレスの両方の規則が必要なのですか?

オンプレミス ネットワークのアドレス空間が VNet のアドレス空間と重複するときは、同じ接続にイングレス規則とエグレス規則の両方が必要です。 VNet のアドレス空間が、接続されているすべてのネットワークで一意である場合、それらの接続に **EgressSNAT** 規則は必要ありません。 イングレス規則を使用すると、オンプレミス ネットワーク間でのアドレスの重複を回避できます。

### IP 構成 ID として何を選択しますか?

**IP 構成 ID** は、NAT 規則で使用する IP 構成オブジェクトの名前にすぎません。 この設定では、NAT 規則に適用するゲートウェイ パブリック IP アドレスを選択するだけです。 ゲートウェイ作成時にカスタム名を指定していない場合、ゲートウェイのプライマリ IP アドレスは**既定**の IPconfiguration に割り当てられ、セカンダリ IP は **activeActive" IPconfiguration** に割り当てられます。

## クロスプレミス接続と VM

### 仮想ネットワーク内に仮想マシンが存在し、クロスプレミス接続が使用できる場合、その VM にはどのように接続できますか。

ご利用の VM で RDP を有効にしている場合、プライベート IP アドレスを使って自分の仮想マシンに接続することができます。 その場合、接続先のプライベート IP アドレスとポート (通常 3389) を指定します。 このため、このトラフィックで使用するポートを仮想マシンで構成する必要があります。

また、同一仮想ネットワークに存在する別の仮想マシンからプライベート IP アドレスで仮想マシンに接続することもできます。 仮想ネットワークの外部から接続している場合は、プライベート IP アドレスを使用して仮想マシンに RDP 接続することはできません。 たとえば、ポイント対サイト仮想ネットワークが構成済みで、使用中のコンピューターからの接続が確立されていない場合は、プライベート IP アドレスを使用して仮想マシンに接続することはできません。

### クロスプレミス接続が確立されている仮想ネットワーク内に仮想マシンが存在する場合、VM からのトラフィックはすべてその接続を経由しますか。

いいえ。 仮想ネットワーク ゲートウェイを経由して送信されるのは、仮想ネットワークのローカル ネットワークの IP アドレス範囲内に存在する送信先 IP が指定されているトラフィックのみです。

仮想ネットワーク内に送信先 IP があるトラフィックは、仮想ネットワーク内に留まります。 その他のトラフィックは、ロード バランサーを経由してパブリック ネットワークに送信されます。 または、強制トンネリングを使用する場合、トラフィックは VPN ゲートウェイを介して送信されます。

### VM に対する RDP 接続をトラブルシューティングする方法

VPN 接続を使って仮想マシンに接続する際に問題が発生した場合には、次の項目を確認してください。

- VPN 接続が成功したことを確認します。
- VM のプライベート IP アドレスに接続していることを確認します。
- プライベート IP アドレスを使って VM に接続できるものの、コンピューター名では接続できない場合には、DNS が正しく構成されているかどうかを確認します。 VM の名前解決のしくみの詳細については、「[Azure 仮想ネットワーク内のリソースの名前解決](https://learn.microsoft.com/ja-jp/azure/virtual-network/virtual-networks-name-resolution-for-vms-and-role-instances)」を参照してください。

ポイント対サイトで接続している場合は、さらに次の事柄を確認してください:

- 接続元のコンピューターのイーサネット アダプターに割り当てられている IPv4 アドレスを `ipconfig` を使用して確認します。 IP アドレスが、接続先の仮想ネットワークのアドレス範囲内にある場合、または VPN クライアント アドレス プールのアドレス範囲内にある場合は、アドレス空間が重複しています。 この方法でアドレス空間が重複する場合、ネットワーク トラフィックは Azure に到達しません。 ローカル ネットワーク上にとどまります。
- 仮想ネットワークに対して DNS サーバーの IP アドレスが指定された後に VPN クライアント構成パッケージが生成されたことを確認します。 DNS サーバーの IP アドレスを更新した場合は、新しい VPN クライアント構成パッケージを生成してインストールしてください。

RDP 接続のトラブルシューティングの詳細については、[VM に対するリモート デスクトップ接続のトラブルシューティング](https://learn.microsoft.com/ja-jp/troubleshoot/azure/virtual-machines/troubleshoot-rdp-connection)に関するページを参照してください。

## 顧客が管理するゲートウェイのメンテナンス

### ネットワーク ゲートウェイ スコープのメンテナンス構成にはどのサービスが含まれますか?

ネットワーク ゲートウェイ スコープには、ネットワーク サービス内のゲートウェイ リソースが含まれます。 ネットワーク ゲートウェイ スコープ内には 4 種類のリソースがあります。

- ExpressRoute サービス内の仮想ネットワーク ゲートウェイ
- VPN Gateway サービス内の仮想ネットワーク ゲートウェイ
- Azure Virtual WAN サービス内の VPN ゲートウェイ (サイト間)
- Virtual WAN サービス内の ExpressRoute ゲートウェイ

### 顧客が管理するメンテナンスはどのメンテナンスをサポートしますか?

Azure サービスでは、機能、信頼性、パフォーマンス、セキュリティを向上させるために、定期的なメンテナンス更新が行われます。 ご利用のリソースにメンテナンス期間を構成すると、その期間中にゲスト OS メンテナンスとサービス メンテナンスが実行されます。 顧客が管理するメンテナンスは、(Power のホスト更新を超えるなどの) ホストの更新や重要なセキュリティ更新はカバーしません。

### メンテナンスの事前通知を受け取ることはできますか?

現時点では、ネットワーク ゲートウェイ リソースのメンテナンスに関する詳細な通知を受け取ることはできません。

### メンテナンス期間を 5 時間未満で構成することはできますか?

現時点では、お好きなタイム ゾーン内で最低 5 時間の枠を構成する必要があります。

### 日単位のスケジュール以外のメンテナンス期間を構成することはできますか?

現時点では、日単位のメンテナンス期間を構成する必要があります。

### 特定の更新を制御することができないケースはありますか?

顧客が管理するメンテナンスは、ゲスト OS とサービスの更新をサポートしています。 これらの更新は、顧客が懸念するメンテナンス項目の大部分を占めています。 ホストの更新など、他の種類の更新は、顧客が管理するメンテナンスの対象外です。

重大度の高いセキュリティの問題が顧客を危険にさらす可能性がある場合、Azure は、メンテナンス期間の顧客制御をオーバーライドし、変更をプッシュしなくてはならない場合があります。 これらの変更は、極端なケースでのみ使用されるまれな状況です。

### メンテナンス構成リソースは、ゲートウェイ リソースと同じリージョン内に存在する必要がありますか?

はい。

### 顧客が管理するメンテナンスを使用するように構成できるゲートウェイ SKU はどれですか?

(Basic SKU を除く) すべての Azure VPN Gateway SKU は、顧客が管理するメンテナンスを使用するように構成できます。

### ゲートウェイ リソースへの割り当て後、メンテナンス構成ポリシーが有効になるまでにどれくらいの時間がかかりますか?

メンテナンス ポリシーがゲートウェイ リソースに関連付けられた後、ネットワーク ゲートウェイがそのメンテナンス スケジュールに従うのに、最大で 24 時間かかる場合があります。

### Basic SKU パブリック IP アドレスに基づいた、顧客が管理するメンテナンスの使用には何らかの制限がありますか?

はい。 顧客が管理するメンテナンスは、サービスの更新の場合を除き、Basic SKU パブリック IP アドレスを使用するリソースでは機能しません。 これらのゲートウェイの場合、インフラストラクチャの制限により、ゲスト OS メンテナンスは顧客が管理するメンテナンス スケジュールには従い "ません"。

### VPN と ExpressRoute を共存シナリオで使用する場合、メンテナンス期間を計画するにはどうすればよいですか?

VPN と ExpressRoute を共存シナリオで使用する場合、またはバックアップとして機能するリソースが存在する場合は、個別のメンテナンス期間を設定することをお勧めします。 このアプローチにより、メンテナンスがご利用のバックアップ リソースへ同時に影響を与えないことが保証されます。

### リソースの 1 つに対して、将来の日付でメンテナンス期間をスケジュールしました。 そのときまで、このリソース上のメンテナンス アクティビティは停止したままですか?

いいえ、スケジュールされたメンテナンス期間前の期間中にリソース上のメンテナンス アクティビティが停止することはありません。 ご利用のメンテナンス スケジュール内に含まれていない日々には、そのリソースに対して通常どおりメンテナンスが続行されます。

### 顧客が管理するゲートウェイ メンテナンスの詳細を確認するにはどうすればよいですか?

詳細については、「[VPN Gateway の顧客が管理するゲートウェイのメンテナンスを構成する](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/customer-controlled-gateway-maintenance)」の記事を参照してください。

## 関連するコンテンツ

- VPN Gateway の詳細については、「[Azure VPN Gateway とは?](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/vpn-gateway-about-vpngateways)」を参照してください。
- VPN Gateway の構成設定の詳細については、「[VPN Gateway の設定について](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/vpn-gateway-about-vpn-gateway-settings)」をご覧ください。