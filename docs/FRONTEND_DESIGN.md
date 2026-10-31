# Frontend design

The public site adopts bold commercial typography, color blocking and prominent calls to action inspired by the selected Feastables reference, while creating an original textile brand. No Feastables asset, logo, text or source code is included.

Tokens: navy #101B2B, yellow #F3B73F, coral #E85D4A, paper #F4F3EF, white #FFFFFF and slate #77808D. Space Grotesk headings and Inter body fonts are bundled locally through Fontsource. Rounded panels, consistent field heights, visible focus states, clear evidence colors and responsive tables form the reusable UI system.

The signature hero frames original generated woven fabric imagery, with distinct sewing-line and finishing-table images for the product modules with an inspection marker. This is illustrative brand art, explicitly distinguished from factory evidence. Asset and generation prompt are documented in `frontend/public/images/ASSET_PROVENANCE.md`.

Public routes: `/`, `/products`, three `/products/{module}` pages, `/technology`, `/about`, `/contact`, `/privacy`, `/terms`, `/login`.

Operational routes: `/app`, `/app/fabricguard`, `/app/visual-inspection`, `/app/linewatch`, `/app/orderrescue`, `/app/reports`, `/app/approvals`, `/app/audit`, `/app/settings`.

The workspace has navy navigation and a light operational canvas. Yellow identifies primary actions, coral identifies incidents and blocks, and green identifies recorded verification/approval states. An AI recommendation is displayed separately from approval status. Metrics and charts read real API data.

Framer Motion is limited to a hero entrance and respects reduced motion. Sticky navigation, mobile menus, hover/focus states, loading/empty/error states, success notifications, typed forms and a confirmation dialog support real actions. Public demo requests are stored through the backend and disclose that no email was sent.

Screenshots and browser validation are under `output/playwright/`; view the public and workspace desktop/mobile files. Automated responsive checks cover 1440, 1280, 768 and 390 pixels. Production accessibility and assistive-technology audits remain advisable before commercial deployment.
