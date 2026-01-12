/**
 * シンプルなブラウザ用 TODO アプリのメインスクリプト。
 *
 * 機能概要:
 * - LocalStorage にタスクと表示設定を保存・読み込み
 * - タスクの追加/編集/削除、完了状態の切り替え
 * - 期日、優先度、タグの付与
 * - 検索とフィルタ（すべて/未完了/完了）
 * - JSON によるエクスポート/インポート
 * - アクセシビリティ: ライブリージョンで操作結果を通知
 */
// Storage keys
const STORAGE_KEY = 'todo.items.v1';
const PREF_KEY = 'todo.prefs.v1';

/**
 * Todo アイテムの構造定義。
 * - id: 一意の識別子（`crypto.randomUUID()` で生成）
 * - title: 表示用タイトル
 * - completed: 完了フラグ
 * - createdAt / updatedAt: 生成・最終更新のタイムスタンプ（ms）
 * - due: 任意の期日（ISO 文字列など）
 * - priority: 優先度（none | low | medium | high）
 * - tags: タグ文字列（`#tag1, #tag2` 入力を正規化して保持）
 */
/** @typedef {{ id:string, title:string, completed:boolean, createdAt:number, updatedAt:number, due?:string, priority?:'low'|'medium'|'high'|'none', tags?:string[] }} TodoItem */

/** @type {TodoItem[]} */
// タスク配列（最新が先頭になるよう unshift で追加）
let items = [];
// 表示フィルタ: 'all' | 'active' | 'completed'
let filter = 'all';
// 検索クエリ（タイトル・タグに対する部分一致）
let searchQuery = '';

// 主要な DOM 参照をまとめて保持
const els = {
  list: document.getElementById('todoList'),
  template: document.getElementById('todoItemTemplate'),
  count: document.getElementById('countLabel'),
  form: document.getElementById('todoForm'),
  input: document.getElementById('todoInput'),
  due: document.getElementById('dueInput'),
  priority: document.getElementById('priorityInput'),
  tags: document.getElementById('tagsInput'),
  search: document.getElementById('searchInput'),
  filterChips: Array.from(document.querySelectorAll('.chip[data-filter]')),
  clearCompleted: document.getElementById('clearCompletedBtn'),
  exportBtn: document.getElementById('exportBtn'),
  importBtn: document.getElementById('importBtn'),
  importFile: document.getElementById('importFile'),
  live: document.getElementById('a11yLive'),
  assert: document.getElementById('a11yAssert'),
};

init();

/**
 * アプリの初期化処理:
 * - LocalStorage からタスクとフィルタ設定を読み込み
 * - イベントバインド、初回レンダー
 */
function init() {
  // Load state: タスク一覧を復元
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    items = raw ? JSON.parse(raw) : [];
  } catch {}

  // 表示設定（フィルタ）を復元
  try {
    const pref = JSON.parse(localStorage.getItem(PREF_KEY) || '{}');
    if (pref.filter) filter = pref.filter;
  } catch {}

  bindEvents();
  applyFilterUI();
  render();
}

/**
 * UI への各種イベントをバインド:
 * - 追加フォーム、検索、フィルタチップ、完了タスク一括削除
 * - エクスポート/インポート
 */
function bindEvents() {
  els.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = els.input.value.trim();
    if (!title) return;

    // 入力値から新規タスクを生成
    const newItem = /** @type {TodoItem} */ ({
      id: crypto.randomUUID(),
      title,
      completed: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      due: els.due.value || undefined,
      priority: (els.priority.value || 'none'),
      tags: parseTags(els.tags.value),
    });
    // 先頭に追加して保存・再描画
    items.unshift(newItem);
    save();
    render();
    announce('タスクを追加: ' + title);
    els.form.reset();
    els.input.focus();
  });

  // 入力のたびに検索クエリを更新して再描画
  els.search.addEventListener('input', () => {
    searchQuery = els.search.value.trim();
    render();
  });

  // フィルタチップのクリックで表示モードを切り替え
  els.filterChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      filter = chip.dataset.filter || 'all';
      localStorage.setItem(PREF_KEY, JSON.stringify({ filter }));
      applyFilterUI();
      render();
    });
  });

  // 完了タスクを一括削除
  els.clearCompleted.addEventListener('click', () => {
    const before = items.length;
    items = items.filter((i) => !i.completed);
    save();
    render();
    const removed = before - items.length;
    if (removed > 0) announce(`${removed} 件の完了タスクを削除しました`);
  });

  // JSON エクスポート（ダウンロード）
  els.exportBtn.addEventListener('click', () => {
    const payload = JSON.stringify({ items }, null, 2);
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `todos-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });

  // JSON インポート（ファイルピッカー経由）
  els.importBtn.addEventListener('click', () => els.importFile.click());
  els.importFile.addEventListener('change', async () => {
    const file = els.importFile.files?.[0];
    if (!file) return;
    const text = await file.text();
    try {
      const data = JSON.parse(text);
      // 配列 or { items: 配列 } を許容
      if (Array.isArray(data)) {
        items = data;
      } else if (Array.isArray(data.items)) {
        items = data.items;
      } else {
        throw new Error('Invalid format');
      }
      save();
      render();
      announce('インポート完了');
    } catch (err) {
      alert('JSON の形式が正しくありません');
    } finally {
      els.importFile.value = '';
    }
  });
}

/**
 * 文字列のカンマ区切り入力をタグ配列に変換。
 * `#` で始まる場合は除去して正規化。
 */
function parseTags(input) {
  return input
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)
    .map((t) => (t.startsWith('#') ? t.slice(1) : t));
}

/**
 * 現在の items を LocalStorage に保存。
 */
function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

/**
 * フィルタチップの UI 状態（選択状態/ARIA 属性）を更新。
 */
function applyFilterUI() {
  els.filterChips.forEach((c) => {
    if ((c.dataset.filter || 'all') === filter) {
      c.classList.add('is-active');
      c.setAttribute('aria-selected', 'true');
    } else {
      c.classList.remove('is-active');
      c.setAttribute('aria-selected', 'false');
    }
  });
}

/**
 * 画面全体を再描画。
 * - フィルタと検索クエリを適用した配列を基にリストを構築
 * - 件数ラベルを更新
 */
function render() {
  const filtered = items.filter((i) => {
    // 表示モードによる絞り込み
    if (filter === 'active' && i.completed) return false;
    if (filter === 'completed' && !i.completed) return false;
    // 検索（タイトル or タグの部分一致）
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const inTitle = i.title.toLowerCase().includes(q);
      const inTags = (i.tags || []).some((t) => t.toLowerCase().includes(q));
      if (!inTitle && !inTags) return false;
    }
    return true;
  });

  els.list.innerHTML = '';
  for (const item of filtered) {
    const node = renderItem(item);
    els.list.appendChild(node);
  }

  els.count.textContent = `${filtered.length} 件 / 合計 ${items.length}`;
}

/**
 * 単一の Todo アイテムから DOM ノードを生成してイベントを付与。
 * @param {TodoItem} item
 * @returns {HTMLLIElement}
 */
function renderItem(item) {
  const node = /** @type {HTMLLIElement} */ (els.template.content.firstElementChild.cloneNode(true));
  const checkbox = node.querySelector('.todo__checkbox');
  const title = node.querySelector('.todo__title');
  const due = node.querySelector('.todo__due');
  const priority = node.querySelector('.todo__priority');
  const tags = node.querySelector('.todo__tags');

  // 表示値の反映
  node.dataset.id = item.id;
  title.textContent = item.title;
  checkbox.checked = item.completed;
  node.classList.toggle('is-completed', item.completed);

  // 期日・優先度・タグの表示（存在時のみ）
  if (item.due) {
    due.hidden = false;
    due.textContent = `期日: ${item.due}`;
  }
  if (item.priority && item.priority !== 'none') {
    priority.hidden = false;
    priority.dataset.priority = item.priority;
    priority.textContent = `優先度: ${labelForPriority(item.priority)}`;
  }
  if (item.tags && item.tags.length) {
    tags.hidden = false;
    tags.textContent = '#' + item.tags.join(' #');
  }

  // 完了チェックボックスの変更
  checkbox.addEventListener('change', () => {
    item.completed = checkbox.checked;
    item.updatedAt = Date.now();
    save();
    render();
  });

  // 削除ボタン
  node.querySelector('[data-action="delete"]').addEventListener('click', () => {
    items = items.filter((x) => x.id !== item.id);
    save();
    render();
    announce('削除: ' + item.title);
  });

  // 編集ボタン（タイトルを選択状態にして編集しやすくする）
  node.querySelector('[data-action="edit"]').addEventListener('click', () => {
    title.focus();
    selectAllText(title);
  });

  // タイトル編集中のキーハンドリング
  title.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      title.blur();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      title.textContent = item.title;
      title.blur();
    }
  });
  // フォーカスアウト時に差分があれば保存
  title.addEventListener('blur', () => {
    const newTitle = title.textContent.trim();
    if (!newTitle) {
      title.textContent = item.title;
      return;
    }
    if (newTitle !== item.title) {
      item.title = newTitle;
      item.updatedAt = Date.now();
      save();
      announce('更新: ' + newTitle);
    }
  });

  return node;
}

/**
 * 要素内のテキスト全体を選択状態にする（編集用の利便性向上）。
 * @param {HTMLElement} el
 */
function selectAllText(el) {
  const range = document.createRange();
  range.selectNodeContents(el);
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);
}

/**
 * 優先度のラベルを返す（表示用）。
 * @param {'high'|'medium'|'low'|'none'} p
 */
function labelForPriority(p) {
  if (p === 'high') return '高';
  if (p === 'medium') return '中';
  if (p === 'low') return '低';
  return '';
}

/**
 * ライブリージョンにメッセージを流し、スクリーンリーダーへ通知。
 * @param {string} msg
 */
function announce(msg) {
  if (els.live) {
    els.live.textContent = '';
    setTimeout(() => (els.live.textContent = msg), 0);
  }
}


