# オンプレミスのポリシー ベースの複数の VPN デバイスに VPN ゲートウェイを接続する - Azure VPN Gateway | Microsoft Learn

[Diagram of policy-based VPN.](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/media/vpn-gateway-connect-multiple-policybased-rm-ps/policybasedmultisite.png#lightbox)

![](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/media/vpn-gateway-connect-multiple-policybased-rm-ps/policybasedmultisite.png)

[Diagram of route-based VPN for multiple sites.](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/media/vpn-gateway-connect-multiple-policybased-rm-ps/routebasedmultisite.png#lightbox)

![](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/media/vpn-gateway-connect-multiple-policybased-rm-ps/routebasedmultisite.png)

### ポリシー ベース VPN の Azure のサポート

現在、Azure では、ルート ベース VPN ゲートウェイとポリシー ベース VPN ゲートウェイの両方の VPN ゲートウェイ モードをサポートしています。 これらは異なる内部プラットフォーム上に基づいて構築されているため、結果として異なる仕様になります。 ゲートウェイ、スループット、および接続の詳細については、[「VPN Gateway の設定について」](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/vpn-gateway-about-vpn-gateway-settings)を参照してください。

| ゲートウェイ VPN の種類 | ゲートウェイ SKU | サポートされている IKE バージョン |
| --- | --- | --- |
| ポリシー ベースのゲートウェイ | 基本 | IKEv1 |
| ルート ベースのゲートウェイ | 基本 | IKEv2 |
| ルート ベースのゲートウェイ | VpnGw1, VpnGw2, VpnGw3, VpnGw4, VpnGw5 | IKEv1 および IKEv2 |
| ルート ベースのゲートウェイ | VpnGw1AZ、VpnGw2AZ、VpnGw3AZ、VpnGw4AZ、VpnGw5AZ | IKEv1 および IKEv2 |

以前は、ポリシーベースの VPN を使用する場合、ポリシー ベースの VPN ゲートウェイの Basic SKU しか使用できませんでした。また、1 台のオンプレミス VPN/ファイアウォール デバイスにしか接続できませんでした。 現在では、カスタム IPsec/IKE ポリシーを使用して、ルートベースの VPN ゲートウェイを使用でき、複数のポリシーベースの VPN/ファイアウォール デバイスに接続できるようになりました。 ルートベースの VPN ゲートウェイを使用してポリシーベースの VPN 接続を確立するには、**"PolicyBasedTrafficSelectors"** オプションを使用してプレフィックスベースのトラフィック セレクターを使用するようにルートベースの VPN ゲートウェイを構成します。

**考慮事項**

- この接続を有効にするには、オンプレミス ポリシー ベース VPN デバイスが **IKEv2** をサポートし、Azure ルートベース VPN ゲートウェイに接続する必要があります。 VPN デバイスの仕様を確認してください。
- このメカニズムを使用してポリシー ベース VPN デバイスを介して接続するオンプレミス ネットワークは、Azure 仮想ネットワークにのみ接続できます。**同じ Azure VPN ゲートウェイを介して別のオンプレミス ネットワークまたは仮想ネットワークには移行できません**。
- 構成オプションは、カスタムの IPsec/IKE 接続ポリシーの一部です。 ポリシー ベースのトラフィック セレクター オプションを有効にした場合は、完全なポリシー (IPsec/IKE 暗号化と整合性アルゴリズム、キーの強度、および SA の有効期間) を指定する必要があります。

以下の図は、VPN ゲートウェイを介した移行ルーティングがポリシー ベース オプションで動作しない理由を示しています。

[Diagram of policy-based transit.](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/media/vpn-gateway-connect-multiple-policybased-rm-ps/policybasedtransit.png#lightbox)

![](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/media/vpn-gateway-connect-multiple-policybased-rm-ps/policybasedtransit.png)

図に示すように、Azure VPN ゲートウェイには、仮想ネットワークから各オンプレミス ネットワーク プレフィックスへのトラフィック セレクターはありますが、クロス接続のプレフィックスはありません。 たとえば、オンプレミス サイト 2、サイト 3、サイト 4 はそれぞれ VNet1 と通信できますが、Azure VPN ゲートウェイ経由で相互に接続することはできません。 この図は、この構成で Azure VPN ゲートウェイで使用できないクロス接続トラフィック セレクターを示しています。

## ワークフロー

この記事の手順では、「[S2S VPN または VNet-to-VNet 接続の IPsec/IKE ポリシーを構成する](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/vpn-gateway-ipsecikepolicy-rm-powershell)」に示されている同じ例に従って、S2S VPN 接続を確立します。 これを次の図に示します。

[Diagram shows an image of site-to-site with traffic selectors.](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/media/vpn-gateway-connect-multiple-policybased-rm-ps/s2spolicypb.png#lightbox)

![](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/media/vpn-gateway-connect-multiple-policybased-rm-ps/s2spolicypb.png)

接続を有効にするには、次のワークフローを使います。

1. クロスプレミス接続用に仮想ネットワーク、VPN ゲートウェイ、およびローカル ネットワーク ゲートウェイを作成します。
2. IPsec/IKE ポリシーを作成します。
3. S2S または VNet 対 VNet 接続を作成するときにこのポリシーを適用し、接続で**ポリシー ベース トラフィック セレクターを有効にします**。
4. 接続が既に作成されている場合、既存の接続に対してポリシーを適用または更新することができます。

## ポリシー ベース トラフィック セレクターを有効にする

このセクションでは、接続でポリシー ベース トラフィック セレクターを有効にする方法について説明します。 [IPsec/IKE ポリシーの構成に関する記事のパート 3](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/vpn-gateway-ipsecikepolicy-rm-powershell) を必ず完了しておいてください。 この記事の手順では、同じパラメーターを使用します。

### 仮想ネットワーク、VPN ゲートウェイ、およびローカル ネットワーク ゲートウェイを作成する

1. サブスクリプションに接続します。 コンピューターで PowerShell をローカルで実行している場合は、 *Connect-AzAccount* コマンドレットを使用してサインインします。 または、代わりにブラウザーで Azure Cloud Shell を使用します。
2. 変数を宣言します。 この演習では、次の変数を使用します。 
    
    ```
    $Sub1          = "<YourSubscriptionName>"
    $RG1           = "TestPolicyRG1"
    $Location1     = "East US 2"
    $VNetName1     = "TestVNet1"
    $FESubName1    = "FrontEnd"
    $BESubName1    = "Backend"
    $GWSubName1    = "GatewaySubnet"
    $VNetPrefix11  = "10.11.0.0/16"
    $VNetPrefix12  = "10.12.0.0/16"
    $FESubPrefix1  = "10.11.0.0/24"
    $BESubPrefix1  = "10.12.0.0/24"
    $GWSubPrefix1  = "10.12.255.0/27"
    $DNS1          = "8.8.8.8"
    $GWName1       = "VNet1GW"
    $GW1IPName1    = "VNet1GWIP1"
    $GW1IPconf1    = "gw1ipconf1"
    $Connection16  = "VNet1toSite6"
    $LNGName6      = "Site6"
    $LNGPrefix61   = "10.61.0.0/16"
    $LNGPrefix62   = "10.62.0.0/16"
    $LNGIP6        = "131.107.72.22"
    
    ```
    
3. リソース グループを作成します。 
    
    ```
    New-AzResourceGroup -Name $RG1 -Location $Location1
    
    ```
    
4. 次の例を使用して、3 つのサブネットを持つ仮想ネットワーク TestVNet1 と VPN ゲートウェイを作成します。 値を代入する場合は、ゲートウェイ サブネットの名前を必ず GatewaySubnet にすることが重要です。 別の名前にすると、ゲートウェイの作成は失敗します。 
    
    ```
    $fesub1 = New-AzVirtualNetworkSubnetConfig -Name $FESubName1 -AddressPrefix $FESubPrefix1
    $besub1 = New-AzVirtualNetworkSubnetConfig -Name $BESubName1 -AddressPrefix $BESubPrefix1
    $gwsub1 = New-AzVirtualNetworkSubnetConfig -Name $GWSubName1 -AddressPrefix $GWSubPrefix1
    
    New-AzVirtualNetwork -Name $VNetName1 -ResourceGroupName $RG1 -Location $Location1 -AddressPrefix $VNetPrefix11,$VNetPrefix12 -Subnet $fesub1,$besub1,$gwsub1
    
    $gw1pip1    = New-AzPublicIpAddress -Name $GW1IPName1 -ResourceGroupName $RG1 -Location $Location1 -AllocationMethod Dynamic
    $vnet1      = Get-AzVirtualNetwork -Name $VNetName1 -ResourceGroupName $RG1
    $subnet1    = Get-AzVirtualNetworkSubnetConfig -Name "GatewaySubnet" -VirtualNetwork $vnet1
    $gw1ipconf1 = New-AzVirtualNetworkGatewayIpConfig -Name $GW1IPconf1 -Subnet $subnet1 -PublicIpAddress $gw1pip1
    
    New-AzVirtualNetworkGateway -Name $GWName1 -ResourceGroupName $RG1 -Location $Location1 -IpConfigurations $gw1ipconf1 -GatewayType Vpn -VpnType RouteBased -GatewaySku VpnGw1
    
    New-AzLocalNetworkGateway -Name $LNGName6 -ResourceGroupName $RG1 -Location $Location1 -GatewayIpAddress $LNGIP6 -AddressPrefix $LNGPrefix61,$LNGPrefix62
    
    ```
    

### IPsec/IKE ポリシーを使って S2S VPN 接続を作成する

1. IPsec/IKE ポリシーを作成します。     
    
    重要
    
    接続で "UsePolicyBasedTrafficSelectors" オプションを有効にするために、IPsec/IKE ポリシーを作成する必要があります。
    
    次の例では、以下のアルゴリズムとパラメーターを使用して IPsec/IKE ポリシーを作成します。
    
    - IKEv2:AES256、SHA384、DHGroup24
    - IPsec: AES256、SHA256、PFS なし、SA の有効期間 14,400 秒および 102,400,000 KB
    
    ```
    $ipsecpolicy6 = New-AzIpsecPolicy -IkeEncryption AES256 -IkeIntegrity SHA384 -DhGroup DHGroup24 -IpsecEncryption AES256 -IpsecIntegrity SHA256 -PfsGroup None -SALifeTimeSeconds 14400 -SADataSizeKilobytes 102400000
    
    ```
    
2. ポリシー ベース トラフィック セレクターと IPsec/IKE ポリシーを使用して S2S VPN 接続を作成し、前の手順で作成した IPsec/IKE ポリシーを適用します。 追加のパラメーター "-UsePolicyBasedTrafficSelectors $True" に注意してください。これにより、接続に対してポリシー ベース トラフィック セレクターが有効になります。 
    
    ```
    $vnet1gw = Get-AzVirtualNetworkGateway -Name $GWName1  -ResourceGroupName $RG1
    $lng6 = Get-AzLocalNetworkGateway  -Name $LNGName6 -ResourceGroupName $RG1
    
    New-AzVirtualNetworkGatewayConnection -Name $Connection16 -ResourceGroupName $RG1 -VirtualNetworkGateway1 $vnet1gw -LocalNetworkGateway2 $lng6 -Location $Location1 -ConnectionType IPsec -UsePolicyBasedTrafficSelectors $True -IpsecPolicies $ipsecpolicy6 -SharedKey 'AzureA1b2C3'
    
    ```
    
3. 手順が完了したら、S2S VPN 接続は、定義された IPsec/IKE ポリシーを使用し、接続でポリシー ベース トラフィック セレクターを有効にします。 同じ手順を繰り返し、同じ Azure VPN ゲートウェイから追加のオンプレミス ポリシー ベース VPN デバイスへの接続を追加できます。

## ポリシー ベース トラフィック セレクターを更新する

このセクションでは、既存の S2S VPN 接続のポリシー ベース トラフィック セレクター オプションを更新する方法について説明します。

1. 接続リソースを取得します。 
    
    ```
    $RG1          = "TestPolicyRG1"
    $Connection16 = "VNet1toSite6"
    $connection6  = Get-AzVirtualNetworkGatewayConnection -Name $Connection16 -ResourceGroupName $RG1
    
    ```
    
2. ポリシー ベース トラフィック セレクター オプションを表示します。 次の行は、ポリシー ベース トラフィック セレクターが接続に使用されているかどうかを示しています。  
    
    ```
    $connection6.UsePolicyBasedTrafficSelectors
    
    ```
    
    この行が "**True**" を返す場合、ポリシー ベース トラフィック セレクターが接続で構成されています。それ以外の場合は "**False**" が返されます。
    
3. 接続リソースを取得したら、接続に対してポリシー ベース トラフィック セレクターを有効または無効にできます。 
    - 有効にするには
        
        次の例では、ポリシー ベース トラフィック セレクター オプションを有効にしますが、IPsec/IKE ポリシーは変更されません。
        
        ```
        $RG1          = "TestPolicyRG1"
        $Connection16 = "VNet1toSite6"
        $connection6  = Get-AzVirtualNetworkGatewayConnection -Name $Connection16 -ResourceGroupName $RG1
        
        Set-AzVirtualNetworkGatewayConnection -VirtualNetworkGatewayConnection $connection6 -UsePolicyBasedTrafficSelectors $True
        
        ```
        
    - 無効にするには
        
        次の例では、ポリシー ベース トラフィック セレクター オプションを無効にしますが、IPsec/IKE ポリシーは変更されません。
        
        ```
        $RG1          = "TestPolicyRG1"
        $Connection16 = "VNet1toSite6"
        $connection6  = Get-AzVirtualNetworkGatewayConnection -Name $Connection16 -ResourceGroupName $RG1
        
        Set-AzVirtualNetworkGatewayConnection -VirtualNetworkGatewayConnection $connection6 -UsePolicyBasedTrafficSelectors $False
        
        ```
        

## 次のステップ

接続が完成したら、仮想ネットワークに仮想マシンを追加することができます。 手順については、 [仮想マシンの作成](https://learn.microsoft.com/ja-jp/azure/virtual-machines/windows/quick-create-portal) に関するページを参照してください。

カスタムの IPsec/IKE ポリシーの詳細については、[S2S VPN または VNet 対 VNet 接続用のIPsec/IKE ポリシーを構成する](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/vpn-gateway-ipsecikepolicy-rm-powershell)に関するページも参照してください。