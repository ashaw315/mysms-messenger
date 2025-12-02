require 'rails_helper'

RSpec.describe "Messages API", type: :request do
    let!(:user) do
        User.create!(
            email: 'test@example.com',
            password: 'password123',
            password_confirmation: 'password123'
        )
    end

    let!(:user2) do
        User.create!(
            email: 'anothertest@example.com',
            password: 'password123',
            password_confirmation: 'password123'
        )
    end

    let!(:valid_message_params) do
        {
            message: {
                recipient_number: '+1234567890',
                content: 'Hello, this is a test message.'
            }
        }
    end

    def sign_in(user)
        post '/users/sign_in', params: {
            user: {
                email: user.email,
                password: 'password123'
            }
        }, as: :json
    end

    it 'requires authentication to access messages' do
        get '/api/messages', as: :json
        expect(response).to have_http_status(:unauthorized)
    end

    it "allows an authenticated user to retrieve only their messages" do
        sign_in(user)

        message1 = user.messages.create!(
            content: "Hello, this is a test message.",
            recipient_number: "+1234567890"
        )

        user2.messages.create!(
            content: "This is another test message.",
            recipient_number: "+1234567891"
        )

        get "/api/messages", as: :json

        expect(response).to have_http_status(:ok)

        # 🔴 If you currently have: JSON.parse(response.body)["messages"]
        # change it to this:
        messages = JSON.parse(response.body)

        expect(messages.length).to eq(1)

        first = messages.first
        expect(first["content"]).to eq("Hello, this is a test message.")
        expect(first["recipient_number"]).to eq("+1234567890")

        ids = messages.map { |m| m["_id"] }
        expect(ids).to include(message1.id.to_s)
        expect(ids).not_to include(user2.messages.first.id.to_s)
     end

    it 'sends an SMS Twilio when a message is created and returns JSON' do
        sign_in(user)
        twilio_message = instance_double(
          "TwilioMessage",
          sid: "SM1234567890",
          status: "queued"
        )

        sms_sender = instance_double(TwilioSmsSender, call: twilio_message)

        expect(TwilioSmsSender).to receive(:new).with(
            to: '+1234567890',
            body: 'Hello, this is a test message.'
        ).and_return(sms_sender)

        post '/api/messages', params: valid_message_params, as: :json

        expect(response).to have_http_status(:created)
        json_response = JSON.parse(response.body)
        expect(json_response['recipient_number']).to eq('+1234567890')
        expect(json_response['content']).to eq('Hello, this is a test message.')
        expect(json_response['twilio_sid']).to eq('SM1234567890')
        expect(json_response['status']).to eq('queued')

        message = Message.last
        expect(message.user).to eq(user)
        expect(message.twilio_sid).to eq("SM1234567890")
        expect(message.status).to eq("queued")
    end
end