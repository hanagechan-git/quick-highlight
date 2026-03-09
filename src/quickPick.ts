// quickPick.ts
// QuickPick の UI を作る。
// 固定7色＋ユーザー色をまとめて表示し、
// 適用中の色には ● を付け、キーワードも表示する。

import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { globalMap, applyColor, clearAllHighlights } from './highlight';
import { getFixedColorSets, getUserColorSets } from './settings';

// 指定色の小さな四角アイコン（SVG）を一時ファイルとして作成し、その URI を返す
function createColorIcon(color: string): vscode.Uri {
  const safe = color.replace('#', '');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16">
    <rect width="16" height="16" fill="${color}" />
  </svg>`;

  const filePath = path.join(os.tmpdir(), `quick-highlight-${safe}.svg`);
  try {
    fs.writeFileSync(filePath, svg, 'utf8');
  } catch (e) {
    // 失敗したらアイコンなしで続行
  }
  return vscode.Uri.file(filePath);
}

export function showColorQuickPick() {
  const fixed = getFixedColorSets();
  const user = getUserColorSets();

  const items: vscode.QuickPickItem[] = [];

  // 最上段：全て解除
  items.push({ label: '● Clear All' });
  items.push({ label: '', kind: vscode.QuickPickItemKind.Separator });

  // 固定7色
  fixed.forEach(c => {
    const key = `${c.background}:${c.foreground}`;
    const active = globalMap.has(key);
    const state = globalMap.get(key);

    items.push({
      label: `${active ? '● ' : '  '}${c.name}`,
      description: state ? ` (Highlight: "${state.word}")` : '',
      iconPath: createColorIcon(c.background)
    });
  });

  items.push({ label: '', kind: vscode.QuickPickItemKind.Separator });

  // ユーザー色
  user.forEach(c => {
    const key = `${c.background}:${c.foreground}`;
    const active = globalMap.has(key);
    const state = globalMap.get(key);

    items.push({
      label: `${active ? '● ' : '  '}${c.name}`,
      description: state ? ` (Highlight: "${state.word}")` : '',
      iconPath: createColorIcon(c.background)
    });
  });

  vscode.window.showQuickPick(items).then(selected => {
    if (!selected) {
      return;
    }

    // 全て解除
    if (selected.label.includes('Clear All')) {
      clearAllHighlights();
      return;
    }

    // 選択された色を特定（ラベル末尾の name でマッチ）
    const allColors = [...fixed, ...user];
    const match = allColors.find(c => selected.label.trim().endsWith(c.name));

    if (match) {
      applyColor(match);
    }
  });
}
