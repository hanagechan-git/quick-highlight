// settings.ts
// settings.json の内容を読み込む。
// 固定7色は「{} ひとつで上書き」できるようにする。

import * as vscode from 'vscode';

// 固定7色のデフォルト
const defaultFixed = [
  { "name": "Caution",  "background": "#ff5555", "foreground": "#ffffff" },
  { "name": "Deep",     "background": "#4455aa", "foreground": "#ffffff" },
  { "name": "Emphasis", "background": "#ff8800", "foreground": "#ffffff" },
  { "name": "Info",     "background": "#5599ff", "foreground": "#ffffff" },
  { "name": "Marker",   "background": "#ffee55", "foreground": "#000000" },
  { "name": "OK",       "background": "#55cc55", "foreground": "#000000" },
  { "name": "Review",   "background": "#aa55cc", "foreground": "#ffffff" }
];

// 固定7色の設定を読み込む
export function getFixedColorSets() {
  const config = vscode.workspace.getConfiguration('highlightWord');
  const user = config.get<any[]>('fixedColorSets') || [];

  // 上から順にデフォルトへ上書き
  return defaultFixed.map((d, i) => user[i] ? { ...d, ...user[i] } : d);
}

// ユーザー定義色
export function getUserColorSets() {
  const config = vscode.workspace.getConfiguration('highlightWord');
  return config.get<any[]>('colorSets') || [];
}
