export interface Message {
    _id: string;
    recipient_number: string;
    content: string;
    twilio_sid?: string;
    status?: string;
    error_message?: string;
    created_at?: string;
    updated_at?: string;
}