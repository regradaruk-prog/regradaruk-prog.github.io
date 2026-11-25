# PlateLoft engineering handover

## Mission
Build a low-maintenance, automation-first UK specialist registration discovery marketplace. Free standard search, listings and alerts; no sales commission, stock or custody of purchase funds. Explore dealer-funded leads, subscriptions, clearly labelled promotions and affiliate advertising only after validation. Future specialist marketplaces (including art) are research options, not approved launches.

## Environments
This branch powers the protected Cloudflare Pages preview at plateloft-preview.pages.dev via sh build-preview.sh and preview-public. Main contains the public RegRadar holding page; do not restore or deploy it. The intended brand is PlateLoft.com, pending trademark clearance. Repository source is public despite preview access protection.

## Non-negotiable controls
No spending, provisioning, DNS changes, public launch, external outreach, real customer data, scraping, paid features, or legal commitments without owner approval. No secrets in repository or logs. Use synthetic data only. Work on separate branches and draft pull requests; do not merge into preview or main without approval. Verify data rights before imports. Employer independence approval, legal structure, privacy, consumer protection, online safety, platform reporting, insurance and sector-specific risk remain launch gates. No certificate references or document uploads. Do not present generated registrations as live inventory.

## First assignment
Audit the preview branch and existing track-a-plate and marketplace-foundation development branches. Inspect actual files before assuming functionality. Establish reproducible build and tests, including nonempty HTML, navigation active states on clean URLs, mobile layout, saved plates, search, calendar downloads and date handling, accessibility and return-to-top. Report actual test results and limitations. Preserve Plate Care as a first-class free service. Review security and deployment boundaries. Prepare a draft PR with focused fixes and a prioritised backlog.

## Subsequent priorities
Secure exact-registration alerts with verification, expiry and deletion; authorised dealer CSV ingestion with permission records and complete prices; self-service seller onboarding and moderation; reusable components only where justified; coherent accessible charcoal/yellow visual identity, original logo concepts pending approval. Keep monetisation optional and transparent. Avoid premature multi-market architecture.

## Reporting
For each assignment report changes, tests run/results, unresolved risks, costs, approval requirements and next steps. ChatGPT coordinates strategy and review; owner authorises spending and deployment. Do not assume access to prior chats or other agents.
