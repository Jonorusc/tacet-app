fn main() {
    // Load environment variables from ../.env (root of tacet-app)
    dotenv::from_path("../.env").ok();

    // Explicitly pass specific variables to the Rust compiler
    // This avoids the deprecated from_path_iter and is more secure
    let key = "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY";
    if let Ok(value) = std::env::var(key) {
        println!("cargo:rustc-env={}={}", key, value);
    }

    tauri_build::build();
}
