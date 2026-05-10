export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white px-4 py-16">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-10">Last updated: May 9, 2026</p>

        <div className="prose prose-slate max-w-none space-y-8 text-gray-700 leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">1. Who We Are</h2>
            <p>RoofLead (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) provides an AI-powered lead qualification platform for roofing companies. Our service is accessible at rooflead-mu.vercel.app. Questions about this policy can be directed to jaimetawil819@gmail.com.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">2. Information We Collect</h2>
            <p>We collect the following categories of information:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><strong>From homeowners (lead form submissions):</strong> name, phone number, property address, and service description.</li>
              <li><strong>From business owners (account registration):</strong> business name, email address, phone number, and billing information processed by Stripe.</li>
              <li><strong>SMS conversation data:</strong> messages exchanged between our AI and homeowners during the lead qualification process.</li>
              <li><strong>Usage data:</strong> pages visited, features used, and interaction logs for improving the service.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">3. How We Use Your Information</h2>
            <p>We use collected information to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Deliver the lead qualification service to roofing businesses</li>
              <li>Send automated SMS messages to homeowners who have opted in via a lead form</li>
              <li>Generate AI-powered lead summaries and quality scores for business owners</li>
              <li>Process subscription payments through Stripe</li>
              <li>Send service-related notifications to business owners</li>
              <li>Improve and maintain the platform</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">4. SMS Messaging</h2>
            <p>Homeowners who submit a lead form on a roofing company&apos;s website explicitly consent to receive SMS messages from that business via RoofLead. Consent language is displayed on every form prior to submission. We do not send unsolicited SMS messages. Homeowners may opt out at any time by replying STOP to any message.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">5. Information Sharing</h2>
            <p>We do not sell, rent, or share personal information with third parties for marketing purposes. We share data only as follows:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><strong>With the roofing business:</strong> lead information is shared with the business whose form the homeowner submitted</li>
              <li><strong>Service providers:</strong> Twilio (SMS delivery), Anthropic (AI processing), Supabase (database), Stripe (payments), and Vercel (hosting)</li>
              <li><strong>Legal requirements:</strong> when required by law or to protect our rights</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">6. Data Retention</h2>
            <p>Lead data and conversation histories are retained for as long as a business account is active. Business owners may delete lead records from their dashboard at any time. Account data is deleted within 30 days of account cancellation upon request.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">7. Security</h2>
            <p>We implement industry-standard security measures including encrypted data transmission (HTTPS), row-level security on our database, and secure API key management. No method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">8. Your Rights</h2>
            <p>You may request access to, correction of, or deletion of your personal data by contacting us at jaimetawil819@gmail.com. Homeowners may opt out of SMS messages at any time by replying STOP.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">9. Changes to This Policy</h2>
            <p>We may update this policy periodically. We will notify business account holders of material changes via email. Continued use of the service after changes constitutes acceptance.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">10. Contact</h2>
            <p>For privacy-related questions, contact us at jaimetawil819@gmail.com.</p>
          </section>

        </div>
      </div>
    </div>
  );
}
