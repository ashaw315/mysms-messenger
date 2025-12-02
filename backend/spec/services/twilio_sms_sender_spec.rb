require 'rails_helper'

RSpec.describe TwilioSmsSender do
    describe '#call' do
        it 'sends an SMS via Twilio' do
            to_number = '+1234567890'
            message_body = 'Test message from RSpec'

            sms_sender = TwilioSmsSender.new(to: to_number, body: message_body)

            # Mock the Twilio client
            twilio_client = instance_double(Twilio::REST::Client)
            messages_double = instance_double("TwilioMessages")
            twilio_message = instance_double("TwilioMessage", sid: 'SM123', status: 'sent')


            allow(Twilio::REST::Client).to receive(:new).and_return(twilio_client)
            allow(twilio_client).to receive(:messages).and_return(messages_double)
            allow(messages_double).to receive(:create).and_return(twilio_message)

            result = sms_sender.call

            expect(result).to be_truthy
            expect(result).to eq(twilio_message)
            expect(messages_double).to have_received(:create).with(
                from: ENV['TWILIO_FROM_NUMBER'],
                to: to_number,
                body: message_body
            )
        end
    end
end