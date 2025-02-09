use device_query::{DeviceQuery, DeviceState, Keycode};
use std::{
    thread, 
    time::{Duration, Instant}, 
    sync::atomic::{AtomicBool, Ordering} // 修正這裡
};
use tauri::{Emitter};
use std::collections::HashSet;

// Global flag to control the listening thread
static LISTENING: AtomicBool = AtomicBool::new(false);

#[tauri::command]
fn start_listening(window: tauri::Window) {
    if LISTENING.load(Ordering::SeqCst) {
        return; // Already listening, do nothing
    }
    LISTENING.store(true, Ordering::SeqCst);

    let device_state = DeviceState::new();
    let mut pressed_keys: HashSet<Keycode> = HashSet::new();
    let mut last_press_time = Instant::now();

    thread::spawn(move || {
        while LISTENING.load(Ordering::SeqCst) {
            let keys: Vec<Keycode> = device_state.get_keys();
            let now = Instant::now();
            
            if now.duration_since(last_press_time) > Duration::from_millis(20) {
                for &key in &keys {
                    if !pressed_keys.contains(&key) {
                        pressed_keys.insert(key);
                        println!("Key pressed: {:?}", key);
                        window.emit("play_key_sound", ()).unwrap();
                        last_press_time = now;
                    }
                }
                pressed_keys.retain(|key| keys.contains(key));
            }
            thread::sleep(Duration::from_millis(10));
        }
    });
}

#[tauri::command]
fn stop_listening() {
    LISTENING.store(false, Ordering::SeqCst);
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![start_listening, stop_listening])
        .run(tauri::generate_context!())
        .expect("error while running Tauri application");
}
