use std::{
    collections::HashMap,
    fs::{self, File, Permissions},
    io::{self},
    os::unix::fs::PermissionsExt,
    path::PathBuf,
    process,
};

use flate2::read::GzDecoder;
use reqwest::Client;

const RUST_ANALYZER_URL: &str = "https://github.com/rust-lang/rust-analyzer/releases/latest/download/rust-analyzer-x86_64-unknown-linux-gnu.gz";

pub enum Languages {
    Rust,
    Go,
}

pub async fn get_lsp_bin_path(install_dir: PathBuf, lang: Languages) -> Result<PathBuf, ()> {
    if !install_dir.exists() {
        fs::create_dir(&install_dir).unwrap();
    }

    match lang {
        Languages::Rust => {
            if !install_dir.join("rust/rust-analyzer").exists() {
                let is_downloaded = download_from_url(
                    &install_dir.join("rust/"),
                    RUST_ANALYZER_URL,
                    "rust-analyzer",
                )
                .await;
                if is_downloaded.is_err() {
                    return Err(());
                }
            }
            return Ok(install_dir.join("rust/rust-analyzer"));
        }
        Languages::Go => {
            if !install_dir.join("go/gopls").exists() {
                
                let mut vars = HashMap::new();
                vars.insert("GO111MODULE", "on");
                let dir = &install_dir.join("go");
                vars.insert("GOBIN", dir.to_str().unwrap());

                let is_downloaded = download_with_cmd(
                    "go",
                    vec!["install", "golang.org/x/tools/gopls@latest"],
                    vars
                )
                .await;

                if is_downloaded.is_err() {
                    return Err(());
                }
            }
            return Ok(install_dir.join("go/gopls"));
        }
    }
}

async fn download_from_url(install_dir: &PathBuf, url: &str, lsp_name: &str) -> Result<(), ()> {
    let _ = fs::create_dir(install_dir);

    let client = Client::builder().build().unwrap();
    let response = client.get(url).send().await.unwrap();

    let reader = response.bytes().await.unwrap();
    let mut decoder = GzDecoder::new(&reader[..]);

    let mut writer = File::create(install_dir.join(lsp_name)).expect("Error writing to fs");
    writer
        .set_permissions(Permissions::from_mode(0o777))
        .expect("Error making file an executable");

    io::copy(&mut decoder, &mut writer).unwrap();
    Err(())
}

async fn download_with_cmd(
    cmd: &str,
    args: Vec<&str>,
    vars: HashMap<&str, &str>,
) -> Result<(), ()> {
    if let Ok(_) = process::Command::new(cmd).args(args).envs(vars).output() {
        return Ok(());
    }

    return Err(());
}
