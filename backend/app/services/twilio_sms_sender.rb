class TwilioSmsSender
  require 'twilio-ruby'

    def initialize(to:, body:)
        @to = to
        @body = body
    end

    def call
        client.messages.create(
            from: from_number,
            to: @to,
            body: @body
        )
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
end