
この記事は、Windows、Linux、または macOS を実行している個々のクライアントを Azure 仮想ネットワーク (VNet) に安全に接続できるように、必要な VPN Gateway ポイント対サイト (P2S) サーバー設定を構成するのに役立ちます。 P2P VPN 接続は、自宅や会議室でのテレワークなど、リモートの場所から VNet に接続する場合に便利です。 仮想ネットワーク (VNet) への接続を必要とするクライアントがごく少ない場合は、サイト対サイト (S2S) VPN の代わりに P2S を使用することもできます。 P2S 接続に VPN デバイスや公開 IP アドレスは必要ありません。

[コンピューターから Azure VNet へ接続する方法を示すポイント対サイト接続の図](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/media/vpn-gateway-howto-point-to-site-rm-ps/point-to-site-diagram.png#lightbox)

![](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/media/vpn-gateway-howto-point-to-site-rm-ps/point-to-site-diagram.png)

P2S には、さまざまな構成オプションがあります。 ポイント対サイト VPN の詳細については、「[ポイント対サイト VPN について](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/point-to-site-about)」を参照してください。 この記事は、**証明書認証**と Azure portal を使用する P2S 構成を作成するのに役立ちます。 Azure PowerShell を使用してこの構成を作成するには、[P2S の構成 - 証明書 - PowerShell](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/vpn-gateway-howto-point-to-site-rm-ps) に関する記事を参照してください。 RADIUS 認証については、[P2S RADIUS](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/point-to-site-how-to-radius-ps) に関する記事を参照してください。 Microsoft Entra 認証については、 [P2S Microsoft Entra ID](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/openvpn-azure-ad-tenant) 記事を参照してください。

P2S Azure 証明書認証接続には、以下のものが必要です。この演習ではこれらを構成します。

- ルートベースの VPN ゲートウェイ (ポリシーベースではありません)。 VPN の種類の詳細については、「[VPN Gateway の設定](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/vpn-gateway-about-vpn-gateway-settings#vpntype)」を参照してください。
- Azure にアップロードされた、ルート証明書の公開キー (.cer ファイル)。 証明書をアップロードすると、その証明書は信頼された証明書と見なされ、認証に使われます。
- ルート証明書から生成されたクライアント証明書。 VNet に接続する予定の各クライアント コンピューターにインストールされるクライアント証明書です。 この証明書はクライアントの認証に使用されます。
- VPN クライアント構成ファイル。 VPN クライアントは、VPN クライアント構成ファイルを使用して構成されます。 これらのファイルには、クライアントと VNet の接続に必要な情報が含まれています。 接続する各クライアントは、構成ファイルの設定を使って構成する必要があります。

## 前提条件

Azure サブスクリプションを持っていることを確認します。 Azure サブスクリプションをまだお持ちでない場合は、[MSDN サブスクライバーの特典](https://azure.microsoft.com/pricing/member-offers/msdn-benefits-details)を有効にするか、[無料アカウント](https://azure.microsoft.com/pricing/free-trial)にサインアップしてください。

### 値の例

次の値を使用して、テスト環境を作成できます。また、この値を参考にしながら、この記事の例を確認していくこともできます。

**VNet**

- **VNet 名:** VNet1
- **アドレス空間:** 10.1.0.0/16この例では、1 つのアドレス空間のみを使用します。 VNet には、複数のアドレス空間を使用することができます。
- **サブネット名:** FrontEnd
- **サブネットのアドレス範囲:** 10.1.0.0/24
- **サブスクリプション:** サブスクリプションが複数ある場合は、適切なものを使用していることを確認します。
- **[リソース グループ]:** TestRG1
- **[場所]:** 米国東部

**仮想ネットワーク ゲートウェイ**

- **仮想ネットワーク ゲートウェイ名:** VNet1GW
- **ゲートウェイの種類:** VPN
- **VPN の種類:** ルートベース (P2S に必要)
- **SKU**: VpnGw2
- **世代:** Generation2
- **ゲートウェイ サブネットのアドレス範囲:** 10.1.255.0/27
- **パブリック IP アドレス名:** VNet1GWpip

**接続の種類とクライアント アドレス プール**

- **[接続の種類]** : ポイント対サイト
- **クライアント アドレス プール:** 172.16.201.0/24このポイント対サイト接続を利用して VNet に接続する VPN クライアントは、クライアント アドレス プールから IP アドレスを受け取ります。

## VNet を作成する

このセクションでは、VNet を作成します。 この構成に使用する推奨値については、「[値の例](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/vpn-gateway-howto-point-to-site-resource-manager-portal#example)」セクションを参照してください。

注意

クロスプレミス アーキテクチャの一部として仮想ネットワークを使う場合は、必ずオンプレミスのネットワーク管理者と調整を行って、この仮想ネットワーク専用に使用できる IP アドレスの範囲を見つけます。 VPN 接続の両側に重複するアドレス範囲が存在する場合、予期しない方法でトラフィックがルーティングされます。 また、この仮想ネットワークを別の仮想ネットワークに接続する場合、アドレス空間を別の仮想ネットワークと重複させることはできません。 この点を踏まえてネットワーク構成を計画してください。

1. Azure portal にサインインします。
2. ポータル ページの上部にある **[リソース、サービス、ドキュメントの検索 (G+/)]** に「**仮想ネットワーク**」と入力します。 **Marketplace** の検索結果から **[仮想ネットワーク]** を選び、**[仮想ネットワーク]** ページを開きます。
3. **[仮想ネットワーク]** ページの **[作成]** を選び、**[仮想ネットワークの作成]** ページを開きます。
4. **[基本]** タブの **[プロジェクトの詳細]** と **[インスタンスの詳細]** に仮想ネットワークの設定を構成します。 入力した値が検証された場合は、緑色のチェック マークが表示されます。 この例に示されている値は、必要な設定に従って調整できます。  
    
    [[基本] タブを示すスクリーンショット。](https://learn.microsoft.com/ja-jp/azure/includes/media/vpn-gateway-basic-vnet-rm-portal-include/basics.png#lightbox)
    
    ![](https://learn.microsoft.com/ja-jp/azure/includes/media/vpn-gateway-basic-vnet-rm-portal-include/basics.png)
    
    - **サブスクリプション**:一覧表示されているサブスクリプションが正しいことを確認します。 ドロップダウン ボックスを使ってサブスクリプションを変更できます。
    - **リソース グループ**: 既存のリソース グループを選ぶか、**[新規作成]** を選んで新しく作成します。 リソース グループの詳細については、「[Azure Resource Manager の概要](https://learn.microsoft.com/ja-jp/azure/azure-resource-manager/management/overview#resource-groups)」を参照してください。
    - **Name**:仮想ネットワークの名前を入力します。
    - **リージョン**: 仮想ネットワークの場所を選びます。 この場所によって、この仮想ネットワークにデプロイするリソースが存在する場所が決まります。
5. **[次へ]** または **[セキュリティ]** を選んで、**[セキュリティ]** タブに移動します。この演習では、このページのすべてのサービスについて既定値のままにします。
6. **[IP アドレス]** を選んで、**[IP アドレス]** タブに移動します。**[IP アドレス]** タブで設定を構成します。 
    - **IPv4 アドレス空間**: 既定では、アドレス空間が自動的に作成されます。 アドレス空間を選択して、独自の値が反映されるように調整できます。 別のアドレス空間を追加し、自動的に作成された既定値を削除することもできます。 たとえば、開始アドレスを **10.1.0.0** に指定し、アドレス空間のサイズを **/16** に指定します。 次に **[追加]** を選んでそのアドレス空間を追加します。
    - **+ サブネットの追加**: 既定のアドレス空間を使用すると、既定のサブネットが自動的に作成されます。 アドレス空間を変更する場合は、そのアドレス空間内に新しいサブネットを追加します。 **[+ サブネットの追加]** を選択して、 **[サブネットの追加]** ウィンドウを開きます。 次の設定を構成し、ページの下部にある **[追加]** を選んで値を追加します。
        - **サブネット名**: たとえば **FrontEnd** です。
        - **[サブネットのアドレス範囲]** : このサブネットのアドレス範囲です。 たとえば、**10.1.0.0** や **/24** です。
7. **[IP アドレス]** ページを確認し、不要なアドレス空間またはサブネットを削除します。
8. **[確認と作成]** を選択して、仮想ネットワークの設定を検証します。
9. 設定が検証されたら、**[作成]** を選んで仮想ネットワークを作成します。

## ゲートウェイ サブネットの作成

仮想ネットワーク ゲートウェイには、**GatewaySubnet** という特定のサブネットが必要です。 ゲートウェイ サブネットは、仮想ネットワークの IP アドレス範囲の一部であり、仮想ネットワーク ゲートウェイのリソースとサービスが使う IP アドレスが含まれています。 /27 以上のゲートウェイ サブネットを指定します。

1. 仮想ネットワークのページの左側ペインで **[サブネット]** を選んで、**[サブネット]** ページを開きます。
2. ページの上部にある **[+ ゲートウェイ サブネット]** を選んで、**[サブネットの追加]** ペインを開きます。
3. 名前には「**GatewaySubnet**」が自動的に入力されます。 必要に応じて、IP アドレス範囲の値を調整します。 たとえば、**10.1.255.0/27** などとします。
4. ページの他の値は調整しないでください。 ページ下部の **[保存]** を選んでサブネットを保存します。

## VPN ゲートウェイを作成する

この手順では、VNet の仮想ネットワーク ゲートウェイを作成します。 選択したゲートウェイ SKU によっては、ゲートウェイの作成に 45 分以上かかる場合も少なくありません。

注意

Basic ゲートウェイ SKU では、IKEv2 と RADIUS 認証はサポートされません。 Mac クライアントを VNet に接続する予定がある場合は、Basic SKU を使用しないでください。

1. **[リソース、サービス、ドキュメントの検索 (G+/)]** に「**仮想ネットワーク ゲートウェイ**」と入力します。 **Marketplace** の検索結果で **[仮想ネットワーク ゲートウェイ]** を見つけて選び、**[仮想ネットワーク ゲートウェイの作成]** ページを開きます。
2. **[基本]** タブで、 **[プロジェクトの詳細]** と **[インスタンスの詳細]** の各値を入力します。  
    
    [[インスタンス] フィールドを示すスクリーンショット。](https://learn.microsoft.com/ja-jp/azure/includes/media/vpn-gateway-add-gw-portal/instance-details.png#lightbox)
    
    ![](https://learn.microsoft.com/ja-jp/azure/includes/media/vpn-gateway-add-gw-portal/instance-details.png)
    
    - **サブスクリプション**: 使うサブスクリプションをドロップダウン リストから選びます。
    - **リソース グループ**: この設定は、このページで仮想ネットワークを選ぶと自動入力されます。
    - **Name**:ゲートウェイに名前を付けます。 ゲートウェイの名前付けは、ゲートウェイ サブネットの名前付けと同じではありません。 作成するゲートウェイ オブジェクトの名前です。
    - **リージョン**: このリソースを作成するリージョンを選択します。 ゲートウェイのリージョンは、仮想ネットワークと同じである必要があります。
    - **ゲートウェイの種類**: **[VPN]** を選択します。 VPN Gateway では、仮想ネットワーク ゲートウェイの種類として **VPN** を使用します。
    - **SKU**: 使う機能をサポートするゲートウェイ SKU をドロップダウン リストから選びます。 [ゲートウェイ SKU](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/vpn-gateway-about-vpn-gateway-settings#gwsku) を参照してください。 ポータルのドロップダウン リストで使用できる SKU は、選んだ `VPN type` によって変わります。 Basic SKU は、Azure CLI または PowerShell を使用してのみ構成できます。
    - **世代**: 使用する世代を選択します。 Generation2 SKU を使用することをお勧めします。 詳細については、「[ゲートウェイの SKU](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/vpn-gateway-about-vpngateways#gwsku)」を参照してください。
    - **仮想ネットワーク**: ドロップダウン リストから、このゲートウェイの追加先の仮想ネットワークを選びます。 ゲートウェイを作成する仮想ネットワークが表示されない場合は、前の設定で正しいサブスクリプションとリージョンを選んでいることを確認します。
    - **ゲートウェイ サブネットのアドレス範囲**または**サブネット**: VPN ゲートウェイを作成するには、ゲートウェイ サブネットが必要です。
        
        現時点では、このフィールドには、仮想ネットワークのアドレス空間と、仮想ネットワークの **GatewaySubnet** という名前のサブネットが既に作成されているかどうかに応じて、さまざまな設定オプションを表示できます。
        
        ゲートウェイ サブネットがない場合、"かつ" このページに作成するオプションが表示されない場合は、仮想ネットワークに戻ってゲートウェイ サブネットを作成します。 次に、このページに戻って、VPN ゲートウェイを構成します。
        
3. **[パブリック IP アドレス]** の値を指定します。 これらの設定では、VPN ゲートウェイに関連付けられるパブリック IP アドレス オブジェクトを指定します。 パブリック IP アドレスは、VPN ゲートウェイの作成時に、このオブジェクトに割り当てられます。 プライマリ パブリック IP アドレスが変わるのは、ゲートウェイが削除され、再度作成されたときのみです。 VPN ゲートウェイのサイズ変更、リセット、その他の内部メンテナンス/アップグレードでは、IP アドレスは変わりません。  
    
    [[パブリック IP アドレス] フィールドを示すスクリーンショット。](https://learn.microsoft.com/ja-jp/azure/includes/media/vpn-gateway-add-gw-pip-portal/pip-values.png#lightbox)
    
    ![](https://learn.microsoft.com/ja-jp/azure/includes/media/vpn-gateway-add-gw-pip-portal/pip-values.png)
    
    - **パブリック IP アドレスの種類**: このオプションが表示されている場合は、**[Standard]** を選択します。 **Basic** パブリック IP アドレス SKU は、**Basic** SKU VPN ゲートウェイでのみサポートされます。
    - **パブリック IP アドレス** : **[新規作成]** を選択しておいてください。
    - **パブリック IP アドレス名**: このテキスト ボックスに、パブリック IP アドレス インスタンスの名前を入力します。
    - **パブリック IP アドレス SKU**: 設定が自動的に選択されます。
    - **割り当て**: 通常、割り当ては自動的に選択されます。 Standard SKU の場合、割り当ては常に静的です。
    - **[アクティブ/アクティブ モードの有効化]**: **[無効]** を選びます。 アクティブ/アクティブ ゲートウェイ構成を作成する場合にのみ、この設定を有効にします。
    - **[BGP の構成]**: 構成で特に必要ない限り、**[無効]** を選びます。 この設定が必要である場合、既定の ASN は 65515 です。ただし、この値は変わる場合があります。
4. **[確認と作成]** を選択して検証を実行します。
5. 検証に合格したら、**[作成]** を選んで VPN ゲートウェイをデプロイします。

デプロイの状態は、ゲートウェイの **[概要]** ページで確認できます。 ゲートウェイの作成後は、ポータルの VNet を調べることで、ゲートウェイに割り当てられている IP アドレスを確認できます。 ゲートウェイは、接続されたデバイスとして表示されます。

重要

ゲートウェイ サブネット上のネットワーク セキュリティ グループ (NSG) はサポートされていません。 ネットワーク セキュリティ グループをこのサブネットに関連付けると、仮想ネットワーク ゲートウェイ (VPN と ExpressRoute ゲートウェイ) が想定どおりに機能しなくなる可能性があります。 ネットワーク セキュリティ グループの詳細については、「[ネットワーク セキュリティ グループ (NSG) について](https://learn.microsoft.com/ja-jp/azure/virtual-network/network-security-groups-overview)」を参照してください。

## 証明書の生成

証明書は、ポイント対サイト VPN 接続を介して VNet に接続するクライアントを認証するために、Azure によって使用されます。 ルート証明書を取得したら、公開キー情報を Azure に[アップロード](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/vpn-gateway-howto-point-to-site-resource-manager-portal#uploadfile)します。 ルート証明書は、Azure によって "信頼された" と見なされ、P2S 経由での VNet への接続に使用されます。

また、信頼されたルート証明書からクライアント証明書を生成し、それを各クライアント コンピューターにインストールします。 クライアント証明書は、クライアントで VNet への接続を開始するときに、そのクライアントを認証するために使用されます。

ポイント対サイト ゲートウェイ設定を構成する前に、ルート証明書を生成および抽出する必要があります。

### ルート証明書を生成する

ルート証明書の .cer ファイルを取得します。 エンタープライズ ソリューションを使って生成されたルート証明書を使用することも (推奨)、自己署名証明書を生成することもできます。 ルート証明書の作成後、秘密キーではなく公開証明書データを、Base64 でエンコードされた X.509 .cer ファイルとしてエクスポートします。 このファイルは、後で Azure にアップロードします。

- **エンタープライズ証明書:** エンタープライズ ソリューションを使用している場合は、既存の証明書チェーンを使うことができます。 使用するルート証明書の .cer ファイルを取得します。
- **自己署名ルート証明書:** エンタープライズ証明書ソリューションを使用していない場合は、自己署名ルート証明書を作成します。 そうしないと、作成する証明書と P2S 接続との互換性がなくなり、クライアントが接続しようとすると接続エラー メッセージを受信するようになります。 Azure PowerShell、MakeCert、または OpenSSL を使用できます。 以下の記事の手順では、互換性のある自己署名ルート証明書を生成する方法が説明されています。
    - [Windows 10 以降の PowerShell の手順](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/vpn-gateway-certificates-point-to-site): これらの手順では、Windows 10 以降を実行しているコンピューターで PowerShell が必要です。 ルート証明書から生成されるクライアント証明書は、サポートされている任意の P2S クライアントにインストールすることができます。
    - [MakeCert の手順](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/vpn-gateway-certificates-point-to-site-makecert): Windows 10 以降のコンピューターにアクセスできない場合は、MakeCert を使用します。 MakeCert は非推奨になりましたが、まだ証明書を生成するに使用することができます。 ルート証明書から生成されるクライアント証明書は、サポートされている任意の P2S クライアントにインストールすることができます。
    - [Linux - OpenSSL での手順](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/point-to-site-certificates-linux-openssl)
    - [Linux - strongSwan での手順](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/vpn-gateway-certificates-point-to-site-linux)

### クライアント証明書を生成する

お客様がポイント対サイト接続を使用して VNet に接続する各クライアント コンピューターには、クライアント証明書がインストールされていなければなりません。 ルート証明書からそれを生成し、各クライアント コンピューターにインストールします。 有効なクライアント証明書をインストールしないと、クライアントが VNet への接続を試行したときに認証が失敗します。

クライアントごとに一意の証明書を生成することも、複数のクライアントに同じ証明書を使用することもできます。 一意のクライアント証明書を生成する利点は、1 つの証明書を失効させることができる点です。 そうでなければ、複数のクライアントで同じクライアント証明書が認証に使用されていて、お客様がそれを失効させる場合に、その証明書が使用されているすべてのクライアントに対して新しい証明書を生成してインストールする必要があります。

クライアント証明書は、次の方法を使用して生成できます。

- **エンタープライズ証明書:**
    - エンタープライズ証明書ソリューションを使用している場合は、共通名の値の形式 *name@yourdomain.com* を使用してクライアント証明書を生成します。 *domain name\username* 形式の代わりに、この形式を使用します。
    - クライアント証明書が、ユーザー一覧の最初の項目が "*クライアント認証*" であるユーザー証明書テンプレートに基づいていることを確認します。 証明書を確認するには、それをダブルクリックし、 **[詳細]** タブの **[拡張キー使用法]** を表示します。
- **自己署名ルート証明書:** お客様が作成するクライアント証明書が P2S 接続との互換性を備えるよう、P2S 証明書に関する以下のいずれかの記事の手順に従ってください。
    
    自己署名ルート証明書からクライアント証明書を生成した場合、お客様が生成に使用したコンピューターにそれが自動的にインストールされます。 クライアント証明書を別のクライアント コンピューターにインストールしたい場合は、それを .pfx ファイルとして、証明書チェーン全体と共にエクスポートします。 そうすることで、クライアントの認証に必要なルート証明書情報が含まれている .pfx ファイルが作成されます。
    
    これらの記事の手順では、互換性のあるクライアント証明書が生成されます。この証明書をエクスポートして配布できます。
    
    - [Windows 10 以降の PowerShell の手順](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/vpn-gateway-certificates-point-to-site#clientcert): これらの手順で証明書を生成するには、Windows 10 以降、および PowerShell が必要です。 生成される証明書は、サポートされている任意の P2S クライアントにインストールできます。
    - [MakeCert の手順](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/vpn-gateway-certificates-point-to-site-makecert): 証明書を生成する Windows 10 以降のコンピューターにアクセスできない場合は、MakeCert を使用します。 MakeCert は非推奨になりましたが、まだ証明書を生成するに使用することができます。 生成される証明書は、サポートされている任意の P2S クライアントにインストールできます。
    - Linux: [strongSwan](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/vpn-gateway-certificates-point-to-site-linux) または [OpenSSL](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/point-to-site-certificates-linux-openssl) の手順を参照してください。

## アドレス プールを追加する

**[ポイント対サイト構成]** ページには、P2S VPN に必要な構成情報が含まれています。 すべての P2S 設定が構成され、ゲートウェイが更新されると、[ポイント対サイト構成] ページを使用して P2S VPN 設定が表示または変更されます。

1. 前のセクションで作成したゲートウェイに移動します。
2. 左側のウィンドウで、**[ポイント対サイト構成]** を選択します。
3. **[今すぐ構成]** をクリックして構成ページを開きます。

クライアント アドレス プールとは、指定するプライベート IP アドレスの範囲です。 ポイント対サイト VPN 経由で接続するクライアントは、この範囲内の IP アドレスを動的に受け取ります。 接続元であるオンプレミスの場所、または接続先とする VNet と重複しないプライベート IP アドレス範囲を使用してください。 複数のプロトコルを構成するとき、SSTP がプロトコルの 1 つの場合、構成後のアドレス プールは構成されるプロトコル間で均等に分割されます。

[ポイント対サイト構成ページ - アドレス プールのスクリーンショット。](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/media/vpn-gateway-howto-point-to-site-resource-manager-portal/configuration-address-pool.png#lightbox)

![](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/media/vpn-gateway-howto-point-to-site-resource-manager-portal/configuration-address-pool.png)

1. **[ポイント対サイトの構成]** ページの **[アドレス プール]** ボックスに、使用するプライベート IP アドレス範囲を追加します。 VPN クライアントには、指定した範囲から動的に IP アドレスが割り当てられます。 最小のサブネット マスクは、アクティブ/パッシブ構成の場合は 29 ビット、アクティブ/アクティブ構成の場合は 28 ビットです。
2. 次に、トンネルの種類と認証の種類を構成します。

## トンネルの種類と認証の種類を指定する

注意

**[ポイント対サイトの構成]** ページで、トンネルの種類も認証の種類も表示されない場合、ご利用のゲートウェイで使用されているのは Basic SKU です。 Basic SKU では、IKEv2 と RADIUS 認証はサポートされません。 これらの設定を使用する場合は、ゲートウェイを削除し、別のゲートウェイ SKU を使って再作成する必要があります。

このセクションでは、トンネルの種類と認証の種類を指定します。 これらの設定は、必要なトンネルの種類と、ユーザーのオペレーティング システムからの接続に使用される VPN クライアント ソフトウェアによっては、複雑になる可能性があります。 この記事の手順では、基本的な構成設定と選択肢について説明します。

ドロップダウンから複数のトンネルの種類を含むオプション ([IKEv2 と OpenVPN (SSL)]、[IKEv2 と SSTP (SSL)] など) を選択できますが、サポートされているのは、特定の組み合わせのトンネルの種類と認証の種類のみです。 たとえば、Microsoft Entra 認証は、トンネルの種類のドロップダウンから *OpenVPN (SSL)* 選択した場合にのみ使用でき、*IKEv2 と OpenVPN (SSL)* は使用できません。

さらに、トンネルの種類と認証の種類は、Azure への接続に使用できる VPN クライアント ソフトウェアに対応しています。 たとえば、IKEv2 経由でのみ接続できる VPN クライアント ソフトウェア アプリケーションと、OpenVPN 経由でのみ接続できるものがあります。 また、一部のクライアント ソフトウェアでは、特定のトンネルの種類がサポートされているが、選択した認証の種類がサポートされていない場合があります。

したがって、さまざまなオペレーティング システムから接続される多様な VPN クライアントがある場合は、トンネルの種類と認証の種類を計画することが重要となります。 **Azure 証明書**認証と組み合わせてトンネルの種類を選択する場合は、次の条件を考慮してください。 その他の認証の種類には、それぞれ異なる考慮事項があります。

- **Windows:**
    - オペレーティング システムに既にインストールされているネイティブ VPN クライアント経由で接続される Windows コンピューターでは、最初に IKEv2 が試行され、接続されない場合は SSTP にフォールバックします (トンネルの種類のドロップダウンから IKEv2 と SSTP の両方を選択した場合)。
    - トンネルの種類 OpenVPN を選択した場合は、OpenVPN クライアントまたは Azure VPN クライアントを使用して接続できます。
    - Azure VPN クライアントでは、カスタム ルートや強制トンネリングなどの[省略可能な構成設定](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/azure-vpn-client-optional-configurations)をサポートできます。
- **macOS および iOS**:
    - iOS および macOS 用のネイティブ VPN クライアントでは、Azure への接続にトンネルの種類 IKEv2 のみを使用できます。
    - 現時点では、トンネルの種類 OpenVPN を選択した場合でも、証明書認証で Azure VPN クライアントはサポートされていません。
    - 証明書認証でトンネルの種類 OpenVPN を使用する場合は、OpenVPN クライアントを使用できます。
    - macOS の場合、OpenVPN トンネルの種類と Microsoft Entra ID 認証 (証明書認証ではなく) で Azure VPN クライアントを使用できます。
- **Linux:**
    - Linux 用 Azure VPN クライアントは、トンネルの種類 OpenVPN をサポートしています。
    - Android および Linux 上の strongSwan クライアントでは、接続にトンネルの種類 IKEv2 のみを使用できます。

### トンネルの種類

**[ポイント対サイトの構成]** ページで、 **[トンネルの種類]** を選択します。 この演習では、ドロップダウンから **[IKEv2 と OpenVPN(SSL)]** を選択します。

[ポイント対サイト構成ページ - トンネルの種類のスクリーンショット。](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/media/vpn-gateway-howto-point-to-site-resource-manager-portal/configuration-tunnel-type.png#lightbox)

![](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/media/vpn-gateway-howto-point-to-site-resource-manager-portal/configuration-tunnel-type.png)

### 認証の種類

この演習では、認証の種類として **[Azure 証明書]** を選択します。 他の認証の種類に関心がある場合は、[Microsoft Entra ID](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/openvpn-azure-ad-tenant) と [RADIUS](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/point-to-site-how-to-radius-ps) に関する記事を参照してください。

[ポイント対サイト構成ページ - 認証の種類のスクリーンショット。](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/media/vpn-gateway-howto-point-to-site-resource-manager-portal/configuration-authentication-type.png#lightbox)

![](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/media/vpn-gateway-howto-point-to-site-resource-manager-portal/configuration-authentication-type.png)

## ルート証明書の公開キー情報のアップロード

このセクションでは、公開ルート証明書データを Azure にアップロードします。 公開証明書データがアップロードされたら、Azure でそれを使用し、信頼されたルート証明書から生成されたクライアント証明書がインストールされているクライアントを認証できます。

1. ルート証明書を **Base 64 でエンコードされた X.509 (.CER)** ファイルとして、エクスポートしたことをご確認ください。 証明書をテキスト エディターで開くことができるように、この形式でエクスポートする必要があります。 秘密キーをエクスポートする必要はありません。
2. 証明書をメモ帳などのテキスト エディターで開きます。 証明書データをコピーするときはに、必ず、テキストを復帰や改行のない 1 つの連続した行としてコピーしてください。 復帰や改行を確認するには、テキスト エディターのビューを "記号を表示する/すべての文字を表示する" ように変更することが必要になる場合があります。 次のセクションのみを 1 つの連続した行としてコピーします。 
    
    ![](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/media/vpn-gateway-howto-point-to-site-resource-manager-portal/notepad-root-cert.png)
    
3. **[ルート証明書]** セクションで **[仮想ネットワーク ゲートウェイ] -> [ポイント対サイトの構成]** ページに移動します。 このセクションは、認証の種類として **[Azure 証明書]** を選択した場合にのみ表示されます。
4. **[ルート証明書]** セクションで、最大 20 個の信頼されたルート証明書を追加できます。  
    - **[公開証明書データ]** フィールドに証明書データを貼り付けます。
    - 証明書に**名前**を付けます。
    
    [証明書データ フィールドのスクリーンショット。](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/media/vpn-gateway-howto-point-to-site-resource-manager-portal/root-certificate.png#lightbox)
    
    ![](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/media/vpn-gateway-howto-point-to-site-resource-manager-portal/root-certificate.png)
    
5. この演習では、追加のルートは必要ありません。 カスタム ルーティング機能の詳細については、[カスタム ルートのアドバタイズ](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/vpn-gateway-p2s-advertise-custom-routes)に関するページを参照してください。
6. ページの上部にある **[保存]** を選択して、構成設定をすべて保存します。 
    
    [[保存] が選択されている P2S 構成のスクリーンショット。](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/media/vpn-gateway-howto-point-to-site-resource-manager-portal/save-configuration.png#lightbox)
    
    ![](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/media/vpn-gateway-howto-point-to-site-resource-manager-portal/save-configuration.png)
    

## VPN クライアント プロファイル構成ファイルを生成する

VPN クライアントに必要なすべての構成設定は、VPN クライアント プロファイル構成 zip ファイルに含まれています。 VPN クライアント プロファイル構成ファイルは、VNet の P2S VPN ゲートウェイ構成に特化しています。 ファイルを生成した後に、P2S VPN 構成に変更があった場合は (VPN プロトコルの種類や認証の種類の変更など)、新しい VPN クライアント プロファイル構成ファイルを生成し、接続するすべての VPN クライアントに新しい構成を適用する必要があります。 P2S 接続の詳細については、「[ポイント対サイト VPN について](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/point-to-site-about)」を参照してください。

PowerShell または Azure portal を使用して、クライアント プロファイル構成ファイルを生成できます。 次の例では、両方のメソッドを示します。 どちらの方法でも、同じ zip ファイルが返されます。

### Azure portal

1. Azure portal で、接続する仮想ネットワークの仮想ネットワーク ゲートウェイに移動します。
2. 仮想ネットワーク ゲートウェイ ページで、 **[ポイント対サイトの構成]** を選択して、[ポイント対サイトの構成] ページを開きます。
3. **[ポイント対サイトの構成]** ページの上部で **[VPN クライアントのダウンロード]** を選択します。 これにより、VPN クライアント ソフトウェアがダウンロードされるのではなく、VPN クライアントの構成に使用される構成パッケージが生成されます。 クライアント構成パッケージが生成されるまでに数分かかります。 この間、パケットが生成されるまで、何も表示されない場合があります。 
    
    [[ポイント対サイトの構成] ページのスクリーンショット。](https://learn.microsoft.com/ja-jp/azure/includes/media/vpn-gateway-generate-profile-portal/download-configuration.png#lightbox)
    
    ![](https://learn.microsoft.com/ja-jp/azure/includes/media/vpn-gateway-generate-profile-portal/download-configuration.png)
    
4. 構成パッケージが生成されると、クライアント構成 ZIP ファイルが使用可能であることがブラウザーに示されます。 ファイルにはゲートウェイと同じ名前が付けられています。
5. そのファイルを解凍して、フォルダーを表示します。 これらのファイルの一部またはすべてを使用して、VPN クライアントを構成します。 生成されるファイルは、P2S サーバー上に構成した認証とトンネルの種類の設定に対応します。

### PowerShell

VPN クライアント構成ファイルを生成する際、"-AuthenticationMethod" の値は "EapTls" です。 次のコマンドを使用して、VPN クライアント構成ファイルを生成します。

```
$profile=New-AzVpnClientConfiguration -ResourceGroupName "TestRG" -Name "VNet1GW" -AuthenticationMethod "EapTls"

$profile.VPNProfileSASUrl

```

URL をブラウザーにコピーして、ZIP ファイルをダウンロードします。

## VPN クライアントの構成と Azure への接続

VPN クライアントを構成して Azure に接続する手順については、以下の記事を参照してください。

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

## 接続を確認する

ここで紹介する手順は、Windows クライアントに適用されます。

1. VPN 接続がアクティブであることを確認するには、管理者特権でのコマンド プロンプトを開いて、 *ipconfig/all*を実行します。
2. 結果を表示します。 受信した IP アドレスが、構成で指定したポイント対サイト VPN クライアント アドレス プール内のアドレスのいずれかであることに注意してください。 結果は次の例のようになります。 
    
    ```
    PPP adapter VNet1:
       Connection-specific DNS Suffix .:
       Description.....................: VNet1
       Physical Address................:
       DHCP Enabled....................: No
       Autoconfiguration Enabled.......: Yes
       IPv4 Address....................: 172.16.201.3(Preferred)
       Subnet Mask.....................: 255.255.255.255
       Default Gateway.................:
       NetBIOS over Tcpip..............: Enabled
    
    ```
    

## 仮想マシンへの接続

ここで紹介する手順は、Windows クライアントに適用されます。

VM へのリモート デスクトップ接続を作成すると、仮想ネットワークにデプロイされている VM に接続できます。 VM に接続できるかどうかを初めて確認する際に最も良い方法は、その VM のコンピューター名ではなく、プライベート IP アドレスを使って接続してみることです。 この方法であれば、名前の解決が適切に構成されているかではなく、VM に接続できるかどうかをテストすることができます。

1. プライベート IP アドレスを特定します。 VM のプライベート IP アドレスは、Azure portal で VM のプロパティを表示するか、PowerShell を使うと確認できます。 
    - **Azure portal**: Azure portal で VM を見つけます。 VM のプロパティを表示すると、 プライベート IP アドレスが表示されます。
    - **PowerShell**: この例を使って、リソース グループの VM とプライベート IP アドレスの一覧を表示します。 このコマンドは、使用前に変更を加える必要はありません。
        
        ```
        $VMs = Get-AzVM
        $Nics = Get-AzNetworkInterface | Where-Object VirtualMachine -ne $null
        
        foreach ($Nic in $Nics) {
        $VM = $VMs | Where-Object -Property Id -eq $Nic.VirtualMachine.Id
        $Prv = $Nic.IpConfigurations | Select-Object -ExpandProperty PrivateIpAddress
        $Alloc = $Nic.IpConfigurations | Select-Object -ExpandProperty PrivateIpAllocationMethod
        Write-Output "$($VM.Name): $Prv,$Alloc"
        }
        
        ```
        
2. 仮想ネットワークに接続されていることを確認します。
3. タスク バーの検索ボックスに「**RDP**」または「**リモート デスクトップ接続**」と入力して、**リモート デスクトップ接続**を開きます。 次に、**[リモート デスクトップ接続]** を選びます。 このほか、PowerShell で `mstsc` コマンドを使って**リモート デスクトップ接続**を開くこともできます。
4. **リモート デスクトップ接続**で、VM のプライベート IP アドレスを入力します。 **[オプションの表示]** を選んでその他の設定を調整してから、接続できます。

VPN 接続を使って VM に接続する際に問題が発生した場合には、次の点を確認してください。

- VPN 接続が成功したことを確認します。
- VM のプライベート IP アドレスに接続していることを確認します。
- プライベート IP アドレスを使って VM に接続できるものの、コンピューター名では接続できない場合には、DNS が正しく構成されているかどうかを確認します。 VM の名前解決のしくみについては、[VM の名前解決](https://learn.microsoft.com/ja-jp/azure/virtual-network/virtual-networks-name-resolution-for-vms-and-role-instances)に関するページを参照してください。

詳細については、[VM に対するリモート デスクトップ接続のトラブルシューティング](https://learn.microsoft.com/ja-jp/troubleshoot/azure/virtual-machines/troubleshoot-rdp-connection)に関するページを参照してください。

- VNet に対して DNS サーバーの IP アドレスが指定された後に VPN クライアント構成パッケージが生成されたことを確認します。 DNS サーバーの IP アドレスを更新した場合は、新しい VPN クライアント構成パッケージを生成してインストールしてください。
- 接続元のコンピューターのイーサネット アダプターに割り当てられている IPv4 アドレスを 'ipconfig' を使用して確認します。 その IP アドレスが、接続先の VNet のアドレス範囲内または VPNClientAddressPool のアドレス範囲内にある場合、これを "アドレス空間の重複" といいます。 アドレス空間がこのように重複していると、ネットワーク トラフィックが Azure に到達せずローカル ネットワーク上に留まることになります。

## 信頼されたルート証明書を追加または削除する

信頼されたルート証明書を Azure に追加したり、Azure から削除したりできます。 ルート証明書を削除すると、そのルートから証明書を生成したクライアントは認証が無効となり、接続できなくなります。 クライアントの認証と接続を正常に実行できるようにするには、Azure に信頼されている (Azure にアップロードされている) ルート証明書から生成した新しいクライアント証明書をインストールする必要があります。

信頼されたルート証明書 .cer ファイルを最大 20 個まで Azure に追加できます。 手順については、[信頼されたルート証明書のアップロード](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/vpn-gateway-howto-point-to-site-resource-manager-portal#uploadfile)に関するセクションを参照してください。

信頼されたルート証明書を削除するには

1. ご利用の仮想ネットワーク ゲートウェイの **[ポイント対サイトの構成]** ページに移動します。
2. ページの **[ルート証明書]** セクションで、削除する証明書を見つけます。
3. 証明書の横にある省略記号を選んでから、 **[削除]** を選択します。

## クライアント証明書の失効

クライアント証明書は失効させることができます。 証明書失効リストを使用すると、個々のクライアント証明書に基づく P2S 接続を選択して拒否することができます。 これは、信頼されたルート証明書を削除することとは異なります。 信頼されたルート証明書 .cer を Azure から削除すると、失効したルート証明書によって生成または署名されたすべてのクライアント証明書のアクセス権が取り消されます。 ルート証明書ではなくクライアント証明書を失効させると、ルート証明書から生成されたその他の証明書は、その後も認証に使用できます。

一般的な方法としては、ルート証明書を使用してチームまたは組織レベルでアクセスを管理し、失効したクライアント証明書を使用して、個々のユーザーの細かいアクセス制御を構成します。

失効リストに拇印を追加することで、クライアント証明書を失効させることができます。

1. クライアント証明書の拇印を取得します。 詳細については、「[方法: 証明書のサムプリントを取得する](https://learn.microsoft.com/ja-jp/dotnet/framework/wcf/feature-details/how-to-retrieve-the-thumbprint-of-a-certificate)」を参照してください。
2. 情報をテキスト エディターにコピーし、文字列が 1 つにつながるようにスペースをすべて削除します。
3. 仮想ネットワーク ゲートウェイの **[ポイント対サイトの構成]** ページに移動します。 このページは、[信頼されたルート証明書のアップロード](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/vpn-gateway-howto-point-to-site-resource-manager-portal#uploadfile)に使用したものです。
4. **[失効した証明書]** セクションで、証明書のフレンドリ名を入力します (証明書 CN にする必要はありません)。
5. 拇印の文字列をコピーして **[拇印]** フィールドに貼り付けます。
6. 拇印が検証され、自動的に失効リストに追加されます。 リストが更新されていることを示すメッセージが画面に表示されます。
7. 更新が完了した後は、証明書を接続に使用することができなくなります。 この証明書を使用して接続を試みたクライアントには、証明書が無効になっていることを示すメッセージが表示されます。

## ポイント対サイトに関する FAQ

よくあるご質問については、[FAQ](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/vpn-gateway-vpn-faq#P2S) を参照してください。

## 次のステップ

接続が完成したら、VNet に仮想マシンを追加することができます。 詳細については、[Virtual Machines](https://learn.microsoft.com/ja-jp/azure/) に関するページを参照してください。 ネットワークと仮想マシンの詳細については、「[Azure と Linux の VM ネットワークの概要](https://learn.microsoft.com/ja-jp/azure/virtual-network/network-overview)」を参照してください。