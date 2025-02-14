#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]
use device_query::{DeviceQuery, DeviceState, Keycode};
use std::collections::HashSet;
use std::{
    sync::atomic::{AtomicBool, Ordering}, // 修正這裡
    time::{Duration, Instant},
};
use tauri::{Emitter};

// Global flag to control the listening thread
static LISTENING: AtomicBool = AtomicBool::new(false);

#[tauri::command]
fn start_listening(window: tauri::Window) {
    if LISTENING.load(Ordering::SeqCst) {
        return;
    }
    LISTENING.store(true, Ordering::SeqCst);

    tauri::async_runtime::spawn_blocking(move || {
        let mut pressed_keys: HashSet<Keycode> = HashSet::new();
        let mut last_press_time = Instant::now();

        while LISTENING.load(Ordering::SeqCst) {
            let device_state = DeviceState::new(); // Create each time inside loop
            let keys: Vec<Keycode> = device_state.get_keys();
            let now = Instant::now();

            if now.duration_since(last_press_time) > Duration::from_millis(20) {
                for &key in &keys {
                    if !pressed_keys.contains(&key) {
                        pressed_keys.insert(key);
                        println!("Key pressed: {:?}", key);
                        let _ = window.emit("play_key_sound", (key.to_string(),));
                        last_press_time = now;
                    }
                }
                pressed_keys.retain(|key| keys.contains(key));
            }
            std::thread::sleep(Duration::from_millis(10));
        }
    });
}

#[tauri::command]
fn stop_listening() {
    LISTENING.store(false, Ordering::SeqCst);
}


fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![start_listening, stop_listening])
        .run(tauri::generate_context!())
        .expect("error while running Tauri application");
}
