# Quickstart — aurekai-vscode

Aurekai VS Code extension for the VS Code Marketplace.

## Install

Search "Aurekai" in VS Code Extensions, or:

```bash
code --install-extension aurekai.aurekai-vscode
```

## Commands

| Command | Description |
|---|---|
| `Aurekai: Doctor Deep` | Run `akai doctor --deep` in terminal |
| `Aurekai: Verify Manifest` | Verify `artifact.json` manifest |
| `Aurekai: Pack Model Memory` | Pack model memory artifacts |
| `Aurekai: Release Gate` | Run release gate check |

## Configuration

```json
{
  "aurekai.version": "0.8.0-alpha.4"
}
```

## Validate

```bash
bash tests/validate-schemas.sh
bash tests/validate-scripts.sh
```
