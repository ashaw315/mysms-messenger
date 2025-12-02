require 'rails_helper'

RSpec.describe User, type: :model do
    let (:number) { '+1234567890' }
    let (:number2) { '+1234567891' }

    it 'is valid with valid attributes' do
        user = User.new(
            email: 'test@example.com',
            password: 'password123',
            password_confirmation: 'password123'
        )
        
        expect(user).to be_valid
    end

    it 'is invalid without an email' do
        user = User.new(
            email: nil,
            password: 'password123',
            password_confirmation: 'password123'
        )

        expect(user).to_not be_valid
        expect(user.errors[:email]).to include("can't be blank")
    end

   it "is invalid with a duplicate email" do
    # Make the email dynamic inside the spec so it can’t collide with leftover data
    email = "dupe_#{SecureRandom.hex(4)}@example.com"

    User.create!(
        email: email,
        password: "password123",
        password_confirmation: "password123"
    )

    expect {
        User.create!(
        email: email,
        password: "password123",
        password_confirmation: "password123"
        )
    }.to raise_error(Mongoid::Errors::Validations)
    end

    it 'has many messages' do
        user = User.create!(
            email: 'test2@example.com',
            password: 'password123',
            password_confirmation: 'password123'
        )

        message1 = user.messages.create!(
            content: 'Hello, this is a test message.',
            recipient_number: number
        )
        message2 = user.messages.create!(
            content: 'This is another test message.',
            recipient_number: number2
        )
        expect(user.messages.count).to eq(2)
        expect(user.messages).to include(message1, message2)
        expect(message1.user).to eq(user)
        expect(message2.user).to eq(user)
        expect(user.messages.first.content).to eq('Hello, this is a test message.')
        expect(user.messages.last.content).to eq('This is another test message.')
        expect(user.messages.first.recipient_number).to eq(number)
        expect(user.messages.last.recipient_number).to eq(number2)
    end
end
