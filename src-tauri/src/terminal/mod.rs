use std::{
    env,
    io::{BufRead, BufReader, Read, Write},
    sync::Mutex,
};

use portable_pty::{native_pty_system, CommandBuilder, PtyPair, PtySize};
use tauri::State;

use crate::InnerAppState;

pub struct Terminal {
    pair: Mutex<PtyPair>,
    writer: Mutex<Box<dyn Write + Send>>,
    reader: Mutex<BufReader<Box<dyn Read + Send>>>,
}

impl Default for Terminal {
    fn default() -> Self {
        let pty = native_pty_system();
        let pair = pty
            .openpty(PtySize {
                rows: 24,
                cols: 80,
                pixel_width: 0,
                pixel_height: 0,
            })
            .unwrap();

        let reader = pair.master.try_clone_reader().unwrap();
        let writer = pair.master.take_writer().unwrap();

        Terminal {
            pair: Mutex::new(pair),
            writer: Mutex::new(writer),
            reader: Mutex::new(BufReader::new(reader)),
        }
    }
}

#[tauri::command]
pub async fn init_terminal(state: State<'_, InnerAppState>) -> Result<(), ()> {
    let pair = state.terminal.pair.lock().unwrap();

    #[cfg(unix)]
    let mut cmd = CommandBuilder::new(env::var("SHELL").unwrap_or("bash".to_string()));

    #[cfg(windows)]
    let mut cmd = CommandBuilder::new("powershell.exe");

    cmd.env("TERM", "xterm-256color");
    let child = pair.slave.spawn_command(cmd);
    if child.is_ok() {
        // thread::spawn(move || {
        //     let stat = child.unwrap().wait().unwrap();
        // });
        return Ok(());
    }
    Err(())
}

#[tauri::command]
pub async fn write_to_term(data: &str, state: State<'_, InnerAppState>) -> Result<(), ()> {
    let writer = &state.terminal.writer;
    let _ = write!(writer.lock().unwrap(), "{}", data).map_err(|_| ());
    Ok(())
}

#[tauri::command]
pub async fn read_from_term(state: State<'_, InnerAppState>) -> Result<String, ()> {
    let term = &state.terminal;
    let mut reader = term.reader.lock().unwrap();
    let data = {
        let data = reader.fill_buf().map_err(|_| ()).unwrap();

        if data.len() > 0 {
            std::str::from_utf8(data)
                .map(|v| Some(v.to_string()))
                .map_err(|_| ())
                .unwrap()
        } else {
            None
        }
    };

    if let Some(data) = &data {
        reader.consume(data.len());
    }

    data.ok_or(())
}

#[tauri::command]
pub fn resize_term(rows: u16, cols: u16, state: State<'_, InnerAppState>) {
    let _ = state.terminal.pair.lock().unwrap().master.resize(PtySize {
        cols,
        rows,
        ..Default::default()
    });
}
