module Api
  class TwilioCallbacksController < ApplicationController
    skip_before_action :verify_authenticity_token, raise: false
    skip_before_action :authenticate_user!, raise: false

    def status
      twilio_sid     = params[:MessageSid]
      message_status = params[:MessageStatus]   # queued, sent, delivered, failed...
      error_message  = params[:ErrorMessage]
      error_code     = params[:ErrorCode]

      if twilio_sid.present?
        if (message = Message.find_by(twilio_sid: twilio_sid))
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
end