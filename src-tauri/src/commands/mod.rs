pub mod ai;
pub mod auth;
pub mod preferences;
pub mod sessions;
pub mod signals;
pub mod stats;

// Re-export all commands for easy access
pub use ai::*;
pub use auth::*;
pub use preferences::*;
pub use sessions::*;
pub use signals::*;
pub use stats::*;
