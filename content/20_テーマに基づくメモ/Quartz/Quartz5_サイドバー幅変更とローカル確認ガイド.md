---
publish: true
title: Quartz5 サイドバー幅変更とローカル確認ガイド
created: 2026-10-23
modified: 2026-10-25T16:22:38.334Z
tags:
  - Quartz
  - GitHub
  - SCSS
  - 運用手順
---

# Quartz 5 サイドバー幅変更とローカル確認ガイド

Explorerの日本語ファイル名を読みやすくしつつ、本文幅を確保するための運用手順です。

| 対象        | 内容                                                                    |
| --------- | --------------------------------------------------------------------- |
| プロジェクト    | `\Git\caitsith-portfolio`                                             |
| 主な修正ファイル  | `quartz/styles/variables.scss`                                        |
| 変更前の設計    | 左サイドバー 320px / 中央 auto / 右サイドバー 320px                                 |
| 変更後の設計    | 左サイドバー 420px / 中央 auto / 右サイドバー 320px                                 |
| 変更結果の確認方法 | ビルド　`npx quartz build --serve` <br>　→ ブラウザー表示　`http://localhost:8080` |

## 変更ポイント

Explorerの幅は、`\Git\caitsith-portfolio\quartz\styles\variables.scss`内の、`$sidePanelWidth`で左右のペインの幅を決めているため、ここを2つの変数に分けて左側だけ幅を広げます。

## この修正を行う場面

- 長い日本語ファイル名の折り返しが気になったとき
- 右側のGraph ViewやTable of Contentsとのバランスを調整したいとき

---

## 1. 実施した修正内容

修正前は`$sidePanelWidth`が左右両方に適用されていました。420pxへ広げると左側のメニューは読みやすくなりましたが、右側も420pxになり、中央本文が必要以上に狭くなりました。
そこで、`$desktopGrid`の`templateColumns: "#{$leftSidePanelWidth} auto #{$rightSidePanelWidth}"`のところの変数を２つに分けてることで、左右の幅を独立させています。

| 領域  | 変数名                  |   設定値 | 目的                         |
| --- | -------------------- | ----: | -------------------------- |
| 左   | $leftSidePanelWidth  | 420px | Explorerの日本語ファイル名の折り返しを減らす |
| 中央  | 自動設定                 |  auto | 残り幅を本文へ割り当てる               |
| 右   | $rightSidePanelWidth | 320px | Graph Viewと目次を維持しつつ本文幅を戻す  |

### 修正対象

```text
\Git\caitsith-portfolio\quartz\styles\variables.scss
```

### 幅の設定箇所（pixel単位）

```scss
$leftSidePanelWidth: 420px;
$rightSidePanelWidth: 320px;
```

### Grid定義での使用

```scss
// タブレットの幅設定
$tabletGrid: (
  templateColumns: "#{$leftSidePanelWidth} auto",
  // その他の既存設定は維持
);

// ブラウザーの幅設定
$desktopGrid: (
  templateColumns: "#{$leftSidePanelWidth} auto #{$rightSidePanelWidth}",
  // その他の既存設定は維持
);
```

### 変更時の注意

- `mobileGrid`、`grid-template-areas`、行構成、`gap`、ブレークポイントは不用意に変更しない
- `public`配下の生成済みCSSは直接編集しない。次回ビルドで上書きされるため
- 変更前に`git status`と`git diff`を確認し、既存の未コミット変更を把握する

---

## 2. 今後、幅を再調整する方法

### 1. プロジェクトをVS Codeで開く

PowerShellからプロジェクト直下を開きます。OneDriveのルート名が環境と異なる場合は、エクスプローラーから対象フォルダーをVS Codeで開いても構いません。

```powershell
cd "$env:USERPROFILE\OneDrive\ドキュメント\Git\caitsith-portfolio"
code .
```

### 2. 変更前の差分を確認する

現在の作業を上書きしないため、変更済みファイルと差分を先に確認します。

```powershell
git status
git diff
```

### 3. 左右の変数を調整する

`quartz/styles/variables.scss`の値だけを微調整します。まずは10～20px刻みで変更すると、どの変更が効いたか判断しやすくなります。

```scss
$leftSidePanelWidth: 440px;  // Explorerをさらに広げる例
$rightSidePanelWidth: 300px; // 本文幅を少し戻す例
```

### 判断基準

| 症状 | 調整の方向 |
|---|---|
| Explorerの折り返しが多い | 左を+10～20px |
| 中央本文が狭い | 右を-10～20px。必要なら左も少し戻す |
| Graph Viewが窮屈 | 右を+10～20px |
| 横スクロールが出る | 左右合計を減らすか、ブラウザー幅とブレークポイントを確認 |

> [!note] 原則
> 左を広げるほどExplorerは読みやすくなりますが、中央本文は狭くなります。右を狭めると中央本文へ幅を戻せます。数値単体ではなく、左・中央・右の合計バランスで判断します。

---

## 3. ローカルビルドとブラウザー確認

### 1. 必要バージョンを確認する

Quartz 5はNode.jsとnpmを使用します。既に動作している環境では毎回の再インストールは不要です。

```powershell
node --version
npm --version
```

### 2. 通常ビルドでエラーを確認する

プロジェクト直下でQuartzをビルドします。既定の出力先は`public`です。

```powershell
npx quartz build
```

### 3. 開発サーバーを起動する

ブラウザー確認時は`--serve`を付けます。ファイル変更の監視も有効になり、保存後の再確認がしやすくなります。

```powershell
npx quartz build --serve
```

### 4. ブラウザーで表示する

ターミナルに表示されたURLを開きます。既定ポートを使う場合は次のURLです。

```text
http://localhost:8080
```

PowerShellから既定ブラウザーを開く場合：

```powershell
Start-Process "http://localhost:8080"
```

### 画面確認チェックリスト

- 左Explorer：長い日本語名の折り返しが許容範囲か
- 中央本文：文章が読みにくいほど狭くないか
- 右側：Graph ViewとTable of Contentsが収まるか
- 全体：意図しない横スクロールが出ていないか
- ウィンドウを狭めたとき：タブレット・モバイル表示が崩れないか

### 終了と最終確認

確認後はサーバーを起動したターミナルで`Ctrl + C`を押して終了し、最後に差分を再確認します。

```powershell
git status
git diff
```

### トラブル時の早見表

| 現象 | 確認 |
|---|---|
| Sassコンパイルエラー | 変数名の綴り、`$`、セミコロン、`#{}`補間を確認 |
| 変更が反映されない | 編集ファイル、保存、開発サーバー、ブラウザー再読み込みを確認 |
| 8080が使用中 | `npx quartz build --serve --port 3000`など別ポートを指定 |
| 生成物が大量変更 | `public`がGit管理対象か確認し、ソース変更と分けて扱う |
