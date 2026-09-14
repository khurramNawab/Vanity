<?php

namespace App\Console\Commands;

use App\Models\CartSession;
use App\Mail\AbandonedCartEmail;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class SendAbandonedCartEmails extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:send-abandoned-cart-emails';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Scan for abandoned checkouts and dispatch recovery nudge emails.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Scanning for abandoned checkouts (inactive for > 1 hour)...');

        // Fetch sessions inactive for more than 1 hour, not recovered, and email not sent yet
        $abandonedSessions = CartSession::where('is_recovered', false)
            ->where('email_sent', false)
            ->where('last_activity_at', '<', now()->subHour())
            ->get();

        $this->info("Found {$abandonedSessions->count()} abandoned checkouts to process.");

        foreach ($abandonedSessions as $session) {
            $email = $session->email ?: ($session->user ? $session->user->email : null);
            if (!$email) {
                continue;
            }

            try {
                Mail::to($email)->send(new AbandonedCartEmail($session, null, 'nudge'));
                
                $session->update([
                    'email_sent' => true,
                    'email_sent_at' => now(),
                ]);

                $this->info("Dispatched nudge email to: {$email}");
                Log::info("Automated abandoned cart email sent to {$email} (Session ID: {$session->id})");
            } catch (\Exception $e) {
                $this->error("Failed to send email to {$email}: " . $e->getMessage());
                Log::error("Failed to send automated recovery email to {$email}: " . $e->getMessage());
            }
        }

        $this->info('Abandoned checkout scan completed.');
    }
}
