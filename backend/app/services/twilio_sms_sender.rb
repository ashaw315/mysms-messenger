class TwilioSmsSender
  require 'twilio-ruby'

  def initialize(to:, body:)
    @to   = to
    @body = body
  end

  def call
    params = {
      from: from_number,
      to:   @to,
      body: @body
    }

    if status_callback_url.present?
      Rails.logger.info "TwilioSmsSender status_callback_url=#{status_callback_url}"
      params[:status_callback] = status_callback_url
    end

    client.messages.create(**params)
  end

  private

  def client
    @client ||= Twilio::REST::Client.new(account_sid, auth_token)
  end

  def account_sid
    ENV['TWILIO_ACCOUNT_SID']
  end

  def auth_token
    ENV['TWILIO_AUTH_TOKEN']
  end

  def from_number
    ENV['TWILIO_FROM_NUMBER']
  end

  def status_callback_url
    ENV['TWILIO_STATUS_CALLBACK_URL']
  end
end
