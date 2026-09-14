'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import StorefrontNavbar from '@/components/StorefrontNavbar';
import StorefrontFooter from '@/components/StorefrontFooter';
import Breadcrumbs from '@/components/Breadcrumbs';
import { fetchApi } from '@/lib/api';
import { useStoreSettings } from '@/lib/settings';

export default function ContactPage() {
  const { settings } = useStoreSettings();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccess(null);
    setError(null);

    try {
      const res = await fetchApi('/support', {
        method: 'POST',
        body: JSON.stringify({ name, email, subject, message })
      });

      if (res.success) {
        setSuccess(res.message || 'Your inquiry has been successfully sent!');
        setName('');
        setEmail('');
        setSubject('');
        setMessage('');
      } else {
        setError(res.message || 'Failed to submit contact request.');
      }
    } catch (err: any) {
      setError(err.message || 'Network error occurred while sending message.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-surface text-on-surface font-body-md antialiased min-h-screen flex flex-col">
      <StorefrontNavbar />

      <main className="flex-grow w-full max-w-[1280px] mx-auto px-5 md:px-12 py-12">
        {/* Breadcrumb */}
        <Breadcrumbs items={[{ label: 'Contact Us' }]} className="mb-6" />

        <h1 className="font-headline-lg text-headline-lg text-primary mb-2 font-bold">Get in Touch</h1>
        <p className="text-on-surface-variant mb-10 max-w-2xl">
          We&apos;d love to hear from you. Whether you have a question about our jewellery, need help with an order, or want to schedule a private consultation, we&apos;re here to assist.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div className="space-y-8">
            <div className="bg-surface-container-low border border-outline-variant/20 rounded-lg p-6 space-y-6">
              <div className="flex items-start gap-4">
                <span className="material-symbols-outlined text-secondary text-[28px] mt-1">location_on</span>
                <div>
                  <h3 className="font-semibold text-primary mb-1">Visit Our Store</h3>
                  <p className="text-on-surface-variant text-sm leading-relaxed">
                    Vanity Jewels<br />
                    {settings.store_address}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <span className="material-symbols-outlined text-secondary text-[28px] mt-1">schedule</span>
                <div>
                  <h3 className="font-semibold text-primary mb-1">Business Hours</h3>
                  <p className="text-on-surface-variant text-sm">
                    Monday – Saturday: 11:00 AM – 8:00 PM<br />
                    Sunday: Closed
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <span className="material-symbols-outlined text-secondary text-[28px] mt-1">call</span>
                <div>
                  <h3 className="font-semibold text-primary mb-1">Phone</h3>
                  <p className="text-on-surface-variant text-sm">{settings.contact_phone}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <span className="material-symbols-outlined text-secondary text-[28px] mt-1">mail</span>
                <div>
                  <h3 className="font-semibold text-primary mb-1">Email</h3>
                  <a href={`mailto:${settings.contact_email}`} className="text-on-surface-variant hover:text-primary transition-colors text-sm">
                    {settings.contact_email}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-surface-container-low border border-outline-variant/20 rounded-lg p-6">
            <h2 className="font-headline-md text-lg text-primary mb-6 font-bold">Send Us a Message</h2>
            
            {success && <div className="p-4 bg-[#e8f5e9] border border-[#a5d6a7] text-[#137333] text-xs rounded mb-4">{success}</div>}
            {error && <div className="p-4 bg-error-container/20 border border-error/30 text-error text-xs rounded mb-4">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-on-surface-variant mb-1 font-medium" htmlFor="contact-name">Full Name *</label>
                <input
                  id="contact-name"
                  type="text"
                  required
                  className="w-full p-3 border border-outline-variant/30 focus:border-primary focus:outline-none bg-white rounded text-sm text-primary"
                  placeholder="Your full name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs text-on-surface-variant mb-1 font-medium" htmlFor="contact-email">Email Address *</label>
                <input
                  id="contact-email"
                  type="email"
                  required
                  className="w-full p-3 border border-outline-variant/30 focus:border-primary focus:outline-none bg-white rounded text-sm text-primary"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs text-on-surface-variant mb-1 font-medium" htmlFor="contact-subject">Subject</label>
                <input
                  id="contact-subject"
                  type="text"
                  className="w-full p-3 border border-outline-variant/30 focus:border-primary focus:outline-none bg-white rounded text-sm text-primary"
                  placeholder="Order enquiry, consultation, etc."
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs text-on-surface-variant mb-1 font-medium" htmlFor="contact-message">Message *</label>
                <textarea
                  id="contact-message"
                  required
                  rows={5}
                  className="w-full p-3 border border-outline-variant/30 focus:border-primary focus:outline-none bg-white rounded text-sm resize-none text-primary"
                  placeholder="How can we help you?"
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-primary text-on-primary py-3 px-6 font-label-upper text-label-upper tracking-wider hover:bg-zinc-800 transition-colors uppercase text-xs rounded font-semibold disabled:opacity-50"
              >
                {submitting ? 'Sending Message...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>

        {/* Map Section */}
        <div className="mt-16 w-full rounded-lg overflow-hidden border border-outline-variant/30 shadow-sm bg-surface-container-low p-2">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3684.6936306649727!2d88.35081977610738!3d22.55318623370003!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a02770e5b7211bf%3A0xc3b827725902b78c!2sPark%20St%2C%20Kolkata%2C%20West%20Bengal!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
            width="100%"
            height="400"
            style={{ border: 0 }}
            allowFullScreen={true}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="rounded"
            title="Vanity Jewels Store Location Map"
          />
        </div>
      </main>

      <StorefrontFooter />
    </div>
  );
}
