#!/usr/bin/env node
/**
 * Income Academy — Batch HeyGen Video Generator
 * Generates all 36 module intro videos (4 courses × 9 modules each)
 * featuring "Linda" (Saffron avatar, Avatar IV).
 *
 * Usage:
 *   node server/src/tools/generate-all-heygen-videos.js                   # queue all 36
 *   node server/src/tools/generate-all-heygen-videos.js --course=ai        # 9 AI videos
 *   node server/src/tools/generate-all-heygen-videos.js --course=affiliate # 9 Affiliate videos
 *   node server/src/tools/generate-all-heygen-videos.js --course=estate    # 9 Estate Sale videos
 *   node server/src/tools/generate-all-heygen-videos.js --course=bookkeeping # 9 BK videos
 *   node server/src/tools/generate-all-heygen-videos.js --module=ai-0      # single module
 *   node server/src/tools/generate-all-heygen-videos.js --dry-run          # preview only
 *   node server/src/tools/generate-all-heygen-videos.js --test             # generate 5-word test
 *
 * Environment: HEYGEN_API_KEY (auto-loaded from server/.env)
 *
 * Output: marketing/videos/heygen/<videoId>.mp4 (auto-downloaded when complete)
 *         marketing/videos/heygen/manifest.json (tracks all jobs)
 *
 * Cost estimate: ~$0.03-0.07 per video at standard quality. Full set ≈ $1.08-2.52
 *
 * Avatar config:
 *   Avatar:  Saffron — sitting at table, glasses, blazer, grey-silver hair (Avatar IV)
 *   Look ID: 7f2bb6c600f34e3699e58d3e8f4a2905  (sitting-at-table pose, confirmed working)
 *   Voice:   Saffron voice — voice_id: 0258bbc2cd8648cfa357adfb833f6d7b
 *   Name used on screen/in content: Linda
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '../../../');
const OUT_DIR = path.join(REPO_ROOT, 'marketing/videos/heygen');
const MANIFEST = path.join(OUT_DIR, 'manifest.json');

// ─── Auto-load .env ────────────────────────────────────────────────────────
(function loadDotEnv() {
  if (process.env.HEYGEN_API_KEY) return;
  const envPath = path.join(REPO_ROOT, 'server', '.env');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const eq = t.indexOf('=');
    if (eq < 0) continue;
    const k = t.slice(0, eq).trim();
    const v = t.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
    if (!process.env[k]) process.env[k] = v;
  }
})();

// ─── Config ────────────────────────────────────────────────────────────────
const API_KEY = process.env.HEYGEN_API_KEY;
const AVATAR_ID = '7f2bb6c600f34e3699e58d3e8f4a2905'; // Saffron sitting-at-table (confirmed via UI then API)
const VOICE_ID  = '0258bbc2cd8648cfa357adfb833f6d7b'; // Saffron voice (fetched from /v2/voices)
const DIMENSION = { width: 1280, height: 720 };

const DRY_RUN = process.argv.includes('--dry-run');
const TEST    = process.argv.includes('--test');
const COURSE  = (process.argv.find(a => a.startsWith('--course=')) || '').split('=')[1];
const MODULE  = (process.argv.find(a => a.startsWith('--module=')) || '').split('=')[1]; // e.g. "ai-0"
const WAIT    = process.argv.includes('--wait'); // poll + download immediately (slow but sequential)

// ─── All 36 module scripts ─────────────────────────────────────────────────
// Format: { id, course, module, title, script }
// id = "{course}-{module}", e.g. "ai-0", "affiliate-3"
// Scripts: ~120-150 words each (targeting ~50-60 seconds)
// Voice: warm, honest, grounded. No hype. Speaks to 55-75 audience.

const VIDEOS = [

  // ══════════════════════════════════════════════════════════════
  // COURSE 1 — AI Side Income Starter Kit
  // ══════════════════════════════════════════════════════════════

  {
    id: 'ai-0',
    course: 'ai',
    module: 0,
    title: 'AI Side Income — Welcome',
    script: `Hi there, I'm Linda — welcome to the AI Side Income Starter Kit.

Before we go any further, I want to be straight with you: this is not a "make five thousand dollars in your first week" course. That's not real, and you deserve better than that.

What this is, is a real set of skills you can get paid for — using AI tools that are genuinely changing what's possible for people working from home. Things like writing help, bookkeeping support, social media work, and more.

The people who succeed here are patient, willing to practice, and honest about where they're starting. If that's you, you're in exactly the right place.

So let's start with the basics: setting up your free AI accounts and getting comfortable with the tools. It takes about fifteen minutes, and everything else builds from here.

I'm glad you're here. Let's get started.`,
  },

  {
    id: 'ai-1',
    course: 'ai',
    module: 1,
    title: 'AI Side Income — Module 1: Your AI Assistants',
    script: `Welcome to Module One. By the end of this one, AI tools should feel a lot less mysterious.

Here's the simplest way to understand what ChatGPT, Claude, and Gemini actually do: they predict the next word, based on an enormous amount of human writing. That's it. Very impressive prediction — but it means they can also be confidently wrong.

Think of them as a very capable intern. Useful for drafting, summarizing, brainstorming, and organizing. Not reliable for current events, precise math, or citing sources — they make things up when they don't know.

In this module I'll show you all three tools side by side, so you can see how their answers differ. I'll also show you the hallucination test — what happens when you ask about something obscure.

The goal isn't to be impressed. The goal is to understand the tool well enough to use it safely. Let's take a look.`,
  },

  {
    id: 'ai-2',
    course: 'ai',
    module: 2,
    title: 'AI Side Income — Module 2: Talking to AI',
    script: `Module Two is the one that changes everything: learning how to actually talk to AI.

Most people get disappointing results and assume the tool doesn't work. Usually the problem isn't the tool — it's the prompt. "Write me a blog post" gets you garbage. Tell it your role, give it context, define the task, and specify the format — and the same tool returns something genuinely useful.

I call it the four-part structure: Role, Context, Task, and Format. Once you get comfortable with it, you'll use it every single time.

I'll also show you two tricks that most people skip: giving the AI examples of what good looks like, and asking it to ask you questions before it starts writing.

Everything we do in this course — every service you might offer, every client deliverable — runs through this skill. Take your time here. It's worth it.`,
  },

  {
    id: 'ai-3',
    course: 'ai',
    module: 3,
    title: 'AI Side Income — Module 3: Five Services That Work',
    script: `Module Three is where we get specific about what you can actually get paid for.

I want to dispel something right now: you are not inventing a new business category. Every service in this module is something real businesses are already paying for, right now. We're just looking at how AI tools change the economics for someone working part-time from home.

We'll cover five: writing and editing, bookkeeping support, social media ghostwriting, customer email help, and transcription. Each one has realistic rates, realistic client types, and an honest look at how many hours it takes.

My strong advice: pick one. Do not try to offer all five at once. Three great clients in one area beats fifteen mediocre ones spread across five.

By the end of this module, you'll know exactly which service fits you best. Let's go through them.`,
  },

  {
    id: 'ai-4',
    course: 'ai',
    module: 4,
    title: 'AI Side Income — Module 4: Landing Your First 3 Clients',
    script: `The number one thing I hear from people stuck at zero is: "I don't know where to find clients."

Module Four removes that excuse completely.

There are five places that consistently work for beginners: Upwork, your existing network, local small business outreach, Facebook groups for business owners, and referrals from professionals who already serve your ideal clients.

I'm going to walk you through all five, with specific language for each one — including a cold outreach email template that I'll show you how to adapt with AI, and a discovery call script that doesn't feel pushy.

The goal in your first thirty days isn't to have the perfect pitch. It's to have three real conversations with potential clients. Everything builds from there.

This module comes with templates you can actually use today. Let's look at where to start.`,
  },

  {
    id: 'ai-5',
    course: 'ai',
    module: 5,
    title: 'AI Side Income — Module 5: Doing the Work',
    script: `Module Five is about actually delivering the work — which is where most beginners either build a real business or quietly quit.

The most important principle in this entire course: never submit raw AI output. Ever. Your client is paying for your judgment, not the model's. The AI drafts. You edit, fact-check, and make it sound like it was written by a thoughtful human being.

I'll walk you through two complete workflows end to end: a blog post for a local business, and a month of LinkedIn posts for a realtor. You'll see exactly how the AI fits in — and exactly where your human judgment matters most.

The editing pass is roughly thirty percent of your time and seventy percent of the value. That's not a burden — that's your competitive advantage. The clients who could have just used ChatGPT themselves will eventually figure that out. Your job is to deliver something they couldn't.`,
  },

  {
    id: 'ai-6',
    course: 'ai',
    module: 6,
    title: 'AI Side Income — Module 6: Pricing Your Time',
    script: `The number one mistake beginners make: charging too little because they feel like they're new and don't deserve more.

Here's the problem with that thinking. Charge fifteen dollars an hour, and clients assume the work is worth fifteen dollars an hour. You can't afford to spend the time to deliver quality. You burn out in two months. And you've taught the market that your work is cheap.

Module Six is about pricing yourself like you intend to stay in business.

I'll give you a realistic ladder — what to charge in month one, month six, month twelve, and beyond. I'll also explain the three pricing models: hourly, project, and retainer — and why the retainer is what you're actually building toward.

This is a short module, but it might be the most important mindset shift in the whole course.`,
  },

  {
    id: 'ai-7',
    course: 'ai',
    module: 7,
    title: 'AI Side Income — Module 7: Boundaries and Balance',
    script: `I want to talk about something the other courses don't: how to actually enjoy this.

If you're in the fifty-five-plus range, you got into this for flexibility, not to trade one stressful job for another. And yet — without clear boundaries — that's exactly what happens.

Module Seven is short but important. We'll talk about setting actual office hours with clients, responding to scope creep professionally, and the three-clients-maximum rule for your first ninety days.

I'll also give you the language for firing a client when it's necessary — because it is sometimes necessary, and most people have no idea how to do it without feeling guilty.

The goal is a business that fits your life. Not a business that runs your life. Protecting that requires some intentional decisions up front.

Let's make sure you're set up for the long run.`,
  },

  {
    id: 'ai-8',
    course: 'ai',
    module: 8,
    title: 'AI Side Income — Module 8: Your 90-Day Plan',
    script: `You've made it to the final module, and I want to end with something concrete: a week-by-week roadmap for your first ninety days.

Not vague goals. Specific actions with specific timelines.

Days one through seven: finish the course, pick your one service, set up your Upwork profile, and list twenty local businesses you could reach out to.

Days eight through twenty-one: three cold outreach emails per day, two to three Upwork bids per day, run your first discovery calls.

Days twenty-two through forty-five: land your first client. Deliver excellent work. Get a testimonial.

Days forty-six through ninety: three active clients, raised rates, start saying no to the wrong fits.

Most people quit at day thirty because they haven't landed a client yet. The ones who make it are the ones who sent a hundred outreach messages by then.

You can do this. I mean that.`,
  },

  // ══════════════════════════════════════════════════════════════
  // COURSE 2 — Honest Affiliate Marketing Starter
  // ══════════════════════════════════════════════════════════════

  {
    id: 'affiliate-0',
    course: 'affiliate',
    module: 0,
    title: 'Affiliate Marketing — Welcome',
    script: `Welcome to the Honest Affiliate Marketing Starter. I'm Linda.

I want to begin by telling you something you won't hear from most affiliate marketing courses: this takes time. A long time. We're talking six to twelve months before you see meaningful income, and twelve to twenty-four months before it becomes something significant.

If someone told you differently — if the course you almost bought promised income in thirty days — they were either lying or selling their exception as the rule.

The reason I'm telling you this first is that the people who succeed here are the ones who went in with accurate expectations. They treated it like a real small business that compounds over years. The ones who quit usually expected a shortcut and didn't find one.

If patient, honest, long-term thinking sounds like you — then you're in the right place. Let's get started.`,
  },

  {
    id: 'affiliate-1',
    course: 'affiliate',
    module: 1,
    title: 'Affiliate Marketing — Module 1: How It Actually Works',
    script: `Affiliate marketing has a lot of mystique around it that it doesn't deserve. Let me cut through it.

Here's the whole thing in one sentence: a merchant pays you a commission when someone you referred makes a purchase. That's it.

Module One demystifies the mechanics. We'll cover the four parties involved — merchant, network, affiliate, and customer — how tracking actually works with cookies and attribution windows, what commission structures look like in practice, and how and when you actually get paid.

I'll also show you a real affiliate report from Amazon Associates so you can see exactly what a sale looks like on the back end.

Understanding the mechanics isn't glamorous, but it removes a lot of the confusion that trips people up later. Once you see how the plumbing works, the rest of the course makes a lot more sense.`,
  },

  {
    id: 'affiliate-2',
    course: 'affiliate',
    module: 2,
    title: 'Affiliate Marketing — Module 2: The 3 Honest Paths',
    script: `There are essentially three honest ways to build an affiliate income stream: a content site, a YouTube channel, or an email newsletter. Each one works. Each one has real tradeoffs.

Module Two is about helping you choose one — and only one — before you start. Trying to do all three at once is one of the most common ways people fail here. The work is just too different, and the learning curve for each is real.

The content site builds slowly but compounds beautifully over time. YouTube builds trust faster but requires being on camera. The email newsletter creates the closest relationship with your readers — but you start with zero subscribers.

I'll walk through the honest pros and cons of each, including realistic timelines to first income. Then I'll give you a five-question framework to help you figure out which one actually fits your situation.

By the end of this module, you'll have made your choice. Pick it and don't change it for at least six months.`,
  },

  {
    id: 'affiliate-3',
    course: 'affiliate',
    module: 3,
    title: 'Affiliate Marketing — Module 3: Picking Your Niche',
    script: `If there's one decision that determines whether you succeed or fail in affiliate marketing, it's this one: picking your niche.

Niche selection is the number one reason beginners fail. Not traffic. Not content quality. Not the affiliate programs they chose. The niche.

A good niche has to satisfy five criteria: you're genuinely interested in it, there's real commercial activity, it has enough depth for a hundred-plus pieces of content, the competition isn't dominated by huge sites, and — critically — you think you'll still care about it in two years.

Module Three gives you a full research walkthrough so you can evaluate your candidates honestly. I'll show you niche categories that still work in 2026, ones that are saturated, and a scoring exercise to help you pick the one that fits you best.

This is sixty minutes of careful thinking. It is absolutely worth it.`,
  },

  {
    id: 'affiliate-4',
    course: 'affiliate',
    module: 4,
    title: 'Affiliate Marketing — Module 4: Amazon Associates',
    script: `Your first affiliate partner is almost certainly going to be Amazon Associates, and for good reason: low barrier to entry, massive catalog, and straightforward setup.

That said, there are rules — and breaking them gets your account closed.

Module Four is the full Amazon Associates walkthrough: how to apply, what the 180-day initial requirement means and how to meet it, what you can and cannot do with your links, and how to create your first ten affiliate links using their SiteStripe tool.

I'll also give you honest income expectations. Months one through three: essentially zero. Months four through six: five to fifty dollars if your content is live and ranking. Year two and beyond, for a dedicated niche site with fifty-plus well-ranked posts: three hundred to three thousand dollars per month.

These are typical ranges. Some people make more. Most make less. I'd rather give you the real numbers than the hopeful ones.`,
  },

  {
    id: 'affiliate-5',
    course: 'affiliate',
    module: 5,
    title: 'Affiliate Marketing — Module 5: Beyond Amazon',
    script: `Amazon is the training wheels. Module Five is where we talk about where the real money is — but with some important caveats.

Software subscriptions pay thirty to fifty percent commission. Information products, forty to sixty percent. Some finance products pay a hundred dollars or more per conversion. These numbers are real — and they're also why this space attracts dishonest courses that oversell them.

The rule I give everyone: only promote what you would actually use yourself. If it's a bad product, your readers find out, and the trust you spent months building disappears in one recommendation.

I'll walk you through the five main affiliate networks — ShareASale, Impact, CJ Affiliate, PartnerStack, and direct programs — and show you exactly how to vet a program before you commit to promoting it.

Recurring commissions are the real goal. We'll look at those in particular.`,
  },

  {
    id: 'affiliate-6',
    course: 'affiliate',
    module: 6,
    title: 'Affiliate Marketing — Module 6: Content That Helps People',
    script: `After Google's 2023 and 2024 algorithm updates, a lot of affiliate sites got wiped out. The ones that survived — and the ones that are growing now — share one thing in common: they actually help people.

Module Six is about creating content that earns trust, not just clicks.

We'll cover the three content types that work best for affiliate sites: honest product reviews with real pros and cons, roundup posts that make genuine comparisons, and problem-solving guides that recommend products in context rather than forcing them.

I'll also talk about using AI writing tools the right way. AI can help you draft. It should not be your final voice. The human editing pass — your specific experience, your perspective, your voice — is what makes the content trustworthy. And in a post-HCU world, trust is what Google rewards.

Let's talk about writing content that actually earns it.`,
  },

  {
    id: 'affiliate-7',
    course: 'affiliate',
    module: 7,
    title: 'Affiliate Marketing — Module 7: Getting Traffic',
    script: `This is the module where people get impatient — and I understand why. You've built something, and you want people to see it.

The honest answer is that traffic takes time. Real, sustainable traffic — the kind that compounds and doesn't disappear when an algorithm changes — takes six to twelve months to build. I know that's not what you want to hear. But it's the truth, and pretending otherwise won't help you.

Module Seven covers the three traffic channels that actually work: search engine optimization, building your own email list, and YouTube. I'll give you realistic timelines for each, and a full SEO walkthrough using free keyword research tools.

I'll also give you the 100-Day Content Sprint plan — a month-by-month roadmap for your first year of content publishing.

The people who make it through month six and seven of near-zero traffic are the ones who win this game. You'll be glad you did.`,
  },

  {
    id: 'affiliate-8',
    course: 'affiliate',
    module: 8,
    title: 'Affiliate Marketing — Module 8: Measuring and Scaling',
    script: `The last module closes the loop with the stuff that keeps you compliant, keeps you growing, and keeps you out of trouble.

We'll start with metrics that actually matter: affiliate link clicks, conversion rate, earnings per click, and organic traffic growth. I'll steer you away from vanity metrics that feel important but don't tell you much.

Then we'll do a thorough FTC disclosure walkthrough. This is non-negotiable. Every piece of content with an affiliate link must have a disclosure that is clear, visible, and above where the links appear. I'll give you the exact language for websites, YouTube, and email.

We'll also cover taxes — affiliate income is self-employment income, and quarterly estimated payments are your responsibility — and a realistic look at what scaling looks like in years two, three, and four.

This is a long game. You're now equipped to play it well. Good luck.`,
  },

  // ══════════════════════════════════════════════════════════════
  // COURSE 3 — Estate Sale Sourcing Academy
  // ══════════════════════════════════════════════════════════════

  {
    id: 'estate-0',
    course: 'estate',
    module: 0,
    title: 'Estate Sale Sourcing — Welcome',
    script: `Welcome to the Estate Sale and Garage Sale Sourcing Academy. I'm Linda.

Let me be direct about what this is and what it isn't. This is a reselling skill course — you'll learn how to find undervalued items at estate sales and sell them on eBay and other platforms. It requires driving, negotiating, and being comfortable with physical inventory.

What it is not is passive income. You trade time for money here, at least in the beginning. The typical part-time sourcer makes three hundred to fifteen hundred dollars per month in year one. Some do more. Most don't.

Who succeeds: patient people who enjoy the hunt, who are comfortable haggling, and who have a space for inventory — a garage or spare room.

Who struggles: people who need fast money, who hate clutter, or who won't leave the house on Saturday morning.

If the first group sounds like you — let's get started.`,
  },

  {
    id: 'estate-1',
    course: 'estate',
    module: 1,
    title: 'Estate Sale Sourcing — Module 1: How the Ecosystem Works',
    script: `Before you can work a sale well, you need to understand how the whole ecosystem operates — who's involved, how it's structured, and what the unwritten rules are.

Module One gives you that foundation.

Estate sales are different from garage sales, moving sales, and auctions — and knowing the differences will change how you approach each one. We'll cover all four formats with honest pros and cons.

I'll also walk you through the calendar: why Thursday through Saturday is the primary window, and why Sunday and Monday can be gold for the patient buyer who waits for half-off pricing.

You'll also meet the people you'll encounter — estate sale company staff, other pickers, downsizing families — and learn how to read the room at each one.

Your assignment for this module: attend one estate sale this week. Buy nothing. Just observe and take notes. Everything you learn in this course will make more sense after you've walked the floor once.`,
  },

  {
    id: 'estate-2',
    course: 'estate',
    module: 2,
    title: 'Estate Sale Sourcing — Module 2: Finding Sales Near You',
    script: `Finding the right sales before anyone else does is one of the underrated skills in this business. Module Two builds your weekly rhythm for it.

The primary tool is EstateSales.net — the largest aggregator, with photo previews, saved search alerts, and enough detail to plan your Saturday route before you leave the house. I'll do a full walkthrough.

We'll also cover Craigslist garage sales, Facebook local groups, and — this one surprises people — newspaper classifieds, which are still surprisingly useful in smaller markets.

Then there's the route optimization question. If you have five sales in three different directions, how do you sequence them? I'll give you a Saturday morning planning template that maps it all out.

Finally, we'll talk about preview nights — some companies let serious buyers in Thursday evening. Getting there first matters more than most beginners realize.

By the end of this module you'll have your first Saturday route ready to go.`,
  },

  {
    id: 'estate-3',
    course: 'estate',
    module: 3,
    title: 'Estate Sale Sourcing — Module 3: What to Look For',
    script: `This is the biggest module in the course, and for good reason: knowing what to look for is the skill that separates the profitable sourcer from the one with a garage full of stuff that won't sell.

We're going to cover seven categories in depth: vintage tools, jewelry, collectibles, electronics, glassware and pottery, books, and furniture. Each one has different authentication tells, different pricing patterns, and different pitfalls.

I'll give you the category cheat sheets — visual identification guides for each type — so you can make faster decisions with your phone in your hand.

The thing I want you to take from this module isn't just the categories. It's the habit of slowing down and looking carefully. The best finds at estate sales are the ones other people walked past. They walked past them because they were moving too fast or didn't know what they were looking at.

You will. Let's dig in.`,
  },

  {
    id: 'estate-4',
    course: 'estate',
    module: 4,
    title: 'Estate Sale Sourcing — Module 4: Pricing and Negotiation',
    script: `Knowing what to pick up is half the skill. Knowing what to pay for it is the other half.

Module Four gives you a decision framework that works at the speed of a real estate sale — because you often have thirty seconds to decide before someone else picks it up.

The core rule is the fifty-fifty: if you can't get the item for roughly fifty percent of what it sells for on eBay — after accounting for fees and shipping — walk away. Most people overpay because they make decisions emotionally. This rule removes the emotion.

I'll also cover the thirty-second phone check: how to use eBay sold listings and Google Lens together to get a fast, reliable sense of market value.

And we'll talk about negotiation — three scripts for three different seller types, and the important rule about when not to negotiate at all.

Building good relationships with estate companies will matter a lot over time. We'll talk about that too.`,
  },

  {
    id: 'estate-5',
    course: 'estate',
    module: 5,
    title: 'Estate Sale Sourcing — Module 5: From Sale to Profit',
    script: `You've sourced the items. Now what?

Module Five is the full pipeline: what happens between walking out of an estate sale and receiving a payment in your bank account.

We'll set up your staging area — a dedicated space for intake, cleaning, photographing, and listing. Doing this right from the start saves enormous headaches later.

Then the photography station: you don't need expensive equipment. A simple lightbox, consistent backdrop, and your phone camera are enough. I'll show you the setup.

Listing comes next. eBay first for pricing power, then Facebook Marketplace and Mercari. I'll walk you through eBay title-writing conventions — the specific phrasing that shows up in search — and how the included AI Writing Assistant drafts listings from your photo descriptions in about two minutes.

Shipping basics round out the module: USPS Priority Flat Rate boxes, eBay label discounts, and how to pack fragile items so they actually arrive intact.

Your deliverable: list your first ten items by end of the week.`,
  },

  {
    id: 'estate-6',
    course: 'estate',
    module: 6,
    title: 'Estate Sale Sourcing — Module 6: Scaling Up',
    script: `Module Six is about recognizing when you've outgrown the solo sourcing model — and what's available when you do.

The realistic ceiling for a part-time solo sourcer is roughly fifteen hundred to twenty-five hundred dollars per month. At some point, the bottleneck shifts from finding inventory to having time to photograph, list, ship, and manage returns.

That's when the eBay Done-With-You program becomes worth considering. It's an application-based program for sourcers who are ready to scale — it handles the listing, photography, warehousing, and fulfillment so you can focus on sourcing.

This module covers the three signs you're ready: you're averaging eight or more sourced items per week, you have meaningful ROI inventory sitting unprocessed, and you're losing time to the back-end work rather than the sourcing itself.

The application process starts on this platform. We'll walk through what it involves.`,
  },

  {
    id: 'estate-7',
    course: 'estate',
    module: 7,
    title: 'Estate Sale Sourcing — Module 7: Taxes and Tracking',
    script: `I know taxes and tracking aren't the exciting part of this business. But they're the part that keeps you out of trouble, so let's give them their due.

Module Seven covers three things: the tax basics for resellers, a simple inventory tracking system, and the psychological trap that turns a profitable hobby into a cluttered storage problem.

On taxes: once you start selling consistently, you're running a business in the IRS's eyes. That means Schedule C income, potential self-employment taxes, and quarterly estimated payments. Mileage to sales is deductible. I'll give you the framework — and a clear reminder to talk to a CPA in year one.

On inventory tracking: a simple spreadsheet, updated weekly, tells you exactly which categories are making you money and which aren't. I'll give you the template.

And on the clutter problem: the ninety-day rule. If it hasn't sold in ninety days, donate it or lot-list it. Don't become a hoarder. This is a business, not a museum.`,
  },

  {
    id: 'estate-8',
    course: 'estate',
    module: 8,
    title: 'Estate Sale Sourcing — Module 8: Your 90-Day Plan',
    script: `Last module — and we're ending with a plan you can actually execute.

Weeks one and two: attend three sales, buy nothing, just observe. Use the route spreadsheet, practice the thirty-second phone check, take notes on what sells and what doesn't.

Weeks three and four: your first sourcing trips. Target one hundred dollars in inventory. List your first ten items.

Month two: refine your categories, track ROI by source, aim for five hundred dollars in inventory. By now you'll start to see which categories you're naturally good at.

Month three: choose your specialization — the one or two categories where your eye is best — and aim for a thousand or more in active inventory. If you're sourcing consistently, start evaluating whether the eBay Done-With-You program makes sense for your next level.

If you get to ninety days and it's genuinely not for you, the seven-day money-back guarantee still protects your initial purchase, and you can cancel the monthly membership at any time.

But I think you're going to like it. Let's go find something good.`,
  },

  // ══════════════════════════════════════════════════════════════
  // COURSE 4 — Bookkeeping From Home for Over-55s
  // ══════════════════════════════════════════════════════════════

  {
    id: 'bookkeeping-0',
    course: 'bookkeeping',
    module: 0,
    title: 'Bookkeeping — Welcome',
    script: `Welcome to Bookkeeping From Home for Over-55s. I'm Linda.

Let's start with what this course is: a practical guide to building a part-time bookkeeping service with three to five monthly retainer clients, working from home on your schedule.

What it is not: a path to becoming a CPA, a tax preparer, or an agency. There are clear legal boundaries to what bookkeepers can and can't do, and we'll cover those honestly.

The realistic numbers: three clients at four hundred dollars per month is twelve hundred dollars recurring. Five clients at five hundred is twenty-five hundred. Two weeks of concentrated work per month — end of month close plus mid-month. That's the model.

Who succeeds: people who are comfortable with numbers, reliable, and patient with messy client records. Who doesn't: people who need to learn bookkeeping basics from scratch — there's a free Intuit Academy course for that first — or people who want to scale to thirty-plus clients.

If this sounds like your kind of work, let's get started.`,
  },

  {
    id: 'bookkeeping-1',
    course: 'bookkeeping',
    module: 1,
    title: 'Bookkeeping — Module 1: The Lines You Don\'t Cross',
    script: `This module might be the most important one in the course, because it's about knowing your legal boundaries — and staying firmly on the right side of them.

Here's the distinction you need to internalize: bookkeeping is transaction entry, bank reconciliation, and monthly reporting. Accounting is financial statement analysis, tax adjustments, and audit preparation. Tax preparation for pay requires specific credentials — a CPA, an enrolled agent, or a PTIN. Those are not what we're doing.

The good news: bookkeeping requires no license in any US state as of 2026. You can start today. But the moment you start giving tax advice, preparing returns, or doing audit-prep work, you've crossed a line that can create real legal exposure.

We'll also cover when to refer a client to their CPA — there are three specific scenarios where the right answer is always to hand it off — and the "I'm not your tax preparer" letter that protects you from clients who try to pull you across that line.

Understanding this clearly from the start protects you. Let's go through it.`,
  },

  {
    id: 'bookkeeping-2',
    course: 'bookkeeping',
    module: 2,
    title: 'Bookkeeping — Module 2: Your Software Stack',
    script: `The vast majority of small business bookkeeping happens in three platforms: QuickBooks Online, Xero, and FreshBooks.

Module Two is about getting oriented in all three — and making a decision about where to specialize first.

My recommendation for most people: start with QuickBooks Online. Roughly eighty percent of the small business clients you'll encounter use it. Once you're comfortable there, you can add Xero or FreshBooks based on what your client base actually needs.

We'll also cover the QuickBooks ProAdvisor program — it's free, it gives you a certification badge that helps you get clients, and it gives your clients discounted subscriptions. Same idea with the Xero Advisor certification.

I'll walk you through each platform in enough depth to understand the interface, the core workflows, and the terminology. You don't need to master all three before you start. You need to know QBO well, and know that the others exist.

Let's take a look.`,
  },

  {
    id: 'bookkeeping-3',
    course: 'bookkeeping',
    module: 3,
    title: 'Bookkeeping — Module 3: Services You Can Offer',
    script: `There are five types of bookkeeping services that small businesses hire for. Module Three walks through all five — but I want you to leave here having chosen two or three, not five.

Specialists get hired faster, charge more, and deliver better work. Generalists look risky to small business owners who want someone reliable.

The five: monthly reconciliation and financial reporting — this is the core offering every client needs. Accounts receivable management, accounts payable, payroll coordination — note, that's coordination, not filing — and QuickBooks cleanup projects, which are one-time engagements and an excellent way to land a new client.

My recommended starting package: monthly reconciliation plus financial reporting plus accounts receivable, for one specific industry. Contractors, realtors, e-commerce sellers, consultants — pick one and learn their books.

When you can say "I specialize in bookkeeping for realtors" you become much easier to hire than "I do bookkeeping for small businesses." Let's talk through each service so you can decide.`,
  },

  {
    id: 'bookkeeping-4',
    course: 'bookkeeping',
    module: 4,
    title: 'Bookkeeping — Module 4: Landing Your First 3 Clients',
    script: `The path to your first bookkeeping client is more direct than most people think — but it requires doing things that feel a little uncomfortable if you're not used to it.

Module Four is the full client acquisition playbook.

The most reliable source of bookkeeping clients, by a wide margin: referrals from CPAs. Most CPAs genuinely do not want to do bookkeeping work. They want to focus on tax strategy and advisory. If you can demonstrate that you're reliable and detail-oriented, one good CPA relationship can send you three to five client introductions per year.

I'll also cover local networking, Facebook business groups, Upwork, and cold outreach. We'll walk through the free "books review" offer — a fifteen-minute look at a potential client's QuickBooks file, identify three issues, no charge. It converts at roughly forty percent.

Your goal: first client in thirty days. That's realistic if you do five CPA outreaches and ten local introductions per week. Let's look at exactly how to do it.`,
  },

  {
    id: 'bookkeeping-5',
    course: 'bookkeeping',
    module: 5,
    title: 'Bookkeeping — Module 5: Pricing That Doesn\'t Burn You Out',
    script: `The bookkeeping market has a pricing problem: too many bookkeepers charge by the hour, get better and faster over time, and end up earning less the better they get.

Module Five is about building toward the monthly retainer model — the one that gives you predictable income and rewards your efficiency rather than punishing it.

We'll cover the three models: hourly, project-based, and retainer. Hourly is fine for your first client, but it caps your income at your time. Project work — QBO cleanup engagements in particular — is excellent for getting your foot in the door. The retainer is where you're headed.

The pricing formula is simple: estimate your hours per month per client, multiply by your target hourly rate, add a twenty percent buffer, and that's your monthly price. I'll walk through several examples.

We'll also cover the rate increase conversation — a scripted ninety-day review template — and the boundary scripts for scope creep. Both matter more than most people expect.`,
  },

  {
    id: 'bookkeeping-6',
    course: 'bookkeeping',
    module: 6,
    title: 'Bookkeeping — Module 6: Engagement Letters and Legal Boundaries',
    script: `Every single bookkeeping engagement needs a written engagement letter. No exceptions.

Not because you're worried about your clients. Because the letter protects both of you — it defines scope so there are no surprises, sets the fee clearly, establishes confidentiality expectations, and gives both sides a clean termination process if the relationship isn't working.

Module Six gives you the template engagement letter, which covers all of those bases. I do want to be clear: the template is a starting point, not legal advice. For your specific state and situation, having an attorney review it once is worth the cost.

We'll also cover Errors and Omissions insurance — worth considering once you're billing two thousand or more per month — data privacy best practices for handling client financial data, and the password management protocols that keep you and your clients protected.

This module is the unglamorous but genuinely important foundation of running this as a real professional practice.`,
  },

  {
    id: 'bookkeeping-7',
    course: 'bookkeeping',
    module: 7,
    title: 'Bookkeeping — Module 7: Running It With AI',
    script: `This is the module where the AI assistant included with your Foundation Pass membership becomes genuinely useful for your bookkeeping work.

The tool is a custom Claude Project preloaded with bookkeeping-specific workflows. I want to walk you through what it does well, and be very clear about what it should never do.

What it does well: drafting client outreach emails in your voice, turning QuickBooks reports into plain-English monthly summaries your clients actually read, adapting the engagement letter template to specific client scenarios, and handling late-payment reminder language that's firm without burning the relationship.

What it should never do: make categorization decisions on live client transactions. That's your judgment call. Every transaction. The AI drafts and assists. You review and decide.

The distinction matters. Your clients are paying for your reliable judgment on their books, not for automated output. AI makes you faster and more professional-sounding. It doesn't replace the careful, human attention that makes good bookkeeping worth paying for.`,
  },

  {
    id: 'bookkeeping-8',
    course: 'bookkeeping',
    module: 8,
    title: 'Bookkeeping — Module 8: Your 90-Day Plan',
    script: `We're at the end, and I want to leave you with a plan that's actually executable.

Days one through fourteen: complete the QuickBooks ProAdvisor certification — it's free and takes about ten hours. Pick your industry niche and your two or three services. Write your engagement letter and pricing sheet.

Days fifteen through thirty: begin outreach. Ten CPA introductions per week, ten local network conversations per week. Use the free books review offer as your opener. Goal: first client by day thirty.

Days thirty-one through sixty: deliver month one for your first client. Build the workflow habit. Start prospecting for client two. Goal: second client by day sixty.

Days sixty-one through ninety: running two clients, prospecting for a third. Decide your target: three clients, five, or more. Most people in this course are happiest at three to five.

The thing I'll leave you with: reliability is your entire competitive advantage in this business. Clients don't need you to be brilliant. They need you to show up, do it right, and respond within a day.

Build that reputation from day one. The referrals will follow.`,
  },
];

// ─── Helpers ───────────────────────────────────────────────────────────────

function loadManifest() {
  if (!fs.existsSync(MANIFEST)) return {};
  try { return JSON.parse(fs.readFileSync(MANIFEST, 'utf8')); } catch { return {}; }
}

function saveManifest(m) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(MANIFEST, JSON.stringify(m, null, 2));
}

async function generateVideo(video) {
  const body = {
    video_inputs: [{
      character: {
        type: 'avatar',
        avatar_id: AVATAR_ID,
        avatar_style: 'normal',
      },
      voice: {
        type: 'text',
        input_text: video.script,
        voice_id: VOICE_ID,
        speed: 0.95,
      },
      background: {
        type: 'color',
        value: '#0f172a', // Income Academy navy
      },
    }],
    dimension: DIMENSION,
    title: video.title,
    caption: false,
  };

  const r = await fetch('https://api.heygen.com/v2/video/generate', {
    method: 'POST',
    headers: {
      'X-Api-Key': API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!r.ok) {
    const err = await r.json().catch(() => ({ error: r.statusText }));
    throw new Error(`HeyGen API error ${r.status}: ${JSON.stringify(err)}`);
  }

  const data = await r.json();
  const videoId = data.data?.video_id || data.video_id;
  if (!videoId) throw new Error(`No video_id in response: ${JSON.stringify(data)}`);
  return videoId;
}

async function pollAndDownload(videoId, outPath, maxMinutes = 30) {
  const maxTries = (maxMinutes * 60) / 15;
  for (let i = 0; i < maxTries; i++) {
    await new Promise(r => setTimeout(r, 15_000));
    const r = await fetch(`https://api.heygen.com/v1/video_status.get?video_id=${videoId}`, {
      headers: { 'X-Api-Key': API_KEY },
    });
    const data = await r.json();
    const d = data.data || data;
    const status = d.status || '';
    process.stdout.write(`  [poll ${i + 1}] ${status}\r`);
    if (/completed/i.test(status)) {
      console.log(`\n  ✓ completed`);
      const url = d.video_url;
      if (!url) throw new Error('Completed but no video_url');
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Download failed: ${res.status}`);
      fs.mkdirSync(path.dirname(outPath), { recursive: true });
      const buf = Buffer.from(await res.arrayBuffer());
      fs.writeFileSync(outPath, buf);
      return { downloaded: true, size: buf.length };
    }
    if (/failed/i.test(status)) {
      throw new Error(`Video failed: ${d.error || 'unknown'}`);
    }
  }
  throw new Error(`Timed out after ${maxMinutes} min`);
}

// ─── Main ──────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n🎬  Income Academy — HeyGen Batch Video Generator');
  console.log(`   Avatar: Saffron (Linda) — sitting-at-table, Avatar IV`);
  console.log(`   Mode: ${DRY_RUN ? '🟡 DRY-RUN' : TEST ? '🔵 TEST' : '🟢 LIVE'}\n`);

  if (!API_KEY && !DRY_RUN) {
    console.error('✗ HEYGEN_API_KEY not set. Add to server/.env or export.');
    process.exit(1);
  }

  // ── TEST mode: generate a single 1-sentence video to verify API ──
  if (TEST) {
    console.log('Running API test with 5-word script...');
    try {
      const testVideoId = await generateVideo({
        id: 'test',
        title: 'API Test — Linda',
        script: 'Welcome. This is a test.',
      });
      console.log(`✓ API test queued: ${testVideoId}`);
      console.log(`  Check status: curl -s -H "X-Api-Key: $HEYGEN_API_KEY" "https://api.heygen.com/v1/video_status.get?video_id=${testVideoId}"`);
    } catch (err) {
      console.error('✗ API test failed:', err.message);
      process.exit(1);
    }
    return;
  }

  // ── Filter videos to generate ──
  let toGenerate = VIDEOS;
  if (COURSE) toGenerate = VIDEOS.filter(v => v.course === COURSE);
  if (MODULE) toGenerate = VIDEOS.filter(v => v.id === MODULE);

  if (toGenerate.length === 0) {
    console.error(`No videos match filter. Courses: ai|affiliate|estate|bookkeeping. Module IDs: ai-0, ai-1, ..., bookkeeping-8`);
    process.exit(1);
  }

  const manifest = loadManifest();

  // ── DRY-RUN: show what would be generated ──
  if (DRY_RUN) {
    console.log(`Would generate ${toGenerate.length} videos:\n`);
    for (const v of toGenerate) {
      const words = v.script.split(/\s+/).length;
      const estSec = Math.round(words / 2.2);
      const status = manifest[v.id] ? `(already: ${manifest[v.id].videoId})` : '(new)';
      console.log(`  [${v.id}] ${v.title}`);
      console.log(`         ~${words} words, ~${estSec}s video ${status}`);
    }
    console.log(`\nEstimated cost: ~$${(toGenerate.length * 0.05).toFixed(2)} - $${(toGenerate.length * 0.10).toFixed(2)}`);
    console.log(`Estimated render time: ~${toGenerate.length * 3}-${toGenerate.length * 6} minutes (HeyGen processes sequentially)`);
    return;
  }

  // ── LIVE: queue all videos ──
  const results = [];
  for (const video of toGenerate) {
    const existing = manifest[video.id];
    if (existing?.status === 'completed' && fs.existsSync(existing.localPath)) {
      console.log(`⏭  [${video.id}] Already complete + downloaded — skipping`);
      results.push({ id: video.id, status: 'skipped' });
      continue;
    }

    console.log(`\n🎬 [${video.id}] ${video.title}`);
    const words = video.script.split(/\s+/).length;
    console.log(`   Script: ${words} words`);

    try {
      const videoId = await generateVideo(video);
      console.log(`   ✓ Queued: ${videoId}`);

      const outPath = path.join(OUT_DIR, `${videoId}.mp4`);
      manifest[video.id] = {
        videoId,
        title: video.title,
        status: 'queued',
        queuedAt: new Date().toISOString(),
        localPath: outPath,
        words,
      };
      saveManifest(manifest);

      if (WAIT) {
        console.log(`   Waiting for render...`);
        const { size } = await pollAndDownload(videoId, outPath);
        manifest[video.id].status = 'completed';
        manifest[video.id].downloadedAt = new Date().toISOString();
        manifest[video.id].sizeBytes = size;
        saveManifest(manifest);
        console.log(`   ✓ Downloaded → marketing/videos/heygen/${videoId}.mp4 (${(size / 1024 / 1024).toFixed(1)} MB)`);
      }

      results.push({ id: video.id, videoId, status: WAIT ? 'completed' : 'queued' });

      // Delay between requests to avoid rate limits
      if (toGenerate.indexOf(video) < toGenerate.length - 1) {
        await new Promise(r => setTimeout(r, 2000));
      }

    } catch (err) {
      console.error(`   ✗ Failed: ${err.message}`);
      results.push({ id: video.id, status: 'error', error: err.message });
      manifest[video.id] = { status: 'error', error: err.message };
      saveManifest(manifest);
    }
  }

  // ── Summary ──
  console.log('\n' + '━'.repeat(60));
  const queued = results.filter(r => r.status === 'queued');
  const completed = results.filter(r => r.status === 'completed');
  const skipped = results.filter(r => r.status === 'skipped');
  const failed = results.filter(r => r.status === 'error');

  console.log(`Queued: ${queued.length}  Completed: ${completed.length}  Skipped: ${skipped.length}  Failed: ${failed.length}`);

  if (queued.length > 0) {
    console.log('\n⏳ Videos are rendering in HeyGen. To download when ready:');
    console.log('   node server/src/tools/heygen-fetch-video.js <videoId>');
    console.log('\n   Or to download all queued at once:');
    console.log('   node server/src/tools/download-all-heygen-videos.js');
    console.log('\n   Queued video IDs:');
    for (const r of queued) {
      console.log(`   [${r.id}] ${r.videoId}`);
    }
  }

  if (failed.length > 0) {
    console.log('\n❌ Failed:');
    failed.forEach(f => console.log(`   [${f.id}] ${f.error}`));
    console.log('\n   Tip: If error is "avatar look not found", the look_id may need refreshing.');
    console.log('   Fix: Create one video manually in the HeyGen UI with Saffron, then retry.');
  }

  if (queued.length > 0 || completed.length > 0) {
    console.log('\n📋 Manifest saved → marketing/videos/heygen/manifest.json');
  }
}

main().catch(err => {
  console.error('\n✗ Script crashed:', err.message);
  process.exit(1);
});
