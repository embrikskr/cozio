import { APP_NAME } from "@/lib/constants";

export const metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <>
      <h1 className="font-display text-4xl font-semibold tracking-tight text-ink-900">Privacy Policy</h1>
      <p className="text-sm text-ink-400">Last updated: 26 June 2026</p>

      <p>
        This Privacy Policy explains how {APP_NAME} (&quot;we&quot;, &quot;us&quot;) collects, uses and protects
        personal information when hosts use our service and when guests view a digital guidebook. We handle personal
        data in line with the EU/EEA General Data Protection Regulation (GDPR).
      </p>

      <h2>Who we are</h2>
      <p>
        {APP_NAME} is operated by Embrik Skrindo (operating as an individual), based in Norway. For the
        data below, {APP_NAME} is the <strong>data controller</strong> of host account data, and a{" "}
        <strong>data processor</strong> acting on a host&apos;s behalf for the guest information that host collects
        through their guidebook (the host is the controller of that guest data). Contact us at{" "}
        <a href="mailto:emb.skrindo@gmail.com">emb.skrindo@gmail.com</a>.
      </p>

      <h2>Information we collect</h2>
      <h3>From hosts (account holders)</h3>
      <ul>
        <li>Account details: name, email address and a hashed password.</li>
        <li>Property and guidebook content you create.</li>
        <li>Billing information, processed by our payment provider (Stripe). We never store full card numbers.</li>
        <li>Usage data such as logins and feature use, to operate and improve the service.</li>
      </ul>
      <h3>From guests (people who open a guidebook)</h3>
      <ul>
        <li>Anonymous view analytics (page views, which sections are opened). No account is required.</li>
        <li>
          Only if a host enables it and a guest chooses to submit it: contact details, online check-in details,
          messages, upsell requests and reviews.
        </li>
      </ul>

      <h2>Legal bases for processing</h2>
      <ul>
        <li>
          <strong>Performance of a contract</strong> — to provide the Service you sign up for.
        </li>
        <li>
          <strong>Legitimate interests</strong> — to secure, operate, analyse and improve the Service.
        </li>
        <li>
          <strong>Consent</strong> — where required, including optional guest data a host chooses to collect.
        </li>
        <li>
          <strong>Legal obligation</strong> — e.g. keeping billing and tax records.
        </li>
      </ul>

      <h2>How we use information</h2>
      <ul>
        <li>To provide, maintain and secure the service.</li>
        <li>To process payments and manage subscriptions.</li>
        <li>To power features the host has enabled (AI concierge, messaging, analytics).</li>
        <li>To respond to support requests and send essential service notices.</li>
      </ul>

      <h2>AI features</h2>
      <p>
        When a host enables the AI concierge or AI content tools, the relevant guidebook content and guest questions
        are sent to our AI provider (Anthropic) solely to generate a response. This data is not used to train models.
      </p>

      <h2>Cookies &amp; local storage</h2>
      <p>
        We use a single strictly-necessary cookie to keep signed-in hosts authenticated. Guidebooks use your
        browser&apos;s local storage to remember anonymous view sessions and prompts you have dismissed. We do not use
        advertising or cross-site tracking cookies.
      </p>

      <h2>Sub-processors &amp; sharing</h2>
      <p>We do not sell personal data. We share data only with the providers needed to run the Service:</p>
      <ul>
        <li>
          <strong>Supabase</strong> — database hosting (EU region).
        </li>
        <li>
          <strong>Vercel</strong> — application hosting and content delivery.
        </li>
        <li>
          <strong>Stripe</strong> — payment processing.
        </li>
        <li>
          <strong>Anthropic</strong> — AI responses for the concierge and content tools.
        </li>
      </ul>
      <p>
        Each is bound by appropriate data-protection terms. Guest information a host collects is shared only with that
        host.
      </p>

      <h2>International transfers</h2>
      <p>
        Some providers (e.g. Stripe, Anthropic) may process data outside the EU/EEA. Where they do, the transfer is
        protected by appropriate safeguards, such as the EU Standard Contractual Clauses or an adequacy decision.
      </p>

      <h2>Retention</h2>
      <p>
        We keep account and guidebook data for as long as the account is active. Hosts can delete a property (and its
        guest data) at any time, and can request deletion of their account by contacting us.
      </p>

      <h2>Your rights</h2>
      <p>
        Under the GDPR you may access, correct, export, restrict, object to or delete your personal data, and withdraw
        consent where processing relies on it. To exercise these rights, contact us at the address above. You also have
        the right to lodge a complaint with a supervisory authority — in Norway, the Norwegian Data Protection
        Authority (Datatilsynet). Guests should contact the host whose guidebook they used, and we will assist that
        host.
      </p>

      <h2>Security</h2>
      <p>
        Passwords are hashed, traffic is encrypted in transit, and access to data is restricted. No method of
        transmission or storage is completely secure, but we take reasonable measures to protect your information.
      </p>

      <h2>Changes</h2>
      <p>
        We may update this policy. We will post the new date above and, for material changes, notify hosts by email or
        in the app.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about this policy or your data? Email <a href="mailto:emb.skrindo@gmail.com">emb.skrindo@gmail.com</a>.
      </p>
    </>
  );
}
