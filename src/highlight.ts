// highlight.ts
// ハイライト処理の本体。
// 「どの色でどの単語をハイライトしているか」を globalMap で管理する。
// QuickPick や右クリックメニューから呼ばれるのは基本ここ。

import * as vscode from 'vscode';
import { getFixedColorSets } from './settings';

// 色ごとのハイライト状態を保持する
// key: "background:foreground"
// value: { word, deco }
export const globalMap = new Map<string, { word: string, deco: vscode.TextEditorDecorationType }>();

// 固定7色の適用
export function applyFixedColor(index: number) {
  const fixed = getFixedColorSets();
  applyColor(fixed[index]);
}

// 色を適用するメイン関数
export function applyColor(color: { name: string; background: string; foreground: string }) {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }

  const word = getSelectedWord(editor);
  if (!word) {
    return;
  }

  const colorKey = `${color.background}:${color.foreground}`;

  // トグル（同じ色で同じ単語なら解除）
  if (globalMap.has(colorKey) && globalMap.get(colorKey)!.word === word) {
    removeColor(colorKey);
    return;
  }

  // ★ 同じ色が別の単語に使われていたら、そのハイライトを消す
  if (globalMap.has(colorKey)) {
    const old = globalMap.get(colorKey)!;
    for (const ed of vscode.window.visibleTextEditors) {
      ed.setDecorations(old.deco, []);
    }
    old.deco.dispose();
    globalMap.delete(colorKey);
  }

  // 新しいデコレーションを作成
  const deco = vscode.window.createTextEditorDecorationType({
    backgroundColor: color.background,
    color: color.foreground
  });

  globalMap.set(colorKey, { word, deco });

  applyToAllEditors(colorKey);
}


// 開いている全エディタに適用
export function applyToAllEditors(colorKey: string) {
  const state = globalMap.get(colorKey);
  if (!state) {
    return;
  }

  for (const editor of vscode.window.visibleTextEditors) {
    const ranges = findRanges(editor.document, state.word);
    editor.setDecorations(state.deco, ranges);
  }
}

// 色を解除
export function removeColor(colorKey: string) {
  const state = globalMap.get(colorKey);
  if (!state) {
    return;
  }

  for (const editor of vscode.window.visibleTextEditors) {
    editor.setDecorations(state.deco, []);
  }

  state.deco.dispose();
  globalMap.delete(colorKey);
}

// 全て解除
export function clearAllHighlights() {
  for (const [key, state] of globalMap) {
    for (const editor of vscode.window.visibleTextEditors) {
      editor.setDecorations(state.deco, []);
    }
    state.deco.dispose();
  }
  globalMap.clear();
}

// エディタ切り替え時に再適用
export function reapplyAll(editor: vscode.TextEditor) {
  for (const [key, state] of globalMap) {
    const ranges = findRanges(editor.document, state.word);
    editor.setDecorations(state.deco, ranges);
  }
}

// 選択中の単語を取得（選択していなければカーソル位置の単語）
export function getSelectedWord(editor: vscode.TextEditor): string | null {
  const sel = editor.selection;
  if (sel.isEmpty) {
    const range = editor.document.getWordRangeAtPosition(sel.active);
    return range ? editor.document.getText(range) : null;
  }
  return editor.document.getText(sel);
}

// 単語単位で検索（大文字小文字は区別）
export function findRanges(doc: vscode.TextDocument, word: string): vscode.Range[] {
  const ranges: vscode.Range[] = [];
  const text = doc.getText();

  // \bword\b で単語単位検索
  const regex = new RegExp(`\\b${escapeRegExp(word)}\\b`, 'g');

  let match;
  while ((match = regex.exec(text)) !== null) {
    const start = doc.positionAt(match.index);
    const end = doc.positionAt(match.index + word.length);
    ranges.push(new vscode.Range(start, end));
  }

  return ranges;
}

// 正規表現の特殊文字をエスケープ
function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
