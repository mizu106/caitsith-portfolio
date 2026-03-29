---
tags:
  - Network/VPN
  - Network/NW機器
---

# 概要
**ゼロトラストネットワーク**が広まって**VPNは危険**と言われるようになっていますが、**ZTNA(Zero Trust Network Access)** を個人で利用するのはハードルが高い…　という事でFORTINETのVPN機器導入について調べました。
併せて、ZTNAやSIGについても知らなかったので、調べたことをメモしています。

# 本文
[FortiGate から SSL VPN設定がGUIから消えた？FortiOS 7.4.1の仕様変更 | MSeeeeN](https://mseeeen.msen.jp/fortios-ssl-vpn-behavior-gui/)

[Fortigate-40F | 製品情報 | FortiGate (フォーティゲート) UTMを特価価格で販売](https://www.fgshop.jp/product/fortigate/fortigate-40f/)

[FortiGateでVPN（L2TP/IPsec）を設定しよう - 株式会社ネディア │ネットワークの明日を創る│群馬](https://www.nedia.ne.jp/blog/tech/2021/03/02/17467)

![[FG-40F_DS.pdf]]

# 参考資料
## VPNについて
- [VPNとは？　仕組みや主な種類、メリットとデメリットを徹底解説！｜インターコム](https://www.intercom.co.jp/remoteoperator/helpdesk/column/about-vpn/?utm_source=bing&utm_medium=cpc&utm_campaign=dynamicsearchads&utm_content=remoteoperatorhelpdesk_dynamicsearchads)
- [SSL-VPNオンプレミスアプライアンスとクラウドプライベートアクセスの比較 | バンブロ ！ ネットワークソリューション特集](https://blogs.techvan.co.jp/ns/2022/12/23/ssl-vpn-appliance-vs-private-access/)
- [インターネットVPNとは？ IP-VPNや閉域網との違いを解説 | freebit IoT通信](https://mvno.freebit.com/column/security/internet-vpn.html)

## Azure VPN Gateway
- [VPN Gateway のドキュメント | Microsoft Learn](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/)

## ZTNAの記事
- [ZTNAとは？VPNとの違いやメリットなどをわかりやすく解説 | アルテリア・ネットワークス株式会社](https://www.arteria-net.com/business/column/ztna)

## SIGの記事
セキュアインターネットゲートウェイ（Secure Internet Gateway：SIG）とは、=クラウドベースのセキュリティソリューションで、企業のネットワークをインターネットに安全に接続するサービス=です。

SIGの主な機能は次のとおりです。ウェブフィルタリング、マルウェア対策、脅威インテリジェンス、 セキュリティポリシーの適用。
- [SIG（セキュア・インターネット・ゲートウェイ）とは？意味・用語説明｜IT用語集｜KDDI株式会社](https://biz.kddi.com/content/glossary/s/sig/)
- [セキュアインターネットゲートウェイ | アルテリア・ネットワークス株式会社](https://www.arteria-net.com/business/service/internet/line/firewall/#:~:text=%E3%80%8C%E3%82%BB%E3%82%AD%E3%83%A5%E3%82%A2%E3%82%A4%E3%83%B3%E3%82%BF%E3%83%BC%E3%83%8D%E3%83%83%E3%83%88%E3%82%B2%E3%83%BC%E3%83%88%E3%82%A6%E3%82%A7%E3%82%A4%E3%80%8D%E3%81%AF%E3%80%81,%E8%BB%BD%E6%B8%9B%E3%81%8C%E5%8F%AF%E8%83%BD%E3%81%A8%E3%81%AA%E3%82%8A%E3%81%BE%E3%81%99%E3%80%82)

## ZTNAとSIGの違い
ZTNA（Zero Trust Network Access）は「特定の社内アプリやデータ」への安全なアクセスに特化し、ユーザー・端末の常時検証を行う技術。一方、SIG（Secure Internet Gateway）は「インターネット全体」への通信を保護するゲートウェイ機能（SWG、CASB、FWaaS等）の総称。ZTNAはアクセス権管理、SIGはインターネットの境界防衛と、守る対象と役割が異なる。
### ZTNAとSIGの使い分けと関係
- **ZTNA:** 社外から社内サーバーや特定のSaaSへ、安全に接続したい場合に利用。
- **SIG:** 社員が社外（パブリック）のWebサイトやSaaSを閲覧する際のセキュリティ（ウイルス対策やWeb制限）に利用。
- **関係性:** どちらも「ゼロトラスト」という概念を実現するための異なるツールであり、近年はSASE（Secure Access Service Edge）フレームワークにおいて、これらの機能が統合され提供されるケースが多い。
### 参考URL
- [CASB、SWG、ZTNAとは？ゼロトラスト・セキュリティ用語解説 - Key Technology｜CTC - 伊藤忠テクノソリューションズ](https://www.ctc-g.co.jp/keys/blog/detail/2033-casb-swg-ztna)
- [ZTNAとは？VPNとの違いや導入メリットを紹介！｜ZTNAとは？VPNとの違いや導入メリットを紹介！](https://www.ctc-saas.com/security_column/useful/ztna#:~:text=ZTNA%E3%81%AF%E3%80%8CZero%20Trust%20Network,%E3%81%A8%E3%81%97%E3%81%A6%E6%B3%A8%E7%9B%AE%E3%81%95%E3%82%8C%E3%81%A6%E3%81%84%E3%81%BE%E3%81%99%E3%80%82)

