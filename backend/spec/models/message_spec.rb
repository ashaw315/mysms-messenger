require "rails_helper"

RSpec.describe Message, type: :model do
    let (:user) {User.create!(
        email: 'example@example.com',
        password: 'password123',
        password_confirmation: 'password123'
    )}
    let (:number) { '+1234567890' }
    let (:number2) { '+1234567891' }

    it 'is valid with valid attributes' do
        message = Message.new(
            content: 'Hello, this is a test message.',
            recipient_number: number,
            user: user
        )
        expect(message).to be_valid
    end

    it 'is invalid without content' do
        message = Message.new(
            content: nil,
            recipient_number: number,
            user: user
        )
        expect(message).to_not be_valid
        expect(message.errors[:content]).to include("can't be blank")
    end

    it 'requires a recipient number' do
        message = Message.new(
            content: 'Hello, this is a test message.',
            recipient_number: nil,
            user: user
        )

        expect(message).to_not be_valid
        expect(message.errors[:recipient_number]).to include("can't be blank")
    end

end