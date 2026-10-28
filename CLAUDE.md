# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A [Zed](https://zed.dev/) editor extension adding CSV language support (syntax highlighting). No language server; the Rust code is a stub.

## Commands

- `make build` — builds the extension with the `zed-extension` CLI (from `zed-industries/zed/crates/extension_cli`, must be installed separately), unpacks `target/archive.tar.gz` into `target/csv`, and copies it into Zed's installed-extensions dir so Zed hot-reloads it.
  - The Makefile hardcodes the macOS path `~/Library/Application Support/Zed/extensions/installed/`. On Linux the copy step targets a nonexistent dir; adjust the destination (Zed on Linux uses `~/.local/share/zed/extensions/installed/`) or use Zed's "Install Dev Extension" on the repo instead.
- No test suite. `test/example*.{csv,tsv,psv}` are sample files for opening in Zed to eyeball highlighting.

## Architecture

The extension is mostly declarative; pieces that work together:

- **Delimiters = languages.** Tree-sitter compiles the separator into the parser and Zed extensions can't feed settings to grammars, so each delimiter is its own language: `CSV` (`,`), `TSV` (tab), `PSV` (`|`), `CSV (Semicolon)` (`;`). Users switch via Zed's language selector or map extensions with Zed's `file_types` setting.
- `extension.toml` — one `[grammars.*]` per delimiter. `csv`/`tsv`/`psv` come from subdirs (`path = ...`) of `tree-sitter-grammars/tree-sitter-csv` at a pinned commit; `scsv` is vendored in this repo under `tree-sitter-scsv/` and pinned to a commit of this repo (must be pushed). Grammars are fetched at build time into `grammars/` (gitignored).
- `tree-sitter-scsv/` — semicolon grammar: copy of upstream `common/define-grammar.js` plus `scsv/grammar.js`. Regenerate with `npx tree-sitter-cli@0.25.10 generate` in `tree-sitter-scsv/scsv`; commit the generated `src/`. Keep `define-grammar.js` in sync with upstream so all four grammars share node names.
- `languages/<dir>/config.toml` — language registration; `grammar` must match a `[grammars.*]` key, `name` must be unique.
- `languages/<dir>/highlights.scm` — identical queries except the delimiter literal. Node names (`text`, `number`, `float`, `boolean`) come from the grammars; if the upstream commit changes, verify these still exist.
- `src/lib.rs` — compiled to a `cdylib` WASM module via `zed_extension_api`. Only registers the extension; `language_server_command` returns an error since there's no LSP.

## Releasing

Version lives in **both** `extension.toml` and `Cargo.toml` (keep in sync). Push a `v*` tag; `.github/workflows/release.yml` runs `huacnlee/zed-extension-action`, which opens a PR against the Zed extensions registry (via the `huacnlee/zed-extensions` fork).
