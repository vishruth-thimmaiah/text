# Text, an editor written with rust and typescript.

> [!NOTE]
> This project is a W.I.P.

![Preview](https://github.com/user-attachments/assets/914c0e46-12a4-4b93-8347-cc70975452ef)


## Features:
- Syntax Highlighting using the Language Server Protocol.
- Basic Vim motions.
- Recursive file viewer, with dotfiles and gitignore files greyed out.
- Basic diagnostic warnings.
- Get function information with LSP hover.
- Multiple tab support.
- Basic theming support.

## Installation:
1. Install rust and bun.
   - Bun: https://bun.sh/docs/installation
   - Rust: https://www.rust-lang.org/tools/install
2. Clone the repo:
   ```bash
   git clone https://github.com/vishruth-thimmaiah/text.git
   cd text
   ```
3. Run the build command:
   ```bash
   bun tauri build
   ```

## Running:
  In the same directory, run:
  ```bash
  ./src-tauri/target/debug/text
  ```
