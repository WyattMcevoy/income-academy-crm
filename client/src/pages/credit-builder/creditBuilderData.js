export const STEPS = [
  {
    step: 1,
    name: 'Fundability Foundation',
    slug: 'foundation',
    icon: '🏗️',
    subItems: [
      { slug: 'business-address', name: 'Business Address' },
      { slug: 'business-entity', name: 'Business Entity' },
      { slug: 'foreign-filing', name: 'Foreign Filing' },
      { slug: 'ownership', name: 'Ownership' },
      { slug: 'ein', name: 'EIN' },
      { slug: 'business-phone', name: 'Business Phone' },
      { slug: 'website-email', name: 'Website and Email' },
      { slug: 'business-licenses', name: 'Business Licenses' },
      { slug: 'business-bank-account', name: 'Business Bank Account' },
      { slug: 'merchant-account', name: 'Merchant Account' },
      { slug: 'business-industry', name: 'Business Industry' },
      { slug: 'time-in-business', name: 'Time in Business' },
    ],
  },
  {
    step: 2,
    name: 'Bureau Profile Verification',
    slug: 'bureau-verification',
    icon: '🔍',
    subItems: [
      { slug: 'dnb-verification', name: 'D&B Verification' },
      { slug: 'experian-verification', name: 'Experian Verification' },
      { slug: 'equifax-verification', name: 'Equifax Verification' },
      { slug: 'addressing-inaccuracies', name: 'Addressing Inaccuracies' },
    ],
  },
  {
    step: 3,
    name: 'Start Building: Tier 1',
    slug: 'tier-1',
    icon: '🧱',
    subItems: [
      { slug: 'vendor-accounts-3', name: 'Get 3 Reporting Vendor Accounts' },
    ],
  },
  {
    step: 4,
    name: 'Monitor Business Reports',
    slug: 'monitor',
    icon: '📋',
    subItems: [
      { slug: 'bureau-insights', name: 'Bureau Insights' },
      { slug: 'lexisnexis', name: 'LexisNexis' },
      { slug: 'chex-systems', name: 'Chex Systems' },
      { slug: 'paydex-score', name: 'Paydex Score' },
    ],
  },
  {
    step: 5,
    name: 'Building Credit: Tier 2',
    slug: 'tier-2',
    icon: '📈',
    subItems: [
      { slug: 'vendor-accounts-6', name: 'Get 6 Reporting Vendor Accounts' },
    ],
  },
  {
    step: 6,
    name: 'Advanced Building: Tier 3',
    slug: 'tier-3',
    icon: '🚀',
    subItems: [
      { slug: 'vendor-accounts-9', name: 'Get 9 Reporting Vendor Accounts' },
    ],
  },
  {
    step: 7,
    name: 'Revolving Accounts: Tier 4',
    slug: 'tier-4',
    icon: '🔄',
    subItems: [
      { slug: 'vendor-accounts-12', name: 'Get 12 Reporting Vendor Accounts' },
    ],
  },
];

// Sub-page content — questions, descriptions, and options for each sub-item.
// Keys match step:sub_item slug. Will be populated fully from scraped data.
export const SUB_PAGE_CONTENT = {
  'business-address': {
    title: 'What type of business address do you have?',
    description: "Many lenders and creditors prefer businesses to have a specific address 'type' to qualify for certain funding programs. This means your Fundability score can increase based on the kind of business address you have. Select which type of address you use right now for your business.",
    options: [
      { value: 'Commercial Address', icon: '🏢' },
      { value: 'Home Address', icon: '🏠' },
      { value: 'PO Box', icon: '📮' },
      { value: 'Virtual Address', icon: '🌐' },
      { value: 'Registered Agent', icon: '📍' },
    ],
    followUp: {
      'Commercial Address': { type: 'form', title: 'ENTER YOUR COMMERCIAL BUSINESS ADDRESS.', description: 'A commercial address is ideal for fundability.', fields: ['businessName', 'addressLine1', 'addressLine2', 'city', 'state', 'zipCode'], status: 'positive' },
      'Home Address': { type: 'form', title: 'ENTER YOUR HOME BUSINESS ADDRESS.', description: "A home business address can be used without negatively impacting overall fundability, but only for industries that don't require a physical business location.", fields: ['businessName', 'addressLine1', 'addressLine2', 'city', 'state', 'zipCode'], status: 'positive' },
      'PO Box': { type: 'warning', title: 'PO BOX NOT RECOMMENDED', description: 'A PO Box is not considered a valid business address by most lenders. Consider upgrading to a commercial or virtual address.', status: 'negative', resource: { name: 'iPostal1', description: 'Virtual Business Address Service', url: 'https://ipostal1.com/virtual-business-address.php', commission: '~$10 if you subscribe', alternative: 'UPS Store mailbox at any UPS location is also valid; no commission paid to us.' } },
      'Virtual Address': { type: 'form', title: 'ENTER YOUR VIRTUAL BUSINESS ADDRESS.', description: 'A virtual address is a great alternative to a commercial address.', fields: ['businessName', 'addressLine1', 'addressLine2', 'city', 'state', 'zipCode'], status: 'positive' },
      'Registered Agent': { type: 'warning', title: 'REGISTERED AGENT ADDRESS', description: 'A registered agent address may not be ideal for fundability. Consider getting a separate business address.', status: 'negative', resource: { name: 'Northwest Registered Agent', description: 'Registered Agent + Business Address', url: 'https://www.northwestregisteredagent.com/', commission: '~$25 if you subscribe', alternative: 'Any state-licensed RA works; LegalZoom and your CPA can refer one with no commission to us.' } },
    },
  },
  'business-entity': {
    title: 'Select the business entity you have filed with the Secretary of State',
    description: "Each structure has different ownership, tax, and income liabilities. When in doubt, speak with a tax accountant to form an entity that's right for you. NOTE: A Sole Proprietorship is not a legal entity.",
    options: [
      { value: 'LLC', icon: '🏢' },
      { value: 'S or C Corp', icon: '🏛️' },
      { value: 'Partnership', icon: '🤝' },
      { value: 'Sole Proprietor', icon: '👤' },
    ],
    followUp: {
      'LLC': { type: 'success', title: 'GREAT CHOICE!', description: 'An LLC is one of the best entity types for fundability.', status: 'positive' },
      'S or C Corp': { type: 'success', title: 'GREAT CHOICE!', description: 'A Corporation is one of the best entity types for fundability.', status: 'positive' },
      'Partnership': { type: 'info', title: 'PARTNERSHIP', description: 'A partnership is an acceptable entity type but may have limitations with some lenders.', status: 'positive' },
      'Sole Proprietor': { type: 'warning', title: 'SOLE PROPRIETORSHIP NOT RECOMMENDED', description: 'A Sole Proprietorship is NOT a legal entity. You should form an LLC or Corporation to improve your fundability.', status: 'negative', resource: { name: 'Bizee (formerly IncFile)', description: 'Form an LLC or Corporation', url: 'https://bizee.com/', commission: '~$30 if you sign up', alternative: 'You can file directly with your state Secretary of State for the state filing fee only (typically $50–$300). No middleman needed.' } },
    },
  },
  'foreign-filing': {
    title: 'Have you foreign filed?',
    description: 'Your business address is located in a different state than your business entity. Underwriters will check to see if you have foreign filed in the state your business is physically located.',
    options: [
      { value: 'Yes', icon: '✅' },
      { value: 'No', icon: '❌' },
    ],
    followUp: {
      'Yes': { type: 'success', status: 'positive' },
      'No': { type: 'warning', title: 'FOREIGN FILING NEEDED', description: 'If your business operates in a different state than where it was formed, you need to foreign file.', status: 'negative' },
    },
  },
  'ownership': {
    title: 'Please verify your ownership information with the Secretary of State.',
    description: 'Is the correct ownership information listed on your filing with the Secretary of State.',
    options: [
      { value: 'Yes', icon: '✅' },
      { value: 'No', icon: '❌' },
    ],
    followUp: {
      'Yes': { type: 'success', status: 'positive' },
      'No': { type: 'warning', title: 'OWNERSHIP VERIFICATION NEEDED', description: 'Your ownership information should match what is filed with the Secretary of State.', status: 'negative' },
    },
  },
  'ein': {
    title: 'Does your business have an EIN?',
    description: 'An EIN (Employer Identification Number) is a nine-digit number assigned to business entities operating in the U.S. An EIN (or Tax ID) is required to obtain business financing.',
    options: [
      { value: 'Yes', icon: '✅' },
      { value: 'No', icon: '❌' },
    ],
    followUp: {
      'Yes': { type: 'success', status: 'positive' },
      'No': { type: 'warning', title: 'EIN REQUIRED', description: 'An EIN is required to obtain business financing. You can apply for one for free at IRS.gov.', status: 'negative', resource: { name: 'IRS EIN Application', description: 'Apply for an EIN online — completely free', url: 'https://www.irs.gov/businesses/small-businesses-self-employed/get-an-employer-identification-number', commission: 'No commission — direct .gov link.', alternative: 'Anyone charging for an EIN is reselling a free government service. Use this IRS link directly.' } },
    },
  },
  'business-phone': {
    title: 'Do you have a business phone number?',
    description: "Home numbers and personal cell phone numbers decrease your Fundability because the business appears less credible. Your business landline or VOIP(voice over internet protocol) must be in your business's name.",
    options: [
      { value: 'Yes', icon: '✅' },
      { value: 'No', icon: '❌' },
    ],
    followUp: {
      'Yes': { type: 'form', title: 'ENTER YOUR BUSINESS PHONE', fields: ['businessPhone'], status: 'positive' },
      'No': { type: 'warning', title: 'BUSINESS PHONE NEEDED', description: 'Lenders and creditors might not approve you for business financing if you are using a home phone number or personal cell number for your business.', status: 'negative', resource: { name: 'Phone.com', description: 'Business phone service - Communicate Better®', url: 'https://www.phone.com/', commission: '~$15 if you subscribe', alternative: 'Google Voice (free) or OpenPhone work too. Make sure the number is listed in 411 directory assistance for full credit.' }, actionLabel: 'I Have A Business Phone' },
    },
  },
  'website-email': {
    title: 'Do you have a professional website and email?',
    description: "Lenders and creditors search online to confirm the credibility of your business. A professional looking website and email can increase your fundability but aren't required to get financing.",
    options: [
      { value: 'Yes', icon: '✅' },
      { value: 'No', icon: '❌' },
    ],
    followUp: {
      'Yes': { type: 'form', title: 'ENTER YOUR WEBSITE AND EMAIL', fields: ['website', 'businessEmail'], status: 'positive' },
      'No': { type: 'info', title: 'WEBSITE AND EMAIL NOT REQUIRED', description: "Selecting No will not prevent you from accessing financing, but a professional website and email increase credibility.", status: 'neutral' },
    },
  },
  'business-licenses': {
    title: 'Does your business require a license?',
    description: 'Some industries require specific licenses to operate legally. Having the proper licenses shows lenders your business is legitimate.',
    options: [
      { value: 'Yes License(s) required', icon: '📋' },
      { value: 'No license required', icon: '✅' },
    ],
    followUp: {
      'Yes License(s) required': { type: 'form', title: 'BUSINESS LICENSE DETAILS', fields: ['licenseType', 'licenseNumber'], status: 'positive' },
      'No license required': { type: 'success', status: 'positive' },
    },
  },
  'business-bank-account': {
    title: 'Do you have a business bank account?',
    description: 'A dedicated business bank account is essential for separating personal and business finances. Lenders require this for funding approval.',
    options: [
      { value: 'Yes', icon: '✅' },
      { value: 'No', icon: '❌' },
    ],
    followUp: {
      'Yes': { type: 'form', title: 'BUSINESS BANK ACCOUNT', fields: ['bankName'], status: 'positive' },
      'No': { type: 'warning', title: 'BUSINESS BANK ACCOUNT NEEDED', description: 'A business bank account is required for most business financing.', status: 'negative', resource: { name: 'Relay Financial', description: 'Free business banking with smart budgeting', url: 'https://relayfi.com/', commission: 'No commission paid to us — included because it\'s free.', alternative: 'Mercury, Bluevine, or any local bank also work. Avoid Chase/BofA at first — they pull personal credit aggressively.' } },
    },
  },
  'merchant-account': {
    title: 'Does your business have a merchant account?',
    description: 'A merchant account allows you to accept credit card payments and shows lenders you have established revenue channels.',
    options: [
      { value: 'Yes', icon: '✅' },
      { value: 'No', icon: '❌' },
    ],
    followUp: {
      'Yes': { type: 'success', status: 'positive' },
      'No': { type: 'info', title: 'MERCHANT ACCOUNT', description: 'A merchant account is not required but can improve your fundability.', status: 'neutral' },
    },
  },
  'business-industry': {
    title: "Has your business filed last year's taxes?",
    description: 'Filing taxes demonstrates business legitimacy and financial history to lenders.',
    options: [
      { value: 'Yes', icon: '✅' },
      { value: 'No', icon: '❌' },
    ],
    followUp: {
      'Yes': { type: 'success', status: 'positive' },
      'No': { type: 'warning', title: 'TAX FILING RECOMMENDED', description: 'Filing business taxes is important for establishing credibility with lenders.', status: 'negative' },
    },
  },
  'time-in-business': {
    title: 'When was your entity formed?',
    description: 'Time in business is a key factor in fundability. You need to have your business entity set up first.',
    requiresPrior: 'business-entity',
    options: [
      { value: 'Go to Business Entity', icon: '➡️', navigateTo: 'business-entity' },
    ],
    followUp: {},
  },
  // Step 2
  'dnb-verification': {
    title: 'Do you have a DUNS number?',
    description: 'A DUNS number is a unique nine-digit identifier assigned by Dun & Bradstreet to your business. It is required for building business credit.',
    stepSection: 'Bureau Profile Verification',
    options: [
      { value: 'I Have A DUNS Number', icon: '✅' },
      { value: 'Search for a DUNS Number Now', icon: '🔍' },
    ],
    followUp: {
      'I Have A DUNS Number': { type: 'form', title: 'VERIFY YOUR D&B LISTING', description: 'Enter your DUNS number to verify your business listing.', fields: ['dunsNumber'], status: 'positive' },
      'Search for a DUNS Number Now': { type: 'info', title: 'SEARCH FOR YOUR DUNS NUMBER', description: 'You can search for or apply for a DUNS number through D&B.', status: 'neutral', resource: { name: 'Dun & Bradstreet', description: 'Search or apply for a DUNS number', url: 'https://www.dnb.com/en-us/smb/duns/get-a-duns.html' } },
    },
  },
  'experian-verification': {
    title: 'Locate your business listing',
    description: 'Find and verify your business listing with Experian to ensure your business credit profile is accurate.',
    stepSection: 'Bureau Profile Verification',
    options: [
      { value: 'Find My Listing', icon: '🔍' },
    ],
    followUp: {
      'Find My Listing': { type: 'info', title: 'SEARCH FOR YOUR EXPERIAN LISTING', description: 'Search for your business to verify your Experian profile. If you don\'t see your business, it may need to be added.', status: 'neutral', resource: { name: 'Experian Business', description: 'Search for your business credit listing', url: 'https://www.experian.com/small-business/' } },
    },
  },
  'equifax-verification': {
    title: 'Do you have an Equifax Report?',
    description: 'Verify whether your business has an existing Equifax business credit report.',
    stepSection: 'Bureau Profile Verification',
    options: [
      { value: 'I Have An Equifax Report', icon: '✅' },
      { value: 'I Do Not Have An Equifax Report', icon: '❌' },
    ],
    followUp: {
      'I Have An Equifax Report': { type: 'form', title: 'VERIFY YOUR EQUIFAX LISTING', description: 'Verify your business information with Equifax.', fields: [], status: 'positive' },
      'I Do Not Have An Equifax Report': { type: 'warning', title: 'EQUIFAX REPORT NEEDED', description: 'Building vendor accounts that report to Equifax will help establish your Equifax business credit profile.', status: 'negative', resource: { name: 'Equifax Business', description: 'Check your business credit report', url: 'https://www.equifax.com/business/product/business-credit-reports-small-business/' } },
    },
  },
  'addressing-inaccuracies': {
    title: 'Are there any derogatory items or errors on your reports that should not be there?',
    description: 'Do you have any late payments, missed payments, collection accounts, bankruptcies, charge-offs, liens, judgments, etc. that are incorrect and need to be addressed?',
    stepSection: 'Bureau Profile Verification',
    options: [
      { value: 'Yes', icon: '⚠️' },
      { value: 'No', icon: '✅' },
    ],
    followUp: {
      'Yes': { type: 'warning', title: 'DISPUTE INACCURACIES', description: 'You should dispute any inaccurate derogatory items on your business credit reports. This can significantly improve your fundability.', status: 'negative', resource: { name: 'DisputeBee', description: 'DIY credit dispute software', url: 'https://disputebee.com/' } },
      'No': { type: 'success', title: 'REPORTS LOOK GOOD!', description: 'Great — no inaccuracies to address. You can proceed to the next step.', status: 'positive' },
    },
  },
  // Step 3
  'vendor-accounts-3': {
    title: 'Get 3 Reporting Vendor Accounts',
    description: 'Apply for vendor accounts that report to business credit bureaus. Start with 3 accounts to establish your initial credit profile.',
    stepSection: 'Start Building: Tier 1',
    options: [],
    isVendorStep: true,
    targetCount: 3,
  },
  // Step 4
  'bureau-insights': {
    title: 'Bureau Insights Requires Experian Verification',
    description: 'Bureau Insights uses Experian data to generate your report. Click the button below to go to the Experian Step to find your business and verify it is correct.',
    stepSection: 'Monitor Business Reports',
    options: [
      { value: 'Re-Verify Experian Address', icon: '🔍', navigateTo: 'experian-verification' },
    ],
    followUp: {},
  },
  'lexisnexis': {
    title: 'Do you have your LexisNexis report?',
    description: 'Many underwriters look at your LexisNexis report to inform their decision. Before applying, know how to pull your LexisNexis report and perform a thorough assessment to best increase your chances of funding.',
    stepSection: 'Monitor Business Reports',
    options: [
      { value: 'Yes', icon: '✅' },
      { value: 'No', icon: '❌' },
    ],
    followUp: {
      'Yes': { type: 'success', title: 'LEXISNEXIS REPORT ON FILE', description: 'Great — having your LexisNexis report reviewed puts you in a stronger position when applying for funding.', status: 'positive' },
      'No': {
        type: 'resource-page',
        title: 'GET YOUR LEXISNEXIS REPORT',
        description: 'For the best business credit matches and lending recommendations, select a resource below to get your LexisNexis report.',
        helpText: 'Click below to learn more and get your LexisNexis report.',
        actionLabel: 'I Have My LexisNexis Report',
        status: 'negative',
        resource: { name: 'LexisNexis', description: 'Request your personal consumer report', url: 'https://consumer.risk.lexisnexis.com/request' },
      },
    },
  },
  'chex-systems': {
    title: 'Do you have your ChexSystems report?',
    description: 'Many underwriters look at your ChexSystems report to inform their decision. Before applying, know how to pull your ChexSystems report and perform a thorough assessment to best increase your chances of funding.',
    stepSection: 'Monitor Business Reports',
    options: [
      { value: 'Yes', icon: '✅' },
      { value: 'No', icon: '❌' },
    ],
    followUp: {
      'Yes': { type: 'success', title: 'CHEXSYSTEMS REPORT ON FILE', description: 'Great — having your ChexSystems report reviewed helps ensure there are no issues that could affect your funding applications.', status: 'positive' },
      'No': {
        type: 'resource-page',
        title: 'GET YOUR CHEXSYSTEMS REPORT',
        description: 'For the best business credit matches and lending recommendations, select a resource below to get your ChexSystems report.',
        helpText: 'Click below to learn more and get your ChexSystems report.',
        actionLabel: 'I Have My ChexSystems Report',
        status: 'negative',
        resource: { name: 'ChexSystems', description: 'Request your consumer disclosure report', url: 'https://www.chexsystems.com/request-reports/consumer-disclosure' },
      },
    },
  },
  'paydex-score': {
    title: 'Improve your Paydex score',
    description: 'Business Credit Bureaus have their own fees for monitoring your credit with them. A simpler and less costly way to view your business credit data is through a service that seamlessly integrates, granting you the ability to access lender reports and review business credit information.',
    stepSection: 'Monitor Business Reports',
    options: [
      { value: 'Monitor My Score', icon: '📊' },
    ],
    followUp: {
      'Monitor My Score': { type: 'info', title: 'MONITOR YOUR PAYDEX SCORE', description: 'Nav provides free access to your D&B and Experian business credit scores, plus personalized funding recommendations.', status: 'neutral', resource: { name: 'Nav', description: 'Free business credit score monitoring', url: 'https://www.nav.com/business-credit-scores/' } },
    },
  },
  // Step 5
  'vendor-accounts-6': {
    title: 'Get 6 Reporting Vendor Accounts',
    description: 'Continue building credit with 6 total reporting vendor accounts across D&B, Equifax, and Experian.',
    stepSection: 'Building Credit: Tier 2',
    options: [],
    isVendorStep: true,
    targetCount: 6,
  },
  // Step 6
  'vendor-accounts-9': {
    title: 'Get 9 Reporting Vendor Accounts',
    description: 'Advanced tier: reach 9 total reporting vendor accounts to strengthen your business credit profile.',
    stepSection: 'Advanced Building: Tier 3',
    options: [],
    isVendorStep: true,
    targetCount: 9,
  },
  // Step 7
  'vendor-accounts-12': {
    title: 'Get 12 Reporting Vendor Accounts',
    description: 'Final tier: reach 12 total reporting vendor accounts to qualify for revolving credit and higher funding amounts.',
    stepSection: 'Revolving Accounts: Tier 4',
    options: [],
    isVendorStep: true,
    targetCount: 12,
  },
};

export const VENDOR_CATALOG = {
  1: [
    { name: 'Uline', category: 'Shipping & Packaging Supplies', bureaus: ['D&B', 'Experian', 'Equifax'], terms: 'Net-30', url: 'https://www.uline.com/' },
    { name: 'Crown Office Supplies', category: 'Office Supplies', bureaus: ['D&B', 'Experian', 'Equifax'], terms: 'Net-30, $800–$5K', url: 'https://www.crownofficesupplies.com/' },
    { name: 'Grainger', category: 'Industrial & Hardware Supplies', bureaus: ['D&B'], terms: 'Net-30', url: 'https://www.grainger.com/' },
    { name: 'Creative Analytics', category: 'Marketing & Promotional', bureaus: ['D&B', 'Equifax'], terms: 'Net-30, up to $12K', url: 'https://www.creativeanalytics.net/' },
    { name: 'Wise Business Plans', category: 'Business Services', bureaus: ['D&B', 'Equifax'], terms: 'Net-30', url: 'https://wisebusinessplans.com/' },
    { name: 'Summa Office Supplies', category: 'Office Supplies', bureaus: ['D&B', 'Experian'], terms: 'Net-30, $500–$3K', url: 'https://www.summaofficesupplies.com/' },
    { name: 'Strategic Network Solutions', category: 'IT Supplies & Accessories', bureaus: ['Equifax'], terms: 'Net-30, ~$1K', url: 'https://www.stratnsolutions.com/' },
    { name: 'Shirtsy', category: 'Custom Apparel & Promo', bureaus: ['D&B', 'Equifax'], terms: 'Net-30, ~$1K', url: 'https://www.shirtsy.com/' },
    { name: 'eCredable Lift', category: 'Business utility reporting', bureaus: ['D&B', 'Experian', 'Equifax'], terms: '$19.95/mo, reports existing bills', url: 'https://www.ecredable.com/' },
    { name: 'JJ Gold International', category: 'Wholesale apparel & accessories', bureaus: ['Equifax'], terms: 'Net-30, $1K starter', url: 'https://www.jjgoldinternational.com/' },
    { name: 'Quill Office Supplies', category: 'Office supplies', bureaus: ['D&B', 'Experian', 'Equifax'], terms: 'Net-30, prepaid first order', url: 'https://www.quill.com/' },
  ],
  2: [
    { name: 'Home Depot Pro', category: 'Building & Construction', bureaus: ['D&B', 'Experian', 'Equifax'], terms: 'Revolving', url: 'https://www.homedepot.com/c/Pro' },
    { name: "Lowe's Business", category: 'Building & Construction', bureaus: ['D&B', 'Experian'], terms: 'Revolving', url: 'https://www.lowes.com/l/shop/lowes-business-credit' },
    { name: 'Office Depot', category: 'Office Supplies', bureaus: ['D&B', 'Experian', 'Equifax'], terms: 'Revolving', url: 'https://www.officedepot.com/' },
    { name: 'Staples Business Advantage', category: 'Office Supplies', bureaus: ['D&B', 'Experian'], terms: 'Revolving', url: 'https://www.staples.com/sbd/cre/marketing/business-account/' },
    { name: 'Amazon Business Line of Credit', category: 'General Merchandise', bureaus: ['D&B', 'Experian'], terms: 'Revolving', url: 'https://www.amazon.com/gp/cobrandcard/marketing.html?pr=bb' },
    { name: 'Dell Business Credit', category: 'Technology & Computers', bureaus: ['D&B', 'Experian', 'Equifax'], terms: 'Revolving', url: 'https://www.dell.com/en-us/lp/dell-business-credit' },
    { name: 'Newegg Business', category: 'Electronics & IT', bureaus: ['D&B'], terms: 'Net-30', url: 'https://www.neweggbusiness.com/' },
    { name: 'Best Buy Business', category: 'Electronics & retail', bureaus: ['D&B', 'Equifax'], terms: 'Revolving', url: 'https://www.bestbuy.com/site/business/best-buy-for-business/pcmcat164800050037.c' },
    { name: 'Costco Business', category: 'Wholesale retail', bureaus: ['Equifax'], terms: 'Membership + revolving', url: 'https://www.costcobusinessdelivery.com/' },
  ],
  3: [
    { name: 'Shell Fleet Card', category: 'Fuel & Fleet', bureaus: ['D&B', 'Experian', 'Equifax'], terms: 'Revolving', url: 'https://www.shell.us/business-customers/shell-fleet-solutions.html' },
    { name: 'Fuelman', category: 'Fuel & Fleet', bureaus: ['D&B', 'Experian', 'Equifax'], terms: 'Revolving', url: 'https://www.fuelman.com/' },
    { name: 'BP Business Solutions', category: 'Fuel', bureaus: ['D&B', 'Experian'], terms: 'Revolving', url: 'https://www.bpbusinesssolutions.com/' },
    { name: 'WEX Fleet Card', category: 'Fleet Management', bureaus: ['D&B', 'Experian'], terms: 'Revolving', url: 'https://www.wexinc.com/' },
    { name: 'ExxonMobil Business', category: 'Fuel', bureaus: ['D&B'], terms: 'Revolving', url: 'https://www.exxon.com/en/business-fuel-card' },
    { name: 'Chevron/Texaco Business', category: 'Fuel', bureaus: ['D&B', 'Experian'], terms: 'Revolving', url: 'https://www.chevronwithtechron.com/station/business-card' },
    { name: 'Sunoco / Speedway Business', category: 'Fuel & convenience', bureaus: ['D&B', 'Equifax'], terms: 'Revolving', url: 'https://business.sunoco.com/' },
  ],
  4: [
    { name: 'Brex', category: 'Corporate Visa/MC (No PG)', bureaus: ['D&B', 'Experian'], terms: 'Revolving, requires $50K+ in bank', url: 'https://www.brex.com/' },
    { name: 'Ramp', category: 'Corporate Visa (No PG)', bureaus: ['D&B', 'Experian'], terms: 'Revolving, requires $25K+ in bank', url: 'https://ramp.com/' },
    { name: 'Divvy (BILL)', category: 'Corporate Visa (No PG)', bureaus: ['D&B', 'Experian'], terms: 'Revolving', url: 'https://www.divvy.co/' },
    { name: "Sam's Club Business MC", category: 'Retail Revolving', bureaus: ['D&B', 'Experian'], terms: 'Revolving', url: 'https://www.samsclub.com/content/credit' },
    { name: 'Costco Business Visa', category: 'Retail Revolving', bureaus: ['D&B', 'Experian'], terms: 'Revolving', url: 'https://www.citi.com/credit-cards/citi-costco-anywhere-visa-business-credit-card' },
    { name: 'BHG Money', category: 'Working-capital loan (PG required)', bureaus: ['D&B', 'Experian', 'Equifax'], terms: 'Term loan, $20K–$250K', url: 'https://bhgmoney.com/' },
  ],
};
