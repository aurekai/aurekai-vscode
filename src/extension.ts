import * as vscode from 'vscode';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

// ── Status bar ───────────────────────────────────────────────────────────────

let statusBarItem: vscode.StatusBarItem;

function updateStatusBar(text: string, tooltip: string, ok: boolean) {
  statusBarItem.text = `$(pulse) Aurekai: ${text}`;
  statusBarItem.tooltip = tooltip;
  statusBarItem.backgroundColor = ok
    ? undefined
    : new vscode.ThemeColor('statusBarItem.errorBackground');
}

// ── Run akai CLI ─────────────────────────────────────────────────────────────

async function runAkai(args: string[]): Promise<{ ok: boolean; output: unknown; raw: string }> {
  const cfg = vscode.workspace.getConfiguration('aurekai');
  const bin = cfg.get<string>('binary', 'akai');
  const fullArgs = [...args, '--json'];
  try {
    const { stdout } = await execFileAsync(bin, fullArgs, { timeout: 60_000 });
    const parsed = JSON.parse(stdout);
    return { ok: true, output: parsed, raw: stdout };
  } catch (err: unknown) {
    const e = err as { stderr?: string; stdout?: string; message?: string };
    const raw = e.stdout || e.stderr || e.message || String(err);
    let parsed: unknown = { error: raw };
    try { parsed = JSON.parse(raw); } catch {}
    return { ok: false, output: parsed, raw };
  }
}

// ── Webview panel ─────────────────────────────────────────────────────────────

let panel: vscode.WebviewPanel | undefined;

function getOrCreatePanel(context: vscode.ExtensionContext): vscode.WebviewPanel {
  if (panel) {
    panel.reveal(vscode.ViewColumn.Beside);
    return panel;
  }
  panel = vscode.window.createWebviewPanel(
    'aurékaiOutput',
    'Aurekai',
    vscode.ViewColumn.Beside,
    { enableScripts: true, retainContextWhenHidden: true }
  );
  panel.onDidDispose(() => { panel = undefined; }, null, context.subscriptions);
  return panel;
}

function renderHtml(operator: string, result: unknown, ok: boolean): string {
  const json = JSON.stringify(result, null, 2);
  const proofUri = (result as Record<string, unknown>)?.proof_uri as string | undefined;
  const statusColor = ok ? '#4ec9b0' : '#f44747';
  const statusLabel = ok ? 'OK' : 'FAILED';
  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>
  body { font-family: var(--vscode-editor-font-family, monospace); font-size: 13px;
    background: var(--vscode-editor-background); color: var(--vscode-editor-foreground);
    padding: 16px; margin: 0; }
  h2 { font-size: 15px; margin: 0 0 8px; }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 4px;
    font-size: 11px; font-weight: bold; color: #fff; background: ${statusColor}; }
  .proof { font-size: 11px; color: var(--vscode-textLink-foreground); margin: 8px 0 0; }
  pre { background: var(--vscode-textCodeBlock-background, #1e1e1e);
    border: 1px solid var(--vscode-panel-border); border-radius: 4px;
    padding: 12px; overflow: auto; white-space: pre-wrap; word-break: break-all;
    font-size: 12px; margin-top: 12px; max-height: 70vh; }
</style></head><body>
<h2>aurekai <em>${operator}</em> &nbsp;<span class="badge">${statusLabel}</span></h2>
${proofUri ? `<div class="proof">proof: <code>${proofUri}</code></div>` : ''}
<pre>${json.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
</body></html>`;
}

async function runAndDisplay(
  context: vscode.ExtensionContext,
  operator: string,
  args: string[],
  statusText: string
): Promise<void> {
  updateStatusBar(`${statusText}…`, `Running: akai ${args.join(' ')}`, true);
  const p = getOrCreatePanel(context);
  p.webview.html = renderHtml(operator, { status: 'running…' }, true);

  const result = await runAkai(args);

  p.webview.html = renderHtml(operator, result.output, result.ok);
  updateStatusBar(result.ok ? 'Ready' : `${operator} failed`, result.raw.slice(0, 200), result.ok);

  if (!result.ok) {
    vscode.window.showErrorMessage(`Aurekai: ${operator} failed. See panel for details.`);
  }
}

// ── Extension lifecycle ───────────────────────────────────────────────────────

export function activate(context: vscode.ExtensionContext) {
  // Status bar
  statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
  statusBarItem.command = 'aurekai.doctorDeep';
  updateStatusBar('Ready', 'Click to run doctor --deep', true);
  statusBarItem.show();
  context.subscriptions.push(statusBarItem);

  // Commands
  const commands: Array<[string, string, string[]]> = [
    ['aurekai.doctorDeep',        'doctor',          ['doctor', '--deep']],
    ['aurekai.manifestVerify',    'manifest-verify', ['verify', '--manifest', 'artifact.json']],
    ['aurekai.modelMemoryPack',   'model-memory-pack', ['pack', '--tag', 'latest']],
    ['aurekai.releaseGate',       'release-gate',    ['release', 'gate']],
    ['aurekai.saeAudit',          'sae-audit',       ['sae', 'audit']],
    ['aurekai.semanticCacheBench','cache-bench',     ['cache', 'bench']],
    ['aurekai.proofBundleExport', 'proof-export',    ['proof', 'export']],
    ['aurekai.runtimeStatus',     'runtime-status',  ['status']],
  ];

  for (const [cmd, operator, args] of commands) {
    context.subscriptions.push(
      vscode.commands.registerCommand(cmd, () =>
        runAndDisplay(context, operator, args, operator)
      )
    );
  }

  // Capability search command
  context.subscriptions.push(
    vscode.commands.registerCommand('aurekai.searchCapabilities', async () => {
      const query = await vscode.window.showInputBox({
        prompt: 'Search Aurekai capabilities',
        placeHolder: 'e.g. transcribe, proof, model memory…',
      });
      if (!query) return;
      await runAndDisplay(context, 'capability-search', ['search', '--query', query], 'searching');
    })
  );

  vscode.window.showInformationMessage('Aurekai extension active. Use Command Palette to run operators.');
}

export function deactivate() {
  panel?.dispose();
}
