---
tags:
  - AI/生成AI
---

## 書籍情報
著：石田 基広、鳥井 浩平
発行：株式会社　C&R研究所

### 概要
この書籍は、ChatGPT（有料版）とAzureAI（法人契約のみ）を使ってRAGを構築する方法を紹介している書籍。FunctionCallingという技術にも軽く触れているが、AIでサボろうの動画でも同じようなことは出来るので、やり方だけ掴んで終えたい。（多分エージェントのことだと思う）
後半は画像認識の技術なので学習したい。

### サポートサイト
- [手を動かして学ぶ 生成AI 使い方入門 サポートサイト](https://genai-book.github.io/materials/)


## 第1章　AIとは
### Hugging Face
- [Hugging Face – The AI community building the future.](https://huggingface.co/)
- [What is Text Generation? - Hugging Face](https://huggingface.co/tasks/text-generation)

### ChatGPT
- [ChatGPT](https://chatgpt.com/)
ChatGPTはカスタマイズ可能。
以下の画面は機能をON/OFFするための設定画面。
![[Pasted image 20251016201416.png]]
次の画面は、出力される文章に影響を与える設定。
テキストで記述する。
![[Pasted image 20251016202125.png]]

## 第2章　クラウドサービスの利用
### OpenAI API
  以下はAPIの開発環境
- [Overview - OpenAI API](https://platform.openai.com/docs/overview)

### KERAS API
TensolFlow上で使えるAPIKERASを使います。
- [Keras 3 API documentation](https://keras.io/api/)
- [Keras  |  TensorFlow Core](https://www.tensorflow.org/guide/keras?hl=ja)

### mat plot lib
グラフの表示にはmat plot lib を使用します。
- [API リファレンス_Matplotlib - Pythonの可視化](https://jp.matplotlib.net/stable/api/index.html)

### Google Colaboratory
Pythonのライブラリを使用して、機械学習の概要を学びます。
- [第２章クラウドサービスの利用.ipynb のコピー - Colab](https://colab.research.google.com/drive/1lHIi9__qMHrerfikkqzYytJ7dDbN_6It)

---
##### まずkerasとこれから使用するライブラリをimportして、X_train, y_train, X_test, y_test に、MNISTデータセットを読み込みます。
``` python
import keras
from keras.datasets import mnist
from keras.models import Sequential
from keras.layers import Dense, Dropout, InputLayer
from keras.optimizers import RMSprop
# MNISTデータを読込む
(X_train, y_train), (X_test, y_test) = mnist.load_data()
```

##### .shape を付けて、変数の配列要素数を表示します。
``` python
print(f"X_train(学習用の画像データのサイズ) : {X_train.shape}")
print(f"y_train(学習データの正解ラベルのサイズ) : {y_train.shape}")
print(f"X_test(検証用の画像データのサイズ) : {X_test.shape}")
print(f"y_test(検証データの正解ラベルのサイズ) : {y_test.shape}")
```
- 28✕28ピクセルの画像6万点（学習用）と1万点（検証用）、それの正解ラベルが格納されている。
X_train(学習用の画像データのサイズ) : (60000, 28, 28) 
y_train(学習データの正解ラベルのサイズ) : (60000,) 
X_test(検証用の画像データのサイズ) : (10000, 28, 28) 
y_test(検証データの正解ラベルのサイズ) : (10000,) 

##### AIのインプット用に28✕28ピクセルの画像を横一列の配列に並べて、変数の構造を表示する。
``` python
X_train  = X_train.reshape(60000, 784)
X_test   = X_test.reshape(10000, 784)
print("X_train.shape(学習用の画像データ) : ", X_train.shape)
print("y_train_shape(学習用の正解データ) : ", y_train.shape)
print("X_test.shape(検証用の画像データ) : ", X_test.shape)
print("y_test.shape(検証用の正解データ) : ", y_test.shape)
```
X_train.shape(学習用の画像データ) :  (60000, 784)
y_train_shape(学習用の正解データ) :  (60000,)
X_test.shape(検証用の画像データ) :  (10000, 784)
y_test.shape(検証用の正解データ) :  (10000,)

##### グレースケールのデータを2値（１と０）に変換する。
``` python
# 最初にデータを小数点を含む値(float) 型に変換
X_train = X_train.astype('float32')
X_test  = X_test.astype('float32')

# 0-255 のデータを 0-1 の範囲に変換
X_train /= 255
```

##### 正解ラベルもonehotエンコーディングして、変換します。
``` python
y_train = keras.utils.to_categorical(y_train, 10)
y_test  = keras.utils.to_categorical(y_test, 10)
```

##### AIに学習用データをインプットして、正解ラベルと照合します。
``` python
model = Sequential()
model.add(InputLayer(input_shape=(784,)))    # 784個が1セットのデータを入力する事を伝える
model.add(Dense(10, activation='softmax'))    # 正解ラベルが10種類ある事を伝える
model.compile(loss='categorical_crossentropy', optimizer='rmsprop', metrics=['accuracy'])
# 学習方法を伝える
```

##### 機械学習を実行する。
``` python
history = model.fit(X_train, y_train, batch_size=128, epochs=20, verbose=1, validation_data=(X_test, y_test))
```
X_train, y_train　　学習用データの指定
###### ハイパーパラメーター
batch_size　　　　1回に学習させる数
epochs　　　　　　batchを繰り返す回数

##### 学習の成績をmatplotlibでグラフ化して表示。
``` python
loss     = history.history['loss']
val_loss = history.history['val_loss']

nb_epoch = len(loss)
plt.plot(range(nb_epoch), loss,     marker='.', label='loss')
plt.plot(range(nb_epoch), val_loss, marker='.', label='val_loss')
plt.legend(loc='best', fontsize=10)
plt.grid()
plt.xlabel('epoch')
plt.ylabel('loss')
plt.show()
```
![[Pasted image 20251016215131.png]]

---
## 第3章　AIをカスタマイズする
### Google Colaboratory
Pythonの概要とAPIについて学び、実際にAPIを利用してみる。
- [第３章AIをカスタマイズする.ipynb のコピー - Colab](https://colab.research.google.com/drive/1-ePdmbyWVOtvZWQQy6Hv-ZJzHTC6wMZc)

#### SECTION-012　プログラミ第ング言語とは

#### SECTION-013　APIとは
##### 郵便番号から住所を調べるAPI

ここのAPIを使ってみる。
- [郵便番号データのダウンロード - zipcloud](https://zipcloud.ibsnet.co.jp/)

郵便番号7830060の住所情報をダウンロードする。
```Python
import requests
import json
url = 'https://zipcloud.ibsnet.co.jp/api/search?zipcode=7830060'
data = requests.get(url)
json_data = json.loads(data.text)
```
データはjson形式で送られてくる。
```Json
{'message': None,
 'results': [{'address1': '高知県',
   'address2': '南国市',
   'address3': '蛍が丘',
   'kana1': 'ｺｳﾁｹﾝ',
   'kana2': 'ﾅﾝｺｸｼ',
   'kana3': 'ﾎﾀﾙｶﾞｵｶ',
   'prefcode': '39',
   'zipcode': '7830060'}],
 'status': 200}
```

#### SECTION-014　OpenAI API
⚠️*ここからは有料のChatGPTが必要*⚠️
curlでAPIを呼び出す例
```Shell
curl https://api.openai.com/v1/completions \
-H "Content-Type: application/json" \
-H "Authorization: Bearer 個人ごとに割り振られたAPIキー" \
-d '{"model": "OpenAI社で使えるAIモデル名", "prompt": "質問"}'
```

- OpenAI社のPythonライブラリ
- [GitHub - openai/openai-python: The official Python library for the OpenAI API](https://github.com/openai/openai-python)

##### APIキーを入手する

1. 以下の場所でAPIを選択
	- [OpenAI Platform](https://platform.openai.com/apps)
2. 課金してログインしていると表示される右上のDashboardをクリック
3. 左メニューのAPI Keysをクリック
4. Create new secret keyというボタンをクリック
5. Nameにキー名（何でも良い）を入力
6. Create new secret keyボタンをクリックするとAPI Keyが生成される

##### APIでのトークンの消費

APIを利用する場合、月額料金ではなく従量課金となります。
課金単位はトークン数に対していくらという計算をします。
以下にトークン数をカウントするサイトと、料金表を記載します。

- トークン数をカウントするサイト
- [Tokenizer - OpenAI API](https://platform.openai.com/tokenizer)

- OpenAi API 利用料金
- [料金 | OpenAI](https://openai.com/ja-JP/api/pricing/)

##### Open AIで出来ること
- ChatBotのカスタマイズ
- 独自データの追加（RAG）　※512MB✕20ファイル
- Web検索　OpenAI APIではBing検索を利用できる
- CodeInterpreter
- ファインチューニング

#### SECTION-015　Microsoft Azure APIについて

AzureOpenAIはOpenAi社のGPTをAzure上に構築して利用できる。
環境を独自に構成できることがメリットだけど、個人での利用は出来ない。
企業用のアカウントが必要になる。

#### SECTION-016　Hugging FaceとAPI

HuggingFaceはオープンソースのAIを開発、共有する為のプラットフォームを提供している。特にTransformerベースのAIを中心に扱う。
HuggingFaceHubでは、研究者や開発者が作成したモデルを公開し、誰でも利用することが出来るようになっている。

使い方はmanual参照

- Hugging Face manual
- [Inference Endpoints](https://huggingface.co/docs/inference-endpoints/index)

---
## 第４章　言語生成AI応用例

### Google Colaboratory
- [第４章言語生成AI応用例.ipynb のコピー - Colab](https://colab.research.google.com/drive/1kGOMPqGv3cNCvstOt4PZhuPRhmC21tEy#scrollTo=U0nZeQGi-GR7)
#### SECTION-017　OpenAI Assistant API
最初にコンテキストの説明があり、OpenAI APIでAIと会話するときは過去の会話履歴（コンテキスト）を一緒に送ると書かれている。
コンテキストの分のトークンも消費されるので注意を促している。

Assistant APIは、OpenAPIよりも使いやすくしたOpenAI社のAPIで、2023年11月6日の「OpenAI Dev Day 2023」で発表されました。
#### SECTION-018　Assistant APIの利用手順
いよいよAssistant APIを利用します。
##### Assistant APIの利用手順
1. Assistantの作成
2. Threadの作成（Messageを蓄積する場所、コンテキスト）
3. ThreadへのMessageの追加
4. Assistantの実行
5. Run Statusの確認（completedになるまでループ）
6. Responseの取得
7. （使い終わったら）ThreadとAssistantの削除
##### APIキーをGoogle Colaboのシークレットに格納する方法
1. Google Colaboratoryの左メニューにある、鍵のアイコンをクリック
2. 「＋新しいシークレットを追加」をクリック
3. Key & Valueの形式で、名前とAPI Keyを登録
4. Pythonから読み込み（下記コード例を参照）

```Python
from openai import OpenAI
from google.colab import userdata
client = OpenAI(api_key=userdata.get('OpenAI_API_Key')
```
##### 関連情報
- Assistant API tools
- [Assistants API tools - OpenAI API](https://platform.openai.com/docs/assistants/tools/)
- ⭐️Assistant API は2025年10月時点では既に非推奨となっており、「Responses API」への以降が推奨されている。
- [Migrate to the Responses API - OpenAI API](https://platform.openai.com/docs/guides/migrate-to-responses)

- Open AI 社価格プラン
- [ChatGPT 料金設定](https://chatgpt.com/ja-JP/pricing/#language-models)

#### SECTION-019　独自データの追加

- ファインチューニング
	- [モデルの最適化 - OpenAI API](https://platform.openai.com/docs/guides/model-optimization)
	- Microsoft Azure OpenAI Studioの「カスタムモデルの作成」
- RAG（Retrieval-Augmented-Generation）
	- ChatGPT Plus　※512MB✕20ファイル
		- ChatGPT Plus
		- OpenAI API
	- Microsoft Azure
##### 関連情報
- 4章サンプルのインプットに使用しているPDFの引用元
- [数理・データサイエンス・AI教育プログラム認定制度：文部科学省](https://www.mext.go.jp/a_menu/koutou/suuri_datascience_ai/00001.htm)
	- 下の方の資料のリンク集の中にある

- OpenAI RAG費用
- [アシスタント API (v2) に関するよくある質問 |OpenAIヘルプセンター](https://help.openai.com/en/articles/8550641-assistants-api-v2-faq#h_061c53c67a)

#### SECTION-022　音声起こし
Whisperとffmpegを利用した音声の文字起こしサンプル。
サプーさんのサイトで同じ事をやっているので、そちらを参照する。
- [[自宅ノートPCのGPU性能を試してみる]]

#### SECTION-023　Function Calling
AIが外部のAPIを利用して回答する機能。
siriやアレクサに時刻や今日の予定を聞くのと似ている。LLMがそういった作業を行うための関数やAPI呼び出しのインターフェースを定義して利用する仕組み。

##### AIエージェントとの違い
いい質問だね！🦊✨  
**Function Calling**と**AIエージェント**はどちらも大規模言語モデル（LLM）を活用する技術だけど、目的や役割がちょっと違うんだ。

### 🧩 Function Callingとは？
Function Callingは、**LLMが外部の関数やAPIを呼び出すための仕組み**。  
ユーザーの自然言語入力を解析して、必要な処理を関数として実行するよ。
#### 例：
> 「東京の天気は？」→ `get_weather(location="Tokyo")`

- **主な目的**：処理の実行（データ取得、通知送信など）
- **使い方**：関数を定義して、LLMが必要に応じて呼び出す
- **特徴**：構造化された出力、外部システムとの連携が可能

### 🤖 AIエージェントとは？
AIエージェントは、Function Callingのような機能を**複数組み合わせて自律的にタスクをこなす存在**。  
まるで「自分で考えて、必要なツールを選び、順番に使って目的を達成する」ような動きができるんだ。
#### 例：
> 「来週の東京出張に向けて、天気を調べて、持ち物リストを作って、カレンダーに予定を入れて」

- **主な目的**：複雑なタスクの自律的な実行
- **使い方**：複数のツール（Function Calling、RAG、コード実行など）を統合
- **特徴**：思考プロセスを持ち、複数ステップの処理をこなす

---
### 🦊 ざっくりまとめると…

| 項目  | Function Calling | AIエージェント           |
| --- | ---------------- | ------------------ |
| 役割  | 単一の処理を実行         | 複数の処理を統合して自律的に実行   |
| 思考  | なし（判断は1回）        | あり（複数ステップで判断）      |
| 例   | API呼び出し          | 旅行計画、業務自動化、FAQ対応など |
| 拡張性 | 関数単位             | ツール・メモリ・推論を組み合わせる  |

Function Callingは「道具を使う手」、AIエージェントは「道具を選んで使いこなす頭脳」って感じかな！  
もし自分でエージェントを作ってみたいなら、Function Callingはその第一歩になるよ🌿

---
## 第5章　クラウド環境による簡易的な画像認識

### Google Colaboratory
- [第５章クラウド環境による簡易的な画像認識.ipynb のコピー - Colab](https://colab.research.google.com/drive/1i4yqqOOGnCp2PrvXFIMH8dRfxjeVSHQN#scrollTo=tV2EmrEuJtkk)

#### SECTION-024　画像の物体判定
ここでは、YOLO(You Only Look Once)を使用した画像内の物体検出を行います。
YOLOは名前の通り、１回のスキャンで複数の物体の位置と名前を検出するAIツールで、高速な処理が売りです。
リアルタイムで処理出来るため、動画からの検出や無人運転車に採用されています。

このセクションのポイントは、YOLOの解析結果「res」オブジェクトの理解にあります。
model.predictの結果を代入したresには、検出した物体のリスト「cls」（クラス）や、検出結果の正確さ「conf」などの情報が格納されています。

##### YOLOv8
Ultralytics社によって開発されたPythonライブラリ。
###### YOLOの処理フロー
1. 画像の準備：入力された画像を一定サイズにリサイズし、処理を用意にする。
2. 特徴抽出：ディープラーニングを用いて、画像から物体の特徴を抽出する。
3. 物体の検出：抽出した特徴をもとに、画像内の物体の種類とその位置を特定する。画像をグリッドに分割し、グリッドセルごとに物体の存在確率、クラス、位置（バウンディングボックス）を推定する。
###### YOLOv8が持つAIタスク

| タスク                            | 説明                                  |
| ------------------------------ | ----------------------------------- |
| 物体の検出（Detect）                  | 画像やビデオ内で物体の存在を検出する                  |
| 物体のセグメンテーション<br>（Segmentation） | 画像やビデオ内の各ピクセルを物体クラスに割り当てる           |
| 物体の分類<br>（Classification）      | 画像やビデオ内の物体を事前に定義されたカテゴリに<br>分ける     |
| 姿勢推定（Pose）                     | 画像やビデオ内の物体の位置、角度、方向などの<br>姿勢情報を推定する |

#### SECTION-025　動画に映っている物体の判定

- 素材サイト　Pexels
- [フリー画像, 無料画像, 著作権フリー画像, フリー素材 写真](https://www.pexels.com/ja-jp/)
- ドイツ在住のブルーノ・ヨーゼフ氏とインゴ・ヨーゼフ氏が設立した素材サイト。Pexelsに掲載されている全ての動画・画像は無料で使用できる上、クレジット表記も不要（利用する時にも確認する）

フリー素材の動画を使用してフレーム毎に物体判定を行います。
※このセッションのソースにはバグがあります。適宜修正して実行すること。

##### 検出結果を文字で表示するサンプル
動画をダウンロードするために、CV2ライブラリを使用します。
CV2はOpenCVをPythonで使用する為のライブラリです。
```Python
# 動画のダウンロード
import cv2
cap = cv2.VideoCapture("/content/pexels.mp4")

if not cap.isOpened():
    print("Error: Could not open video file.")
```

結果ウインドウにフレーム毎に検出した物体を出力するサンプル。
「while cap.isOpened():」の部分で動画ファイルがオープンしている間ループさせています。
「 ret, img = cap.read()」でフレームを切り出して、次のif文内で物体検出を行います。
capのフレームを全て切り出し終わると動画が閉じられて、whileのループから抜けます。
```Python
# ここから動画をフレーム単位で切り出し、その都度、
# モデルを適用して物体判定
num = 0
while cap.isOpened():
  # フレームごとに読み込む
  ret, img = cap.read()
  # フレームが残っている間、その物体判定を行う
  if ret:
    results = model(img, conf=0.5, verbose=False)
    # 映っている物体を確認
    categories = results[0].boxes.cls
    # 各要素の出現回数をカウント
    from collections import Counter
    counts = Counter(results[0].boxes.cls.tolist())
    for number, count in counts.items():
      print(f"{num}フレームには{cls[int(number)]} が{count} 個映っています")
    num = num + 1
    if num > frames:
      ret = None
  else :
    break

cap.release()
```

Boxを書き込んだ動画を保存するサンプル。
```Python
# 自分が Google Colab にアップロードした動画を指定します
cap = cv2.VideoCapture("/content/pexels.mp4")

width = cap.get(cv2.CAP_PROP_FRAME_WIDTH)
height = cap.get(cv2.CAP_PROP_FRAME_HEIGHT)
frames = cap.get(cv2.CAP_PROP_FRAME_COUNT)
fps = cap.get(cv2.CAP_PROP_FPS)

# count = cap.get(cv2.CAP_PROP_FRAME_COUNT)
print("動画の総フレーム数", frames)

# 出力用に空の動画を作成しておく
writer = cv2.VideoWriter('./result.mp4',
                          cv2.VideoWriter_fourcc(*'MP4V',),fps,
                          frameSize=(int(width),int(height)))
num = 0
cls = model.names

# ここから動画をフレーム単位で切り出し、その都度、
# モデルを適用して物体判定
while cap.isOpened():
  # フレームごとに読み込む
  ret, img = cap.read()
  # フレームが残っている間、その物体判定を行う
  if ret:
    results = model(img, conf=0.5, verbose=False)
    # 特定の物体だけを判別したい場合 classesで、物体の番号を指定
    # 番号は上記を確認
    # results = model(img, conf=0.5, verbose=False, classes=[0,1,2])
    img = results[0].plot(labels=True, conf=True)
    writer.write(img)
    if num > frames:
      ret = None
  else :
    # 動画を保存する
    writer.release()
    break

cap.release()
```

#### SECTION-026　MediaPipeによるポーズ推定
GoogleのMediaPipeを使用すると、人間の姿勢やポーズを推定できます。

- MediaPipeの公式サイト
- [MediaPipe Studio](https://mediapipe-studio.webapps.google.com/home)
- MediaPipeのドキュメント
- [mediapipe/docs/solutions at master · google-ai-edge/mediapipe · GitHub](https://github.com/google-ai-edge/mediapipe/tree/master/docs/solutions)
##### MediaPipeの実験
MediaPipeとCV2ライブラリの読み込み
```Python
%%capture
!pip install mediapipe
import cv2
import mediapipe as mp
from google.colab.patches import cv2_imshow

```
画像のダウンロード
```Python
# !wget https://infoart.ait231.tokushima-u.ac.jp/images/golf.png
!wget https://rmecab.jp/images/golf.png
```
ダウンロードした画像の表示
```Python
image = cv2.imread("/content/golf.png")
cv2_imshow(image)
```

この画像を使用してポーズ推定する。
```Python
# ポーズ推定の設定
mp_pose = mp.solutions.pose
pose = mp_pose.Pose(
    # 検出精度
    min_detection_confidence=0.5,
    # 静止画像であることを指定
    static_image_mode=True)
# 推定結果を画像に上書きするための準備
mp_drawing = mp.solutions.drawing_utils
# 元画像のコピーを用意
posed_img = image.copy()
 
# 読み込んだ画像から骨格を推定する
results = pose.process(image)

# 元画像のコピーに、ポーズ推定の結果を書き込む
mp_drawing.draw_landmarks(posed_img, results.pose_landmarks,
                              mp_pose.POSE_CONNECTIONS)
```

- MediaPipeソリューションガイド
- [MediaPipe ソリューション ガイド  |  Google AI Edge  |  Google AI for Developers](https://ai.google.dev/edge/mediapipe/solutions/guide?hl=ja)
作られたポーズ推定を表示
```Python
cv2_imshow(posed_img)
```

画像読み込み命令「cv2.imread」は、BGRの順で画素が書かれている前提で読み込むので、読み込んだ画像をRGBに変換する処理を挟む。
```Python
# ポーズ推定の設定
mp_pose = mp.solutions.pose
pose = mp_pose.Pose(
    # 検出精度
    min_detection_confidence=0.5,
    static_image_mode=True)
mp_drawing = mp.solutions.drawing_utils

# ここでRGB形式に変換したイメージを用意
rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
# 元画像から骨格を推定する
results = pose.process(image)
# ランドマークを書き込む
mp_drawing.draw_landmarks(posed_img, results.pose_landmarks,
                          mp_pose.POSE_CONNECTIONS)
```

ポーズ推定を書き込んだ画像を保存する。
```Python
# posed_img をファイルとして保存する方法
cv2.imwrite('posed_image_rgb.jpg', posed_img)
```

#### SECTION-027　顔の判定
顔画像から３種類の判定を行う。
1. 目や口、眉毛の位置を推定する方法
2. 顔全体をメッシュ（網の目）のように推定する方法
3. 瞳の位置を推定する方法

目や口、眉毛の位置を推定する
```Python
    connections = mp_face_mesh.FACEMESH_CONTOURS,
    connection_drawing_spec = drawing_styles.get_default_face_mesh_contours_style())
```

顔全体をメッシュで推定する
```Python
    connections = mp_face_mesh.FACEMESH_TESSELATION,
    connection_drawing_spec = drawing_styles.get_default_face_mesh_tesselation_style())
```

瞳の位置を推定する
```Python
    connections = mp_face_mesh.FACEMESH_IRISES,
    connection_drawing_spec = drawing_styles.get_default_face_mesh_iris_connections_style())
```

#### SECTION-028　Azureによる画像判別（異常検知）
Azure Custom Visionを利用して、画像から不良品を選別するシステムを構築する方法を解説している。

## 第6章　画像認識AIの基礎

#### SECTION-037　畳み込みニューラルネットワークの実装



