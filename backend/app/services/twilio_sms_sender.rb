class TwilioSmsSender
  require 'twilio-ruby'

  def initialize(to:, body:)
    @to = to
    @body = body
  end

  def call
     # 🔹 LOCAL MODE:
    # Do NOT send status_callback when running against Twilio from localhost.
    # Twilio rejects localhost callback URLs with 21609 and returns HTTP 400,
    # which causes Twilio::REST::RestError and breaks the request.
    #
    # When you DEPLOY and have a real HTTPS URL, uncomment status_callback below.

    message = client.messages.create(
      from: from_number,
      to:   @to,
      body: @body,
      # Comment this line out when testing locally:
      status_callback: status_callback_url
    )
    message
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

  # Kept for DEPLOYED MODE, not used locally right now.
  def status_callback_url
    base = ENV['APP_BASE_URL'] || 'http://localhost:3000'
    base = base.chomp('/')

    "#{base}/api/twilio/status_callback"
  end
end