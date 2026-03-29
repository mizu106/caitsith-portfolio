---
tags:
  - DB/SQLServer
---

# 概要
SQL Serverは手軽でMicrosoft環境ではよく導入されているので、気になったことを調べてメモしています。
現在はExpressエディションについてのみです。

# 本文
## 目次
```table-of-contents
title: 
style: nestedList # TOC style (nestedList|nestedOrderedList|inlineFirstLevel)
minLevel: 0 # Include headings from the specified level
maxLevel: 0 # Include headings up to the specified level
include: 
exclude: 
includeLinks: true # Make headings clickable
hideWhenEmpty: false # Hide TOC if no headings are found
debugInConsole: false # Print debug info in Obsidian console
```

## SQL Serverのエディション
「SQL Serverライト」は通常、**SQL Server Express Edition**（エクスプレスエディション）を指します。これは、有償の**Standard Edition**（標準版）などと比較して、**無償である代わりに機能や性能に制限がある**点が主な違いです。

### 主な違い

| 項目                           | SQL Server Express Edition | SQL Server Standard Edition |
| ---------------------------- | -------------------------- | --------------------------- |
| **費用**                       | **無償**                     | **有償**                      |
| **データベースサイズ上限**              | **10 GB**まで                | 524 PBまで (実質無制限)            |
| **利用可能メモリ**                  | 約1.4 GBまで                  | 128 GBまで (Standard 2022の場合) |
| **利用可能CPUコア数**               | 1ソケットまたは4コアまで              | OSの最大値まで (制限緩和)             |
| **高可用性機能**                   | サポートなし                     | データベースミラーリングなどサポート          |
| **管理ツール (SQL Server Agent)** | なし (タスクの自動化が困難)            | あり (バックアップなどの自動化が可能)        |

### 主な制限事項と影響
- **データベースサイズの上限 (10GB)**: これが最も重要な制限で、データ量が増えると書き込みエラーが発生したり、アプリケーションが正常に動作しなくなる可能性があります。
- **メモリとCPUの制限**: サーバーのスペックが高くても、Express Editionは決められた上限までしかリソースを使用しないため、パフォーマンスが制限されます。
- **管理機能の制限**: SQL Server Agentなどの高度な管理ツールが含まれていないため、バックアップなどの定期的な運用タスクを手動または別の方法で設定する必要があります。

### 用途の使い分け
- **SQL Server Express**は、学習、開発用途、または小規模なデスクトップ/Webアプリケーションに適しています。
- **SQL Server Standard**は、企業の部門システムや中規模アプリケーションなど、より高いパフォーマンス、信頼性、管理機能が求められる環境で使用されます。 

データベースのサイズや必要な機能に応じて、適切なエディションを選択することが重要です。公式な機能比較表は、[Microsoft Learn](https://learn.microsoft.com/ja-jp/sql/sql-server/editions-and-components-of-sql-server-2022?view=sql-server-ver17)で確認できます。