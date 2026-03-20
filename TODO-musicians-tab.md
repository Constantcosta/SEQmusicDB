# Musicians Tab — Roadmap

## Goal
Add a **Musicians** tab to the SEQ Musician Database that profiles individual working musicians in the region, ranked by visibility/activity.

## Data Sources to Research

### Social Media
- **Facebook** — Artist pages, event posts, gig check-ins. Scrape or use Graph API for public pages.
- **Instagram** — Musician profiles, gig stories, tagged venue posts. Hashtags like #brisbanelivemusic, #seqmusic, #goldcoastgigs.
- **TikTok** — Local musician content, covers, gig clips.
- **YouTube** — Channels, live performance videos, subscriber counts.

### Music Platforms
- **Spotify** — Artist profiles, monthly listeners, popular tracks (Spotify API).
- **Bandcamp** — SEQ-based artist pages, releases, sales.
- **SoundCloud** — Local uploads, play counts.
- **Triple J Unearthed** — QLD-based artists, play counts, reviews.

### Gig/Industry Sources
- **Venue websites** — Upcoming gig listings (cross-reference with venues already in the DB).
- **Booking agent rosters** — Cross-reference with agents already in the DB.
- **Eventbrite / Humanitix** — Event listings for SEQ music events.
- **Moshtix** — Ticket listings for SEQ gigs.

### Other
- **Google Business** profiles for musicians/bands.
- **LinkedIn** for session musicians with professional profiles.
- **QMusic** (Queensland Music) directory.
- **Music Queensland** listings.

## Data Model (proposed)

```json
{
  "name": "Jane Smith",
  "type": "solo",
  "instruments": ["vocals", "guitar"],
  "genres": ["indie", "folk"],
  "region": "Brisbane",
  "suburb": "West End",
  "social": {
    "instagram": "https://instagram.com/janesmith",
    "facebook": "https://facebook.com/janesmithmusic",
    "spotify": "https://open.spotify.com/artist/...",
    "website": "https://janesmithmusic.com"
  },
  "activity_score": 85,
  "gigs_per_month": 8,
  "followers": 2400,
  "notes": "Regular performer at The Triffid and Black Bear Lodge..."
}
```

## Hierarchy / Ranking

Rank musicians by an **activity score** based on weighted factors:

| Factor | Weight | Source |
|--------|--------|--------|
| Gigs per month | 30% | Venue listings, social posts |
| Social media followers (combined) | 20% | Instagram, Facebook, TikTok |
| Spotify monthly listeners | 15% | Spotify API |
| Recent releases (last 12 months) | 15% | Spotify, Bandcamp |
| Venue diversity (unique venues played) | 10% | Cross-reference venue DB |
| Agent representation | 10% | Cross-reference agent DB |

## Implementation Steps

1. **Research & data collection** — Start with manual curation of top ~50 musicians per region
2. **Build scraping tools** — Python scripts for public social media data, Spotify API
3. **Cross-reference existing data** — Match acts in `data-acts.json` with individual musician profiles
4. **Design the card layout** — Similar to existing tabs but with social links, activity badges
5. **Add filtering** — By instrument, genre, region, availability, activity level
6. **Automate updates** — Scheduled scraping to keep activity scores current
