import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    const cfg = vscode.workspace.getConfiguration('aurekai');
    const version = cfg.get<string>('version', '0.8.0-alpha.4');

    const cmds: [string, string[]][] = [
        ['aurekai.doctorDeep', ['akai', 'doctor', '--deep', '--json']],
        ['aurekai.manifestVerify', ['akai', 'verify', '--manifest', 'artifact.json', '--json']],
        ['aurekai.modelMemoryPack', ['akai', 'pack', '--tag', 'latest', '--json']],
        ['aurekai.releaseGate', ['akai', 'release', 'gate', '--version', version, '--json']],
    ];

    for (const [cmd, args] of cmds) {
        context.subscriptions.push(
            vscode.commands.registerCommand(cmd, () => {
                const terminal = vscode.window.createTerminal('Aurekai');
                terminal.sendText(args.join(' '));
                terminal.show();
            })
        );
    }
}

export function deactivate() {}
