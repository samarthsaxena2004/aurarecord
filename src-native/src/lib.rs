#![deny(clippy::all)]

use napi_derive::napi;
use rdev::{listen, EventType};
use std::sync::atomic::{AtomicI32, Ordering};
use std::thread;

// Atomic storage for lock-free high-frequency updates
static MOUSE_X: AtomicI32 = AtomicI32::new(0);
static MOUSE_Y: AtomicI32 = AtomicI32::new(0);
static LAST_CLICK: AtomicI32 = AtomicI32::new(0); // 0: None, 1: Left, 2: Right

#[napi]
pub fn check_rust_bridge() -> String {
    "AuraRecord Rust Engine: ONLINE".to_string()
}

#[napi]
pub fn start_mouse_hook() {
    thread::spawn(|| {
        // listen blocks the thread, so it stays alive here
        if let Err(error) = listen(move |event| {
            match event.event_type {
                EventType::MouseMove { x, y } => {
                    MOUSE_X.store(x as i32, Ordering::Relaxed);
                    MOUSE_Y.store(y as i32, Ordering::Relaxed);
                }
                EventType::ButtonPress(button) => {
                    match button {
                        rdev::Button::Left => LAST_CLICK.store(1, Ordering::Relaxed),
                        rdev::Button::Right => LAST_CLICK.store(2, Ordering::Relaxed),
                        _ => {}
                    }
                }
                _ => {}
            }
        }) {
            eprintln!("Error starting hook: {:?}", error);
        }
    });
}

#[napi]
pub fn get_mouse_state() -> serde_json::Value {
    // We swap click to 0 so we only report a specific click once
    let click = LAST_CLICK.swap(0, Ordering::Relaxed);
    
    serde_json::json!({
        "x": MOUSE_X.load(Ordering::Relaxed),
        "y": MOUSE_Y.load(Ordering::Relaxed),
        "click": click
    })
}