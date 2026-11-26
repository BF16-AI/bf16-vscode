import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  const item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 50);
  item.text = '$(zap) bf16.ai';
  item.tooltip = 'Click to view live bf16.ai 1M-context uncensored model catalog';
  item.command = 'bf16.listModels';
  item.show();
  context.subscriptions.push(item);

  context.subscriptions.push(
    vscode.commands.registerCommand('bf16.listModels', async () => {
      try {
        const res = await fetch('https://api.bf16.ai/v1/models');
        const json = (await res.json()) as { data?: Array<{ id: string; bf16?: { pricing_usd_per_1m?: { input?: number; output?: number } } }> };
        const picks = (json.data ?? []).map((m) => ({
          label: m.id,
          description: m.bf16?.pricing_usd_per_1m ? `$${m.bf16.pricing_usd_per_1m.input}/1M in · $${m.bf16.pricing_usd_per_1m.output}/1M out` : 'Smart Router',
        }));
        const chosen = await vscode.window.showQuickPick(picks, { placeHolder: 'Select model ID to copy' });
        if (chosen) {
          await vscode.env.clipboard.writeText(chosen.label);
          vscode.window.showInformationMessage(`Copied model ID: ${chosen.label}`);
        }
      } catch (err) {
        vscode.window.showErrorMessage(`Failed to fetch bf16.ai models: ${String(err)}`);
      }
    }),
    vscode.commands.registerCommand('bf16.copyConfig', async () => {
      await vscode.env.clipboard.writeText('npx bf16ai');
      vscode.window.showInformationMessage('Copied `npx bf16ai` to clipboard. Base URL: https://api.bf16.ai/v1');
    }),
    vscode.commands.registerCommand('bf16.openTools', async () => {
      await vscode.env.openExternal(vscode.Uri.parse('https://bf16.ai/tools/cost-calculator'));
    })
  );
}

export function deactivate() {}
