---
tags:
  - AI
  - HW/GPU
  - 教材/サプー
  - Python
---

# 自宅PCのGPUを使ってみる
サプーさんの動画を使って、自宅PCのGPUを動作させてみる。
- [NVIDIAのGPUをAIで使ってみよう！〜 ローカルPCでAIを動かす〜 WSLを使ったバージョン](https://www.youtube.com/watch?v=K_lgT7Bba8k)

GPUの使用状況を確認するコマンド
```Powershell
nvidia-smi
```

## NVIDIAのドライバーインストール
1. 上記動画サイトにリンクあり。
   自分のノートPCのGPUは*NVIDIA GeForce GTX 1050*だったので、シリーズは*GTX 10シリーズ*、最新のドライバーをインストールした。
2. WSLのGPGキー削除（動画の通り）

- [GTX 1050とは？スペックや性能、ベンチマークまで徹底解説 - | 法人様向けパソコンならドスパラプラス](https://dosparaplus.com/library/details/001263.html)

## WSLのディスク移動
ここからWSL上の作業が始まるが、Cドライブの容量が足りなくなり、必要なパッケージのインストールに失敗したので、WSLのVHDファイルをEドライブに移動した。

### WSLのVHDファイルの格納場所
` C:\Users\mizu1\AppData\Local\wsl `

### VHDファイル移動（ディストリビューション移動ツール）
- [WSL2が原因でCドライブの容量が不足したときの対処法（2025年8月版） #WSL2 - Qiita](https://qiita.com/stqq/items/2262e2adb9c8d82739d0)

1. WSLをシャットダウン
      ``` shell
      wsl --shutdown
   ```
2. VHDの圧縮
   Optimize-VHDコマンドが使えたので、それを使用。
      ``` shell
    Optimize-VHD -Path "C:\Users\<ユーザー名>\AppData\Local\Packages\<PackageFamilyName>\LocalState\ext4.vhdx" -Mode Full
   ```
3. VHDを扱うツールをダウンロード
   [LxRunOffline](https://github.com/DDoSolitary/LxRunOffline/releases)
4. ディストリビューションを移動
   *Dドライブに移動する例*
   ```shell
   .\LxRunOffline.exe move -n Ubuntu -d D:\WSL\Ubuntu
.\LxRunOffline.exe move -n docker-desktop -d D:\WSL\docker-desktop
   ```

何故か*移動先にファイルがあるというエラーが発生して失敗した*ので、手でファイルを移動して、wslコマンドでディストリビューションを削除、再登録した。

### ディストリビューションの手作業移動
-　ディストリビューションの一覧表示
```Powershell
wsl --list --verbose
```
- ディストリビューションの削除
```Powershell
wsl --unregister Ubuntu-24.04
```
- ディストリビューションの登録
```Powershell
wsl --import <ディストリビューション名> <インストール先フォルダ> <イメージファイルパス> [--version <1|2>] [--vhd]
```

#### 各項目の意味：

| 項目               | 説明                               |
| ---------------- | -------------------------------- |
| `<ディストリビューション名>` | WSL上で識別される名前（例：Ubuntu-24.04）     |
| `<インストール先フォルダ>`  | 仮想ディスクや設定ファイルが保存されるWindows上のフォルダ |
| `<イメージファイルパス>`   | `.tar` または `.vhdx` ファイルのパス       |
| `--version`      | WSLのバージョン（通常は `2` を指定）           |
| `--vhd`          | `.vhdx` ファイルを使う場合に必要なオプション       |

##### 🧪 使用例①：`.tar` ファイルからインポート
```powershell
wsl --import Ubuntu-Dev D:\WSL\UbuntuDev D:\WSL_Backups\ubuntu_dev.tar --version 2
```

##### 🧪 使用例②：`.vhdx` ファイルからインポート
```powershell
wsl --import Ubuntu-24.04 E:\wsl2\Ubuntu24.04 E:\wsl2\Ubuntu24.04\ext4.vhdx --version 2 --vhd
```

#### ⚠ よくあるエラーと対処法
- **ERROR_FILE_EXISTS**  
    → インストール先フォルダが空じゃないと出る。事前に削除するか、別フォルダを指定してね。
    
- **ディストリ名が重複**  
    → `wsl --list` で確認して、不要なら `wsl --unregister <名前>` で削除！    

### おまけ　その他のwslコマンド

#### 🟢 WSLの基本的な起動方法

##### ① PowerShellまたはコマンドプロンプトから起動
```powershell
wsl
```
→ 既定のディストリビューション（例：Ubuntu）が起動するよ。

##### ② 特定のディストリビューションを指定して起動
```powershell
wsl -d <ディストリビューション名>
```
例：
```powershell
wsl -d Ubuntu-24.04
```

#### 🧼 WSLの停止方法も覚えておこう！
##### 特定のディストリを停止： 
```powershell
wsl --terminate Ubuntu
```
 
##### WSL全体をシャットダウン：  
```powershell
    wsl --shutdown
        ```

## CUDA Toolkit、cuDNN、Pytorhcのインストール
ここはバージョンの縛りがあるので、まとめて考えたほうが良い。

1. Pytorhcのバージョンを確認する
   最初に自分が使用しているGPUに対応するPytorhcのバージョンを確認する。（分からなければ、Copilotに聞くと良い）
   CUDAはそれに合うバージョンの構成を導入する。
2. CUDAのバージョンマトリックス
   [サポートマトリックス — NVIDIA cuDNN バックエンド](https://docs.nvidia.com/deeplearning/cudnn/backend/latest/reference/support-matrix.html)

## Whisperを使ってみる
ここからは、動画に従ってvenvを構築、Whisperとfmmpegインストール、Pythonスクリプトを転記して実行するだけ。

### Pythonの仮想環境venv
- [初心者は何を使えばいい？【Pythonの仮想環境を比較】〜オススメを紹介 〜](https://www.youtube.com/watch?v=r4SkIhQThe0)

venvの仮想環境、myenvを起動するコマンド
```Powershell
source .myenv/bin/activate
```
venvの終了コマンド
```bash
deactivate
```

### 音声から文字起こしするAI　Whisper
- [【AIで音声をテキストに変換】Whisperの使い方を解説！〜 Pythonを使って無料でSpeech-to-Textを動かそう 〜](https://www.youtube.com/watch?v=oFvdAZxvuWk)

### 動画で登場するPythonスクリプト
```Python
import whisper
import torch

# print(torch.cuda.is_available())
device = "cuda" if torch.cuda.is_available() else "cpu"
model = whisper.load_model("base", device=device)  # GPUで処理する場合有効にする
# model = whisper.load_model("base", device="cpu")  # CPUで処理する場合有効にする
result = model.transcribe("https-movie-audio.wav")
print(result["text"])
```

## GPUを利用した実行時間の比較
サプーさんのこの手順を解説した動画（約17分）を文字起こししてみました。
結果は以下になります。

| 使用プロセッサ | real      | user      | sys       |
| ------- | --------- | --------- | --------- |
| CPU     | 3m14.807s | 18m0.569s | 0m13.085s |
| GPU     | 5m6.252s  | 4m45.590s | 0m21.559s |
*今のPCではCPUで処理したほうが早いという結論…*

## サプー動画のロードマップ
- [コンテンツロードマップ - Miro](https://miro.com/app/board/uXjVL97xWLw=/)

## Ubuntuのメモ
- [Ubuntu でよく使うコマンドまとめ｜npaka](https://note.com/npaka/n/n2542f00ec4ec)


