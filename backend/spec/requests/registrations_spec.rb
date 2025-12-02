require 'rails_helper'

RSpec.describe "User Registrations", type: :request do
    let!(:valid_params) do
        {
            user: {
                email: 'newuser@example.com',
                password: 'securepassword',
                password_confirmation: 'securepassword'
            }
        }
    end

    let(:invalid_params) do
        {
            user: {
                email: 'invalidemail',
                password: 'short',
                password_confirmation: 'mismatch'
            }
        }
    end

    describe 'POST /users' do
        context 'with valid parameters' do
            it 'creates a new user and returns status 201' do
                post '/users', params: valid_params, as: :json
                expect(response).to have_http_status(:created)
                expect(JSON.parse(response.body)['email']).to eq("newuser@example.com")
                expect(response.cookies).not_to be_empty
            end
        end

        context 'with invalid parameters' do
            it 'does not create a user and returns status 422' do
                post '/users', params: invalid_params, as: :json
                expect(response).to have_http_status(:unprocessable_content)
                errors = JSON.parse(response.body)['errors']
                expect(errors).to include(
                    'email' => ["is invalid"],
                    'password' => ["is too short (minimum is 6 characters)"],
                    'password_confirmation' => ["doesn't match Password"]
                )
            end
        end

        context 'when email already exists' do
            before do
                User.create!(
                    email: "dup@example.com",
                    password: "password123",
                    password_confirmation: "password123"
                )
            end
            it 'does not create a user and returns status 422' do
                post '/users', params: {
                    user: {
                        email: "dup@example.com",
                        password: "password123",
                        password_confirmation: "password123"
                    }
                }, as: :json

                expect(response).to have_http_status(:unprocessable_content)
                errors = JSON.parse(response.body)['errors']
                expect(errors).to include(
                    'email' => ["has already been taken"]
                )
            end
        end
    end
end