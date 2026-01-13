
## この記事の内容

1. [前提条件](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/point-to-site-entra-vpn-client-windows#prerequisites)
2. [ワークフロー](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/point-to-site-entra-vpn-client-windows#workflow)
3. [Azure VPN クライアントをダウンロードする](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/point-to-site-entra-vpn-client-windows#download)
4. [クライアント プロファイルの構成ファイルを抽出する](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/point-to-site-entra-vpn-client-windows#generate)

この記事は、VPN Gateway ポイント対サイト (P2S) VPN と Microsoft Entra ID 認証を使用して仮想ネットワークに接続するように Windows コンピューター上の Azure VPN クライアントを構成する際に役立ちます。 ポイント対サイト接続について詳しくは、[ポイント対サイト接続](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/point-to-site-about)に関するページを参照してください。 Azure VPN クライアントは、[KB4577063](https://support.microsoft.com/help/4577063/windows-10-update-kb4577063) 修正プログラムを使用した Windows FIPS モードでサポートされています。

## 前提条件

Microsoft Entra ID 認証を指定するポイント対サイト VPN 接続用に VPN ゲートウェイを構成します。 「[Microsoft Entra ID 認証用に P2S VPN ゲートウェイを構成する](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/point-to-site-entra-gateway)」を参照してください。

## ワークフロー

この記事では、「[Microsoft Entra ID 認証用に P2S VPN ゲートウェイを構成する](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/point-to-site-entra-gateway)」の手順の続きを扱います。 この記事は次のことに役立ちます。

1. Windows 用 Azure VPN クライアントをダウンロードしてインストールします。
2. VPN クライアント プロファイル構成ファイルを抽出します。
3. クライアント プロファイル設定を VPN クライアントにインポートします。
4. 接続を作成し、Azure に接続します。

## Azure VPN クライアントをダウンロードする

1. 次のいずれかのリンクを使用して、最新バージョンの Azure VPN クライアント インストール ファイルをダウンロードします。 
    - クライアント インストール ファイルを使用してインストールする: [https://aka.ms/azvpnclientdownload](https://aka.ms/azvpnclientdownload)。
    - クライアント コンピューターにサインインしたときに直接インストールする: [Microsoft Store](https://go.microsoft.com/fwlink/?linkid=2117554)。
2. Azure VPN クライアントを各コンピューターにインストールします。
3. Azure VPN クライアントにバックグラウンドで実行するためのアクセス許可があることを確認してください。 手順については、[Windows バックグラウンド アプリ](https://support.microsoft.com/windows/windows-background-apps-and-your-privacy-83f2de44-d2d9-2b29-4649-2afe0913360a#ID0EBD=Windows_11)に関するページを参照してください。
4. インストールされているクライアントのバージョンを確認するには、Azure VPN クライアントを開きます。 クライアントの下部に移動し、**[...] -> [? ヘルプ]** をクリックします。 右側のウィンドウで、クライアントのバージョン番号を確認できます。

## クライアント プロファイルの構成ファイルを抽出する

Azure VPN クライアント プロファイルを構成するには、Azure P2S ゲートウェイから VPN クライアント プロファイル構成パッケージをダウンロードする必要があります。 このパッケージは、構成された VPN ゲートウェイに固有のものとなり、VPN クライアントを構成するために必要な設定が含まれます。

「[前提条件](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/point-to-site-entra-vpn-client-windows#prerequisites)」セクションで説明されているように P2S サーバー構成手順を使用した場合は、VPN プロファイル構成ファイルを含む VPN クライアント プロファイル構成パッケージが既に生成およびダウンロードされています。 構成ファイルを生成する必要がある場合は、「[VPN クライアント プロファイル構成パッケージをダウンロードする](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/point-to-site-entra-gateway#download)」を参照してください。

VPN クライアント プロファイル構成パッケージを取得したら、zip ファイルを抽出します。 このファイルには、次のフォルダーが含まれています。

- **AzureVPN**: AzureVPN フォルダーには、Azure VPN クライアントを構成する際に使用する **Azurevpnconfig.xml** ファイルが含まれています。
- **generic**: generic フォルダーには、パブリック サーバー証明書と VpnSettings.xml ファイルが含まれています。 VpnSettings.xml ファイルには、汎用クライアントの構成に必要な情報が含まれています。

## クライアント プロファイル構成設定のインポート

注意

Azure Active Directory の Azure VPN クライアント フィールドを Microsoft Entra ID に変更しています。 この記事で参照されている Microsoft Entra ID フィールドが表示されていても、それらの値がクライアントに反映されていない場合は、同等の Azure Active Directory 値を選択します。

P2S 構成で Microsoft Entra ID 認証が指定されている場合、VPN クライアント プロファイルの構成設定は **azurevpnconfig.xml** ファイルに含まれます。 ファイルは、VPN クライアント プロファイル構成パッケージの **AzureVPN** フォルダーにあります。

1. ページ上で、 **[インポート]** を選択します。 
    
    [[追加] ボタンが選択され、[インポート] 操作がウィンドウの左下で強調表示されていることを示すスクリーンショット。](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/media/point-to-site-entra-vpn-client-windows/import.png#lightbox)
    
    ![](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/media/point-to-site-entra-vpn-client-windows/import.png)
    
2. 抽出した Azure VPN クライアント プロファイル構成フォルダーに移動します。 AzureVPN フォルダーで **azurevpnconfig.xml** ファイルを選択します。 ファイルが選択された状態で、 **[開く]** を選択します。
3. 接続名の名前を変更します (省略可能)。 この例では、表示される対象ユーザーの値が、Microsoft で登録された Azure VPN クライアント アプリ ID に関連付けられた新しい Azure パブリック値になっています。 このフィールドの値は、P2S VPN ゲートウェイが使用するように構成されている値と一致する必要があります。 
    
    ![](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/media/point-to-site-entra-vpn-client-windows/connection-properties.png)
    
4. **[保存]** をクリックして接続プロファイルを保存します。
5. 左側のペインで、使用する接続プロファイルを選択します。 **[接続]** をクリックして、接続を開始します。 
    
    [VPN と [接続] ボタンが選択されていることを示すスクリーンショット。](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/media/point-to-site-entra-vpn-client-windows/connect.png#lightbox)
    
    ![](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/media/point-to-site-entra-vpn-client-windows/connect.png)
    
6. プロンプトが表示されたら、資格情報を使用して認証します。
7. 接続されると、アイコンが緑色に変わり、**[接続済み]** と表示されます。

### 自動的に接続するには

Always-on を使用して自動的に接続するように構成するには、次の手順に従います。

1. VPN クライアントのホームページで、 **[VPN 設定]** を選択します。 アプリ切り替えのダイアログ ボックスが表示されたら、**[はい]** を選択します。 
    
    [VPN ホームページのスクリーンショット。[VPN 設定] が選択されています。](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/media/point-to-site-entra-vpn-client-windows/vpn-settings.png#lightbox)
    
    ![](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/media/point-to-site-entra-vpn-client-windows/vpn-settings.png)
    
2. 構成する接続が接続されている場合、接続を切断し、プロファイルを強調表示し、**[自動的に接続する]** チェック ボックスをオンにします。 
    
    [接続] を選択して接続を開始します。
    
    ![](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/media/point-to-site-entra-vpn-client-windows/automatic.png)
    

## クライアント プロファイルをエクスポートおよび配布する

使用するプロファイルを作成した後、それを他のユーザーに配布する必要がある場合は、次の手順に従ってプロファイルをエクスポートできます。

1. エクスポートする VPN クライアント プロファイルを強調表示し、 **[...]** を選択して、 **[エクスポート]** を選択します。 
    
    このプロファイルを保存する場所を選択し、ファイル名はそのままで、 [保存] を選択して xml ファイルを保存します。
    
    ![](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/media/point-to-site-entra-vpn-client-windows/export.png)
    

## クライアント プロファイルを削除する

1. 削除するクライアント プロファイルの横にある省略記号を選択します。 **[削除]** を選択します。 
    
    確認ポップアップで、[削除] を選択して削除します。
    
    ![](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/media/point-to-site-entra-vpn-client-windows/remove.png)
    

## 接続の問題を診断する

1. 接続の問題を診断するには、**診断**ツールを使用します。 診断する VPN 接続の横にある **[...]** を選択して、メニューを表示します。 次に、 **[診断]** を選択します。 **[接続プロパティ]** ページで、**[診断の実行]** を選択します。 
    
    [省略記号と [診断] が選択されていることを示すスクリーンショット。](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/media/point-to-site-entra-vpn-client-windows/diagnose.png#lightbox)
    
    ![](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/media/point-to-site-entra-vpn-client-windows/diagnose.png)
    
2. 求められたら、自分の資格情報でサインインします。
3. 結果を表示します。

## オプションのクライアント構成設定

追加の DNS サーバー、カスタム DNS、強制トンネリング、カスタム ルート、その他の設定などのオプションの構成設定を使用して Azure VPN クライアントを構成できます。 詳細については、[Azure VPN クライアントのオプション設定](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/azure-vpn-client-optional-configurations)に関するページを参照してください。

## Azure VPN クライアントのバージョン情報

Azure VPN クライアントのバージョン情報については、[「Azure VPN クライアントのバージョン」](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/azure-vpn-client-versions)を参照してください。

## 次のステップ

[ポイント対サイト接続について](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/point-to-site-about)