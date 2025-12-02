class Api::TwilioCallbackController < ApplicationController
  skip_before_action :verify_authenticity_token, raise: false
  skip_before_action :authenticate_user!, raise: false  # if you use Devise here

  def status
    twilio_sid    = params[:MessageSid]
    message_status = params[:MessageStatus]
    error_message  = params[:ErrorMessage]
    error_code     = params[:ErrorCode]

    if twilio_sid.present?
      message = Message.find_by(twilio_sid: twilio_sid)

      if message
        attrs = { status: message_status }

        if error_code.present? || error_message.present?
          attrs[:error_message] = [error_code, error_message].compact.join(': ')
        end

        message.update(attrs)
      end
    end

    head :ok
  end
end
