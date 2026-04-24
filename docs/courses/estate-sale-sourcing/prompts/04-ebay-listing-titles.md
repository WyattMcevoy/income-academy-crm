# Prompts — eBay Listing Titles

eBay's search algorithm rewards keyword-rich titles that match how buyers actually search. Use these prompts to generate titles that get clicks.

## ES-30: Write an eBay title that ranks

```
Write an 80-character eBay title for this item:
- Item: [ITEM NAME]
- Brand / maker: [BRAND]
- Model / pattern name: [MODEL]
- Size / dimensions: [SIZE]
- Condition: [CONDITION — "excellent vintage" / "used with wear" etc.]
- Era / year if known: [YEAR]
- Any unusual or desirable features: [FEATURES]

Rules:
- Use EVERY character up to 80 (eBay's limit)
- Front-load the most searched keywords (brand + model + item type)
- Include condition descriptor where it matters
- Use legitimate buyer search terms, not jargon
- No ALL CAPS except for acronyms/brand names
- No spam words ("L@@K", "WOW", "RARE!!!" etc.)
- Avoid duplicate words

Generate 3 title variations ordered by likely best performer.
```

## ES-31: Title for a hard-to-describe item

```
I have an item that's hard to categorize:
[DESCRIBE ITEM IN DETAIL — what it looks like, what you think it
might be, markings, approximate era, size, condition]

I'm not sure exactly what it is. Help me:
1. Identify what it most likely IS (or give me 2-3 possibilities)
2. What are the search terms buyers would use to find each
   possibility?
3. Write an 80-char title that captures the MOST LIKELY
   identification + backup keywords for other interpretations
4. Suggest the best eBay category path

If I need to look at it more closely to identify, tell me exactly
what details would help you.
```

## ES-32: Title for a vintage clothing item

```
Vintage clothing listing. Item:
- Type: [DRESS / SHIRT / COAT / etc.]
- Era: [DECADE — e.g., "1960s" or "1970s"]
- Brand/tag: [WHATEVER'S ON THE TAG — may say "ILGWU" or "Union Made
  USA" or a specific brand]
- Size as marked: [VINTAGE SIZE — e.g., "vintage size 12"]
- Modern equivalent size if measured: [MODERN SIZE — e.g., "modern
  women's 6-8"]
- Style details: [e.g., "mod" / "mid-century" / "boho" / "western"]
- Condition: [CONDITION]
- Fabric: [FABRIC]

Write an 80-character title including the era, modern size (critical
for vintage buyers), style aesthetic, and any noteworthy detail.
Vintage clothing buyers search by decade + style + size — prioritize
those.

Give me 3 variations.
```

## ES-33: Titles for tool collectibles

```
Vintage tool listing:
- Maker: [STANLEY / MILLERS FALLS / STARRETT / etc.]
- Tool type: [HAND PLANE / COMBINATION SQUARE / etc.]
- Model number: [FROM THE TOOL — e.g., "No. 4" or "450"]
- Era (if known from maker's marks): [ERA]
- Condition: [user condition / collector condition]
- Country of origin: [IMPORTANT — USA-made Stanley planes pre-1970
  are worth more]

Write an 80-char eBay title. Tool collectors search for very specific
combinations of maker + model + era + country-of-origin. Prioritize
those.

Note: collector-grade vs. user-grade buyers search differently.
Include both sets of keywords if the item could appeal to either.
Generate 3 variations.
```

## ES-34: Title for Pyrex / glassware

```
Pyrex/glassware listing:
- Pattern name: [PATTERN — e.g., "Snowflake Blue"]
- Piece type: [CASSEROLE / MIXING BOWL / REFRIGERATOR DISH / etc.]
- Size: [SIZE / CAPACITY — e.g., "1.5 quart" or "4 cup"]
- Era: [APPROXIMATE — Pyrex collectors care: 1950s, 1960s, 1970s]
- Condition: [CONDITION with specifics on common Pyrex issues:
  utensil marks, dishwasher dulling, chips]
- Complete set or single piece: [SPECIFY]

Write 3 different 80-char eBay title variations. Pyrex buyers search
by pattern name + piece type + size — those are mandatory. Era is
optional but helps.
```
