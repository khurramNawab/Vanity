<?php

namespace App\Mail;

use App\Models\CartSession;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AbandonedCartEmail extends Mailable
{
    use Queueable, SerializesModels;

    public $cartSession;
    public $couponCode;
    public $templateType;
    public $customSubject;
    public $customMessage;

    /**
     * Create a new message instance.
     */
    public function __construct(CartSession $cartSession, $couponCode = null, $templateType = 'nudge', $customSubject = null, $customMessage = null)
    {
        $this->cartSession = $cartSession;
        $this->couponCode = $couponCode;
        $this->templateType = $templateType; // 'nudge', 'urgency', 'discount', 'custom'
        $this->customSubject = $customSubject;
        $this->customMessage = $customMessage;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $subjects = [
            'nudge' => 'Did you leave something behind at Vanity?',
            'urgency' => 'Only a few items left in your Vanity cart!',
            'discount' => 'Come back to Vanity and get 10% off your cart!',
            'custom' => 'A Special Note from Vanity Jewels',
        ];

        $subject = !empty($this->customSubject) ? $this->customSubject : ($subjects[$this->templateType] ?? $subjects['nudge']);

        return new Envelope(
            subject: $subject,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.abandoned_cart',
        );
    }
}
