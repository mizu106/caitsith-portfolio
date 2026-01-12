---
tags:
  - OS/Windows
  - Programming
---
# イベントログの仕組み - Windows 徹底解説 - Web/DB プログラミング徹底解説

イベントログは高速に記録可能かつローカライズが容易なように、 独特の仕組みで実装されています。

イベントログは次の仕組みで表示されています。

![](https://www.keicode.com/windows/how-event-log-works/fig1.png)

主なコンポーネントは以下の三つです。

- ログを記録するプログラム
- メッセージファイル
- メッセージファイルの登録

プログラムがイベントログに対して、ログを記録します。 通常それは主にメッセージの ID とパラメータという形で記録を行います。

イベントビューアにてログを表示する場合は、プログラムが記録した ID を元にメッセージファイルからメッセージ文字列を取得します。 レジストリの登録情報から使用するメッセージファイルを特定します。

登録はレジストリの、HKLM\SYSTEM\CurrentControlSet\Services\EventLog\ の下に Application, System, Security それぞれの設定を行います。

メッセージは書式付のフォーマットの形式で登録されているものもあり、 その場合は、プログラムが渡したパラメータと合わせて、最終的なメッセージが決まります。

## イベントログ API の利用

ログを記録するプログラムは以下の API を利用します。

- イベントソースの登録とハンドルの取得 ～ RegisterEventSource
- イベントの書き込み ～ ReportEvent
- 登録の解除 ～ DeregisterEventSource

![](https://www.keicode.com/windows/how-event-log-works/fig2.png)

### メッセージファイルの作成

メッセージファイルは DLL または EXE にリソースとしてメッセージ情報を埋め込んだものです。 一般的には dll が使用されます。この dll をレジストリに登録し、それをイベントビューがが参照します。

![](https://www.keicode.com/windows/how-event-log-works/fig3.png)

尚、リソースのみのリソース DLL を作成する場合は /NOENTRY リンカオプションを利用すると良いでしょう。

ここまでお読みいただき、誠にありがとうございます。SNS 等でこの記事をシェアしていただけますと、大変励みになります。どうぞよろしくお願いします。