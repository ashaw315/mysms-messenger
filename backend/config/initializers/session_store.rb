# This defines how sessions are stored (cookie-based in this case).
Rails.application.config.session_store :cookie_store, key: "_mysms_backend_session", same_site: :lax
# , secure: Rails.env.production?
