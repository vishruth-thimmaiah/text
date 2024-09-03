use std::{
    fs::{self, File, Permissions},
    io::{self},
    os::unix::fs::PermissionsExt,
    path::PathBuf,
};

use flate2::read::GzDecoder;
use reqwest::Client;

const RUST_ANALYZER_URL: &str = "https://github.com/rust-lang/rust-analyzer/releases/latest/download/rust-analyzer-x86_64-unknown-linux-gnu.gz";

pub enum Languages {
    Rust,
}

pub async fn get_lsp_bin_path(install_dir: PathBuf, lang: Languages) -> Result<PathBuf, ()> {
    if !install_dir.exists() {
        fs::create_dir(&install_dir).unwrap();

        download(&install_dir.join("rust/"), lang).await;
    }

    match lang {
        Languages::Rust => {
            if !install_dir.join("rust/rust-analyzer").exists() {
                download(&install_dir.join("rust/"), Languages::Rust).await;
            } else {
                return Ok(install_dir.join("rust/rust-analyzer"));
            }
        }
    }

    return Err(());
}

async fn download(install_dir: &PathBuf, lang: Languages) {
    let _ = fs::create_dir(install_dir);

    let client = Client::builder().build().unwrap();
    match lang {
        Languages::Rust => {
            let response = client.get(RUST_ANALYZER_URL).send().await.unwrap();

            let install_dir = install_dir.join("rust-analyzer");

            let reader = response.bytes().await.unwrap();

            let mut decoder = GzDecoder::new(&reader[..]);

            let mut writer = File::create(install_dir).expect("Error writing to fs");
            writer
                .set_permissions(Permissions::from_mode(0o777))
                .expect("Error making file an executable");

            io::copy(&mut decoder, &mut writer).unwrap();
        }
    }
}
