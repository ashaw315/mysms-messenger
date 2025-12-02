class Api::TwilioCallbackController < ApplicationController
    skip_before_action :verify_authenticity_token, raise: false

    def status
        twilio_sid = params[:MessageSid]
        status = params[:MessageStatus]
        error_message = params[:ErrorMessage]
        error_code = params[:ErrorCode]

        if sid.present?
            message = Message.where(twilio_sid: twilio_sid).first

            if message
                attrs = { status: status }
                if error_code.present? || error_message.present?
                    attrs[:error_code] = [error_code, error_message].compact.join(": ")
                end
                message.update(attrs)
            end
        end
        head :ok
    end
end