use device_query::{DeviceQuery, DeviceState, Keycode};
use std::{fs::File, thread, time::{Duration, Instant}};
use tauri::{Manager, Emitter};
use std::collections::HashSet;

#[tauri::command]
fn start_listening(window: tauri::Window) {
    let device_state = DeviceState::new();
    let mut pressed_keys: HashSet<Keycode> = HashSet::new(); // Keep track of pressed keys
    let mut last_press_time = Instant::now(); // Track last key press time

    // Create a new thread to listen for key presses
    thread::spawn(move || {
        loop {
            let keys: Vec<Keycode> = device_state.get_keys();
            let now = Instant::now();
            
            // Poll every 20ms (faster polling)
            if now.duration_since(last_press_time) > Duration::from_millis(20) {
                for &key in &keys {
                    // If the key is not already pressed, trigger the event and add it to the pressed set
                    if !pressed_keys.contains(&key) {
                        pressed_keys.insert(key);
                        println!("Key pressed: {:?}", key);
                        window.emit("play_key_sound", ()).unwrap(); // Emit the event to play sound
                        last_press_time = now; // Update the last press time
                    }
                }

                // Remove keys that are no longer pressed (i.e., keys that are released)
                pressed_keys.retain(|key| keys.contains(key));
            }

            thread::sleep(Duration::from_millis(20)); // Check every 20 ms (lower delay)
        }
    });
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![start_listening])
        .run(tauri::generate_context!())
        .expect("error while running Tauri application");
}
