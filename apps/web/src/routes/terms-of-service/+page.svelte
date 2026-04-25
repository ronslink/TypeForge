<script lang="ts">
  import TopNavBar from '$lib/components/TopNavBar.svelte';
  import Footer from '$lib/components/Footer.svelte';
</script>

<svelte:head>
  <title>Terms of Service — TypingScholar</title>
  <meta name="description" content="TypingScholar Terms of Service. Read our terms governing your use of the platform, subscription terms, and user responsibilities." />
</svelte:head>

<div class="min-h-screen bg-background text-on-background grid-texture flex flex-col">
  <TopNavBar />
  <main class="pt-20 flex-1">
    <section class="py-24 px-6 md:px-8 max-w-3xl mx-auto">

      <div class="mb-12">
        <h1 class="font-headline text-5xl tracking-tight mb-4">Terms of Service</h1>
        <p class="font-body text-on-surface-variant">Last updated: April 2026</p>
      </div>

      <div class="prose prose-invert max-w-none space-y-12 font-body text-on-surface">

        <div>
          <h2 class="font-headline text-2xl mb-4">1. Acceptance of Terms</h2>
          <p>By accessing or using TypingScholar (the "Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree, do not use the Service. These terms form a legally binding agreement between you and TypingScholar ("we", "us", "our").</p>
        </div>

        <div>
          <h2 class="font-headline text-2xl mb-4">2. Description of Service</h2>
          <p>TypingScholar is an adaptive online typing tutor that uses AI to personalise lessons and track typing performance across multiple script systems and languages. The Service includes web-based practice tools, lessons, analytics, and (for paid subscribers) additional features.</p>
        </div>

        <div>
          <h2 class="font-headline text-2xl mb-4">3. Account & Eligibility</h2>
          <p class="mb-4">You must create an account to access most features. You represent that:</p>
          <ul class="list-disc pl-6 space-y-2">
            <li>You are at least 13 years old (or the minimum age of digital consent in your jurisdiction)</li>
            <li>All information you provide is accurate and up to date</li>
            <li>You will not share your account credentials with anyone else</li>
            <li>You are responsible for all activity under your account</li>
          </ul>
          <p class="mt-4">School accounts for users under 13 require verified parental consent and are subject to our <a href="/privacy-policy" class="text-primary hover:underline">COPPA-compliant provisions</a>.</p>
        </div>

        <div>
          <h2 class="font-headline text-2xl mb-4">4. Subscription & Billing</h2>
          <ul class="list-disc pl-6 space-y-2">
            <li><strong>Free tier</strong> — limited access, no credit card required. We reserve the right to change free-tier limits with notice.</li>
            <li><strong>Power User ($9/mo)</strong> — billed monthly or annually ($79/year). Cancel anytime; access continues to end of billing period.</li>
            <li><strong>School ($6/seat/mo)</strong> — billed per active seat monthly. Seats can be added/removed; billing adjusts on next cycle.</li>
            <li>All paid plans auto-renew unless cancelled. Cancellation takes effect at period end.</li>
            <li>Refunds are at our discretion; contact support for billing disputes within 30 days.</li>
          </ul>
        </div>

        <div>
          <h2 class="font-headline text-2xl mb-4">5. Acceptable Use</h2>
          <p class="mb-4">You agree NOT to:</p>
          <ul class="list-disc pl-6 space-y-2">
            <li>Use the Service for any illegal purpose or in violation of any laws</li>
            <li>Attempt to gain unauthorised access to any part of the Service</li>
            <li>Reverse-engineer, decompile, or scrape the Service's content or algorithms</li>
            <li>Use automated tools to generate bulk accounts or distort usage statistics</li>
            <li>Harass, abuse, or harm other users</li>
            <li>Upload content containing malware, hate speech, or CSAM</li>
          </ul>
        </div>

        <div>
          <h2 class="font-headline text-2xl mb-4">6. Content & Intellectual Property</h2>
          <p>Your data belongs to you. You retain ownership of content you create. By using the Service you grant us a limited licence to process your data solely to deliver the Service. We do not claim any ownership over your typing performance data, lesson content, or personal settings.</p>
          <p class="mt-4">The Service design, UI, trademarks ("TypingScholar"), logos, and original content are our intellectual property. You may not copy, modify, or distribute them without written permission.</p>
        </div>

        <div>
          <h2 class="font-headline text-2xl mb-4">7. Third-Party Services</h2>
          <p>We use third-party services for authentication (Clerk), payment processing (Stripe), and hosting (Cloudflare/Vercel). Their terms apply to those respective services. We are not responsible for their performance or policies.</p>
        </div>

        <div>
          <h2 class="font-headline text-2xl mb-4">8. Disclaimer of Warranties</h2>
          <p>The Service is provided "as is" and "as available" without warranties of any kind, either express or implied, including but not limited to implied warranties of merchantability, fitness for a particular purpose, and non-infringement. We do not guarantee uninterrupted, error-free, or secure operation.</p>
        </div>

        <div>
          <h2 class="font-headline text-2xl mb-4">9. Limitation of Liability</h2>
          <p>To the maximum extent permitted by law, TypingScholar shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits, data, or goodwill, arising from your use of the Service — even if we have been advised of the possibility of such damages.</p>
          <p class="mt-4">Our total liability in any claim shall not exceed the amount you paid us in the 12 months preceding the claim.</p>
        </div>

        <div>
          <h2 class="font-headline text-2xl mb-4">10. Termination</h2>
          <p>We may suspend or terminate your account at any time for violation of these Terms or for any conduct we deem harmful. Free users may be terminated after prolonged inactivity. Upon termination, your right to use the Service ceases immediately. Data retention follows our Privacy Policy.</p>
        </div>

        <div>
          <h2 class="font-headline text-2xl mb-4">11. Governing Law</h2>
          <p>These Terms are governed by the laws of Germany, without regard to conflict of law provisions. Any disputes shall be subject to the exclusive jurisdiction of the courts of Berlin, Germany.</p>
        </div>

        <div>
          <h2 class="font-headline text-2xl mb-4">12. Changes to Terms</h2>
          <p>We may update these Terms at any time. Changes will be posted here with an updated "last updated" date. For material changes, we will notify you via email or in-app notice at least 30 days before they take effect. Continued use after changes constitutes acceptance.</p>
        </div>

        <div>
          <h2 class="font-headline text-2xl mb-4">13. Contact</h2>
          <p>
            <strong>TypingScholar</strong><br/>
            Email: <a href="mailto:legal@typingscholar.com" class="text-primary hover:underline">legal@typingscholar.com</a><br/>
            Kinetic Foundry, Berlin, Germany
          </p>
        </div>

      </div>
    </section>
  </main>
  <Footer />
</div>