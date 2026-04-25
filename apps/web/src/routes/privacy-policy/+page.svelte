<script lang="ts">
  import TopNavBar from '$lib/components/TopNavBar.svelte';
  import Footer from '$lib/components/Footer.svelte';
</script>

<svelte:head>
  <title>Privacy Policy — TypingScholar</title>
  <meta name="description" content="TypingScholar's privacy policy explains what data we collect, how we use it, your rights, and how we protect your information." />
</svelte:head>

<div class="min-h-screen bg-background text-on-background grid-texture flex flex-col">
  <TopNavBar />
  <main class="pt-20 flex-1">
    <section class="py-24 px-6 md:px-8 max-w-3xl mx-auto">

      <div class="mb-12">
        <h1 class="font-headline text-5xl tracking-tight mb-4">Privacy Policy</h1>
        <p class="font-body text-on-surface-variant">Last updated: April 2025</p>
      </div>

      <div class="prose prose-invert max-w-none space-y-12 font-body text-on-surface">

        <div>
          <h2 class="font-headline text-2xl mb-4">1. Information we collect</h2>
          <p class="mb-4">We collect information you provide directly:</p>
          <ul class="list-disc pl-6 space-y-2">
            <li><strong>Account data</strong> — email address, name, and authentication via Clerk (our third-party auth provider).</li>
            <li><strong>Typing performance data</strong> — WPM, accuracy, session timestamps, and lesson completion records.</li>
            <li><strong>Preferences</strong> — selected language, locale settings, and UI customization.</li>
            <li><strong>Communications</strong> — any messages or feedback you send us.</li>
          </ul>
          <p class="mt-4">We do not collect keystroke-level data beyond aggregated WPM and accuracy metrics.</p>
        </div>

        <div>
          <h2 class="font-headline text-2xl mb-4">2. How we use your information</h2>
          <ul class="list-disc pl-6 space-y-2">
            <li>To deliver personalised adaptive lessons based on your detected weaknesses</li>
            <li>To track your progress and display analytics dashboards</li>
            <li>To authenticate you and manage your account</li>
            <li>To send you service-related notifications (account, billing, privacy updates)</li>
            <li>To improve our product through anonymised aggregated analytics</li>
          </ul>
        </div>

        <div>
          <h2 class="font-headline text-2xl mb-4">3. Data sharing</h2>
          <p class="mb-4">We <strong>never</strong> sell your personal data. We share data only in these cases:</p>
          <ul class="list-disc pl-6 space-y-2">
            <li><strong>Auth provider</strong> — Clerk handles account management. Their privacy policy applies to auth data.</li>
            <li><strong>Billing</strong> — Stripe processes payments. We never store card details.</li>
            <li><strong>Legal obligations</strong> — if required by law or to prevent fraud/harm.</li>
            <li><strong>Service providers</strong> — hosting (Cloudflare/Vercel) and analytics — bound by strict data processing agreements.</li>
          </ul>
        </div>

        <div>
          <h2 class="font-headline text-2xl mb-4">4. Data retention</h2>
          <p>Account data is retained until you delete your account or request deletion. Typing performance data older than 24 months is purged from our analytics pipeline. Deletion requests are processed within 30 days.</p>
        </div>

        <div>
          <h2 class="font-headline text-2xl mb-4">5. Your rights</h2>
          <p class="mb-4">Depending on your jurisdiction, you may have the right to:</p>
          <ul class="list-disc pl-6 space-y-2">
            <li>Access your personal data</li>
            <li>Correct inaccurate data</li>
            <li>Delete your account and all associated data</li>
            <li>Export your data in a machine-readable format (CSV)</li>
            <li>Object to certain processing</li>
            <li>Restrict processing in specific circumstances</li>
          </ul>
          <p class="mt-4">To exercise any rights, email <strong>privacy@typingscholar.com</strong> with your request.</p>
        </div>

        <div>
          <h2 class="font-headline text-2xl mb-4">6. Cookies</h2>
          <p class="mb-4">We use cookies for:</p>
          <ul class="list-disc pl-6 space-y-2">
            <li><strong>Authentication</strong> — session management via Clerk (essential)</li>
            <li><strong>Preferences</strong> — locale and UI settings (functional)</li>
            <li><strong>Analytics</strong> — anonymised usage stats (opt-in, never used for advertising)</li>
          </ul>
          <p class="mt-4">You can manage or disable cookies via your browser settings.</p>
        </div>

        <div>
          <h2 class="font-headline text-2xl mb-4">7. Children's privacy</h2>
          <p class="mb-4">TypingScholar supports school accounts with COPPA-compliant features for users under 13. For school accounts:</p>
          <ul class="list-disc pl-6 space-y-2">
            <li>Parental consent is collected by the school before student accounts are created</li>
            <li>Data collection is limited to educational purposes only</li>
            <li>Parents can review, request deletion, or revoke consent at any time via privacy@typingscholar.com</li>
          </ul>
        </div>

        <div>
          <h2 class="font-headline text-2xl mb-4">8. Security</h2>
          <p>All data is encrypted in transit (TLS 1.2+) and at rest. We run regular security audits, use Cloudflare's DDoS protection, and follow OWASP guidelines. In the event of a data breach, affected users will be notified within 72 hours.</p>
        </div>

        <div>
          <h2 class="font-headline text-2xl mb-4">9. International transfers</h2>
          <p>Data may be processed on servers in the EU and US. For users in regions with specific data protection requirements (GDPR, CCPA), we apply appropriate safeguards including Standard Contractual Clauses.</p>
        </div>

        <div>
          <h2 class="font-headline text-2xl mb-4">10. Changes to this policy</h2>
          <p>If we change this policy, we will post the updated version here and update the "last updated" date. For significant changes, we will notify you via email or in-app notice at least 30 days before they take effect.</p>
        </div>

        <div>
          <h2 class="font-headline text-2xl mb-4">11. Contact</h2>
          <p>
            <strong>TypingScholar</strong><br/>
            Email: <a href="mailto:privacy@typingscholar.com" class="text-primary hover:underline">privacy@typingscholar.com</a><br/>
            Address: Kinetic Foundry, Berlin, Germany
          </p>
        </div>

      </div>
    </section>
  </main>
  <Footer />
</div>