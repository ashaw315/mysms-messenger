if Rails.env.production?
  Rails.application.config.session_store :cookie_store,
    key: '_mysms_messenger_session',
    same_site: :none,
    secure: true,
    domain: 'mysms-messenger-0b5d.onrender.com'
else
  Rails.application.config.session_store :cookie_store,
    key: '_mysms_messenger_session'
end
