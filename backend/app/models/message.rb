class Message
  include Mongoid::Document
  include Mongoid::Timestamps

  field :content, type: String
  field :recipient_number, type: String
  field :sent_at, type: Time
  field :status, type: String, default: "pending"
  field :twilio_sid, type: String
  field :error_message, type: String

  # status to be updated to 'sent', 'failed', etc. based on Twilio response

  belongs_to :user 
  validates :content, presence: true
  validates :recipient_number, presence: true
end
