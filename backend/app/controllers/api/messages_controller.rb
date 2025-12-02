class Api::MessagesController < ApplicationController
    before_action :authenticate_user!

    def index
        messages = current_user.messages.order(created_at: :desc)
        render json: messages
    end

    def create
        to = message_params[:recipient_number]
        body = message_params[:content]
        begin
            twilio_message = TwilioSmsSender.new(to: to, body: body).call
            
            message = current_user.messages.create!(
                recipient_number: to,
                content: body,
                twilio_sid: twilio_message.sid,
                status: twilio_message.status
            )

            render json: message, status: :created
        rescue Twilio::REST::RestError => e
            message = current_user.messages.new(
                recipient_number: to,
                content: body,
                status: 'failed',
                error_message: e.message,
            )
            message.save(validate: false)
            render json: { errors: e.message }, status: :unprocessable_content
        end
    end

    private

    def message_params
        params.require(:message).permit(:content, :recipient_number)
    end
end
