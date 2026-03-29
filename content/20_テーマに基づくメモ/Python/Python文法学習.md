---
tags:
  - Python/文法
---

# 概要
雑誌**Interface 2021年6月号**を読みながら手を動かした記録です。
Pythonの文法概要くらいは把握できるかと思います。まだ作成中なので、継続して書いていきたいと思います。

# Interface 2021年06月号より

## 第1特集　打ちながら覚えるPython文法
#### [Python 公式チュートリアル](https://docs.python.org/ja/3.7/tutorial/index.html#tutorial-index)
#### [Python 言語リファレンス](https://docs.python.org/ja/3.7/reference/index.html)
#### [Python 標準ライブラリ](https://docs.python.org/ja/3.7/library/index.html#library-index)

### 変数
- 変数の練習に使ったソース
```python
# variable　変数
a=5
b="Hello World"
c={'A':1,'B':'apple'}
d=(3,2,1)
e=[1,2,3]

print(type(a))
print(a)

print(type(b))
print(b)

print(type(c))
print(c)

print(type(d))
print(d)
print(d[1])

print(type(e))
print(e)
print(e[0])

# tuple型　変更不可
# list型　変更可能
print(d)
print(type(d))
# tupleをlistに変換
f=list(d)
f.sort()
print(f)
print(type(f))

# print関数の書式
print("a","b","c","d","e","f",sep=",")
# 数値を文字に変換し、区切り文字を-にして、最後の文字を改行からタブに変換して表示
print('09','12', sep='-', end='\t')
# 文字列の連結
print("Hello"+"World")
# 複数の文字列を連結
print("a","b","c","d","e","f",sep="")
```

#### 分かったこと
Pythonの変数は代入じゃなくて関連付け（オブジェクトへの参照）、変数同士で代入や引数渡しする際には注意が必要。（ミュータブル、イミュータブル）

### import文




