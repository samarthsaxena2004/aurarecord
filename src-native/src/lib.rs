#![deny(clippy::all)]

use napi_derive::napi;

#[napi]
pub fn check_rust_bridge() -> String {
  "AuraRecord Rust Engine: ONLINE".to_string()
}