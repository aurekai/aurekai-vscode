<p align="center">
  <img src="https://raw.githubusercontent.com/aurekai/aurekai/main/assets/aurekai-logo.svg" alt="Aurekai" width="520" />
</p>

# Aurekai VS Code Extension · v0.8.0-alpha.5

Run Aurekai capability operators directly from VS Code — WebviewPanel JSON output, StatusBar live status, 9 commands.

## Features

- **Status bar**: live Aurekai runtime indicator; click to run `doctor --deep`
- **WebviewPanel**: formatted JSON output side-by-side with your editor; proof URI highlighted
- **9 commands** via Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`):

| Command | Operator |
|---|---|
| `Aurekai: Doctor Deep` | `akai doctor --deep` |
| `Aurekai: Verify Manifest` | `akai verify --manifest artifact.json` |
| `Aurekai: Pack Model Memory` | `akai pack --tag latest` |
| `Aurekai: Release Gate` | `akai release gate` |
| `Aurekai: SAE Audit` | `akai sae audit` |
| `Aurekai: Semantic Cache Benchmark` | `akai cache bench` |
| `Aurekai: Export Proof Bundle` | `akai proof export` |
| `Aurekai: Runtime Status` | `akai status` |
| `Aurekai: Search Capabilities` | `akai search --query <input>` |

## Requirements

- `akai` binary on `PATH` (`npm install -g @aurekai/runtime`)

## Settings

| Setting | Default | Description |
|---|---|---|
| `aurekai.version` | `0.8.0-alpha.5` | Aurekai runtime version |
| `aurekai.binary` | `akai` | Path to `akai` binary |

## Development

```bash
npm install
npm run compile
# Press F5 in VS Code to launch Extension Development Host
```

