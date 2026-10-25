---
publish: true
title: README
created: 2026-10-05T12:24:40.715Z
modified: 2026-10-25T16:24:00.842Z
---

# Quartz更新履歴

---

### 2026-10-23：サイドバー幅の調整

#### 利用者から見た変更

- 左サイドバー（Explorer）の幅を320pxから420pxに広げました。
- 右サイドバーは320pxに維持しました。
- 中央の本文領域は`auto`とし、利用可能な幅を割り当てています。
- 800～1200pxのタブレット表示では、左420px・中央`auto`の2列構成になります。

#### 技術的変更

対象ファイル：

- `quartz/styles/variables.scss`
  変更内容：
- `$sidePanelWidth`を、次の左右別変数に分割しました。
  - `$leftSidePanelWidth: 420px`
  - `$rightSidePanelWidth: 320px`
- `$tabletGrid`の第1列に`$leftSidePanelWidth`を使用しました。
- `$desktopGrid`を`420px auto 320px`の3列構成に変更しました。

#### 対応コミット

- `341809d`：Quartzのサイドメニューの幅を修正 320→420
- `eb4ba61`：サイドメニューと右のインフォメーションバーの幅を個別設定できるように修正

---

### 2026-10-13：公開記事の更新

Quartz Syncerを使用して、`content/`配下の記事を追加・更新・削除しました。
この日の変更はサイト機能の変更ではなく、記事公開として扱います。

#### 対応コミット

- `18382e3`
- `329e50a`
- `aa0a697`
- `e4eaf43`

---

### 2026-10-07：Quartz 4からQuartz 5への移行

#### 利用者から見た変更

- 既存の記事を維持したまま、サイトの公開基盤をQuartz 4からQuartz 5へ切り替えました。
- GitHub Pagesへの自動デプロイを追加しました。

#### 技術的変更

##### Quartz 5への移行

- `quartz.config.yaml`を追加しました。
- Node.js 22を指定する`mise.toml`を追加しました。
- `package-lock.json`を更新しました。
- `content/`配下へ133ファイルを追加し、1ファイルを削除しました。

#### 対応コミット：

- `dbada74`：Migrate site from Quartz 4 to Quartz 5

##### GitHub Pagesへの自動デプロイ

- `.github/workflows/deploy.yml`を追加しました。
- `v5`ブランチへのpushまたは手動実行でビルドを開始します。
- `npm ci`、Quartzプラグインの導入、`quartz build`の順に実行します。
- 生成された`public`をArtifactとしてアップロードし、GitHub Pagesへデプロイします。

#### 対応コミット：

- `f265491`：Add GitHub Pages deployment for Quartz 5

---

# 運用方法

## 記事のアップロード方法

1. publishプロパティをTrueに変更する。
2. draftプロパティをFalseに変更する。
3. Quartz Syncer Publication Centerのアイコンをクリックする。
4. アップロード対象の記事を選択（チェックボックスON）する。
5. Publish to Remoteボタンをクリックする。

以上を行うとGitHub Actionでビルドされて、ビルドが完了するとQuartzサイトに表示される。

---

# このサイトについて

このサイトはQuartzを使用して作成しています。
Quartzについては以下をご覧ください。

# Quartz v5

> “\[One] who works with the door open gets all kinds of interruptions, but \[they] also occasionally gets clues as to what the world is and what might be important.” — Richard Hamming

Quartz is a set of tools that helps you publish your [digital garden](https://jzhao.xyz/posts/networked-thought) and notes as a website for free.

🔗 Read the documentation and get started: https://quartz.jzhao.xyz/

[Join the Discord Community](https://discord.gg/cRFFHYye7t)

## Sponsors

<p align="center">
  <a href="https://github.com/sponsors/jackyzha0">
    <img src="https://cdn.jsdelivr.net/gh/jackyzha0/jackyzha0/sponsorkit/sponsors.svg" />
  </a>
</p>
