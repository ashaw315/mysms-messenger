Rails.application.routes.draw do
  devise_for :users

  get '/users.json', to: 'users#show'

  namespace :api do
    resources :messages, only: [:index, :create]
    post 'twilio/status_callback', to: 'twilio_callbacks#status'
  end

  get "up" => "rails/health#show", as: :rails_health_check
end
