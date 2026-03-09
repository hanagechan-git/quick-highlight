// extension.ts
// 拡張のエントリーポイント。
// ここでは VSCode に「この拡張はこういうコマンドを持っています」と登録するだけ。
// 実際の処理は highlight.ts / quickPick.ts に任せる。

import * as vscode from 'vscode';
import { applyFixedColor, clearAllHighlights, reapplyAll } from './highlight';
import { showColorQuickPick } from './quickPick';

export function activate(context: vscode.ExtensionContext) {
  // 固定7色のコマンドを登録
  // 例: highlightWord.applyFixed1 → 1番目の固定色を適用
  for (let i = 0; i < 7; i++) {
    context.subscriptions.push(
      vscode.commands.registerCommand(`highlightWord.applyFixed${i+1}`, () => {
        applyFixedColor(i);
      })
    );
  }

  // QuickPick を開くコマンド
  context.subscriptions.push(
    vscode.commands.registerCommand('highlightWord.pickColor', () => {
      showColorQuickPick();
    })
  );

  // 全て解除
  context.subscriptions.push(
    vscode.commands.registerCommand('highlightWord.clearAll', () => {
      clearAllHighlights();
    })
  );

  // エディタ切り替え時にハイライトを再適用
  vscode.window.onDidChangeActiveTextEditor(editor => {
    if (editor) {
      reapplyAll(editor);
    }
  });
}

export function deactivate() {
  clearAllHighlights();
}
