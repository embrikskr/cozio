import { APP_NAME } from "@/lib/constants";

export const metadata = { title: "Terms & Conditions" };

export default function TermsPage() {
  return (
    <>
      <h1 className="font-display text-4xl font-semibold tracking-tight text-ink-900">Terms &amp; Conditions</h1>
      <p className="text-sm text-ink-400">Last updated: 26 June 2026</p>

      <p>
        These Terms govern your use of {APP_NAME} (the &quot;Service&quot;), operated by Embrik Skrindo (operating as an individual) in Norway. By creating an account or using the Service, you agree to these
        Terms.
      </p>

      <h2>The Service</h2>
      <p>
        {APP_NAME} lets hosts create digital guidebooks for short-term rentals and share them with guests. We may add,
        change or remove features over time.
      </p>

      <h2>Accounts</h2>
      <p>
        You are responsible for your account, for keeping your password secure, and for all activity under your
        account. You must provide accurate information and be old enough to enter a contract in your jurisdiction.
      </p>

      <h2>Billing</h2>
      <ul>
        <li>
          There is no free trial. Creating an account is free, but a subscription is required before you can create
          your first property, and payment is taken when you subscribe.
        </li>
        <li>
          The Service is billed per property. You choose how many properties your plan covers, and the price per
          property falls as that number rises. Prices are shown in the app before you subscribe.
        </li>
        <li>
          Changing how many properties your plan covers takes effect immediately and is invoiced immediately: increases
          are charged pro rata for the rest of the period, decreases are credited. You cannot reduce your plan below the
          number of properties you currently have — delete properties first.
        </li>
        <li>
          Payments are processed by Stripe. Subscriptions renew automatically until cancelled. You can cancel anytime
          from the billing portal; access continues until the end of the paid period.
        </li>
        <li>Except where required by law, fees already paid are non-refundable.</li>
      </ul>

      <h2>Consumer right of withdrawal</h2>
      <p>
        If you are a consumer in the EU/EEA, you normally have a 14-day right to withdraw from a distance contract. By
        subscribing you ask us to begin providing the Service immediately, and you accept that the right of withdrawal
        is lost once the Service has been fully provided. If you withdraw within 14 days while the Service is still
        being provided, you pay only for the part already delivered. You can cancel at any time from the billing portal.
      </p>

      <h2>Your content</h2>
      <p>
        You retain ownership of the content you put into your guidebooks. You grant us a licence to host, process and
        display that content as needed to operate the Service. You are responsible for ensuring your content is lawful
        and that you have the rights to any images, embeds or guest data you add.
      </p>

      <h2>Guest data</h2>
      <p>
        Where you collect guest information (contacts, check-in details, messages), you are the data controller and
        must handle it lawfully, including providing any notices and obtaining any consents your local laws require. We
        process that data on your behalf as described in our <a href="/privacy">Privacy Policy</a>.
      </p>

      <h2>Acceptable use</h2>
      <p>
        Don&apos;t use the Service to break the law, infringe others&apos; rights, send spam, or attempt to disrupt or
        gain unauthorised access to the Service. We may suspend accounts that do.
      </p>

      <h2>Third-party services</h2>
      <p>
        The Service integrates with third parties (e.g. payment, AI, maps and PMS providers). Your use of those is
        subject to their terms, and we are not responsible for them.
      </p>

      <h2>Disclaimers &amp; liability</h2>
      <p>
        The Service is provided &quot;as is&quot; without warranties of any kind. Nothing in these Terms limits
        liability that cannot be limited by law (including liability for death or personal injury caused by negligence,
        or for fraud). Subject to that, and to the maximum extent permitted by law, our total liability arising from the
        Service is limited to the amount you paid us in the 12 months before the claim.
      </p>

      <h2>Termination</h2>
      <p>
        You may stop using the Service and delete your account at any time. We may suspend or terminate access for
        breach of these Terms. On termination, your right to use the Service ends.
      </p>

      <h2>Changes</h2>
      <p>
        We may update these Terms. Material changes will be communicated, and continued use after changes means you
        accept them.
      </p>

      <h2>Governing law &amp; disputes</h2>
      <p>
        These Terms are governed by the laws of Norway, without regard to its conflict-of-laws rules. Disputes are
        subject to the exclusive jurisdiction of the Norwegian courts — except that, if you are a consumer, mandatory
        law in your country of residence may give you the right to bring proceedings there.
      </p>

      <h2>Contact</h2>
      <p>
        Questions? Email <a href="mailto:emb.skrindo@gmail.com">emb.skrindo@gmail.com</a>.
      </p>
    </>
  );
}
