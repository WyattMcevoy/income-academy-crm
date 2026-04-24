# Live Chat Widget Setup (GoHighLevel)

How to turn on the live chat bubble that visitors see in the bottom-right of:
- `https://incomeacademy.biz` (main)
- `https://ai.incomeacademy.biz` (AI course)
- `https://affiliate.incomeacademy.biz` (affiliate course)

**Why GHL chat**: it's already part of your GHL subscription (no new tool to pay for), conversations auto-create CRM contacts + land in your Inbox, and you can trigger follow-up automations when someone starts a chat.

---

## Part 1: Configure the widget in GHL

1. Log into `app.gohighlevel.com`, switch to the Income Academy sub-account (location `c3HSS74ILjGye3pvGsHg`)
2. Left sidebar → **Sites** → **Chat Widget** (older UI may show under **Settings** → **Business Profile** → **Chat Widget**)
3. Click **+ Create Widget** (or edit the existing default)
4. Fill in:
   - **Widget name**: `Income Academy Main Site`
   - **Header title**: `Income Academy`
   - **Welcome message**: `Hi — I'm here if you have questions about the starter training. Typical reply time: under an hour during business hours.`
   - **Brand color**: `#f59e0b` (the gold from our palette)
   - **Icon color**: `#0f172a` (navy)
   - **Position**: Bottom-right
   - **Avatar**: upload `marketing/brand/logos/ia-mark-color.svg` once you've created it (or leave default for now)
   - **Fields to collect**: Name + Email (required), Phone (optional) — this is what creates the CRM contact
   - **Offline behavior**: "Collect email and we'll reply" (so after-hours messages still become leads)
   - **Auto-response**: "Thanks! I'll get back to you within a few hours. In the meantime, check your email for a confirmation."
5. Save
6. Click **Install** (or **Get embed code**) — you'll see a snippet like:

```html
<script src="https://widgets.leadconnectorhq.com/loader.js"
  data-resources-url="https://widgets.leadconnectorhq.com/chat-widget/loader.js"
  data-widget-id="YOUR_WIDGET_ID_HERE">
</script>
```

7. **Copy the whole snippet** — paste it back to me in chat, I'll replace the placeholder in all 3 landing pages.

## Part 2: What happens after

- Widget appears bottom-right on all 3 pages
- Visitor clicks → types a message → fills in name + email
- GHL creates a new contact (or updates existing) in your CRM
- You see a notification in GHL Inbox
- Reply from GHL → visitor gets the response in the widget AND via email
- If you don't reply within your configured time window, GHL can auto-send "Thanks for reaching out" and mark them for follow-up

## Part 3: Optional AI auto-reply (GHL Conversation AI)

If you want the chat to answer common questions automatically (pricing, refund policy, "what's included") before handing off to you:

1. In GHL: **Automations** → **Workflows** → new workflow
2. Trigger: **New chat message** (filter by widget)
3. Action: **Conversation AI** → add knowledge base (paste FAQ content from the landing pages)
4. Action: **If AI can't answer** → **Notify me**

This is the "best of both worlds" for a backup/low-touch setup. Optional — can skip for v1.

## Rollback

If the widget is causing issues on the site:
1. In GHL Widget Settings, toggle **Status** to Inactive (or delete the widget)
2. Widget disappears from all pages within ~60 seconds (cached copy may linger)
3. To fully remove: replace the GHL script tag in all 3 `index.html` files with `<!-- GHL_CHAT_WIDGET_PLACEHOLDER -->` and commit

## Files that will be touched

Currently all 3 pages have `<!-- GHL_CHAT_WIDGET_PLACEHOLDER -->` just before `</body>`. When you give me the snippet, I swap each placeholder for the real `<script>` block and ship.

- [marketing/index.html](marketing/index.html)
- [marketing/ai/index.html](marketing/ai/index.html)
- [marketing/affiliate/index.html](marketing/affiliate/index.html)

Same widget on all three (one snippet, three paste locations). Unless you want separate widgets per product — say so and I'll wire distinct ones.
