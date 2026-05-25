# Wood & Wine Event RSVP

Custom invitation page + RSVP form + tracker dashboard for the **Wood & Wine Event** on Thursday, June 25, 2026, presented by Sheehan's Office Interiors, Geiger, and MillerKnoll at Something Fishy in Warwick, RI.

## Live URLs

| Page | URL |
|------|-----|
| **Public invitation** (mom shares this) | https://matotezitanka.github.io/wood-wine-rsvp/ |
| **Private tracker** (mom's RSVP dashboard) | https://matotezitanka.github.io/wood-wine-rsvp/tracker.html |
| **GitHub repo** | https://github.com/MatoTeziTanka/wood-wine-rsvp |

## How the system works

```
Invitee opens invitation
    -> Fills inline RSVP form
    -> Form posts silently to Google Form (via hidden iframe)
    -> Page shows "Thank You" without leaving

Google Form receives response
    -> Apps Script trigger (Deb RSVP project) fires
    -> Sends notification email to debbie_petrarca@millerknoll.com
    -> Sends confirmation email to the invitee
    -> Response also appended to linked Google Sheet

Tracker page
    -> Fetches the linked Sheet (published as CSV)
    -> Renders styled table with attending/declined counts
    -> Auto-refreshes every 60 seconds
```

## Repository contents

| File | Purpose |
|------|---------|
| `index.html` | The invitation page (hero, sponsors, details, inline RSVP form) |
| `tracker.html` | The private tracker dashboard |
| `apps-script.gs` | Reference copy of the Apps Script that lives in the "Deb RSVP" project on Google Apps Script |
| `sponsor-banner.png` | The Geiger / Sheehan's / MillerKnoll banner image |
| `favicon.svg` | Wine glass favicon |

## External resources (not in this repo)

* **Google Form** (the form that receives responses): https://docs.google.com/forms/d/1M0Y0czlPR0O1QjgRjD9AkVoLMpgj-nZ48kJgCFyZAEc/edit
* **Linked Google Sheet** (responses + tracker data source): https://docs.google.com/spreadsheets/d/1slWJhcVT_5C-HgE6hzdo4hSorbnE7vsp82U9K257KdY/edit
* **Apps Script project** ("Deb RSVP" at script.google.com): handles email triggers
* **Published CSV URL** (consumed by tracker): published-to-web URL of the Sheet

## Event details

* **Date:** Thursday, June 25, 2026
* **Time:** 5:00 PM to 7:30 PM
* **Venue:** Something Fishy, 175 Metro Center Blvd, Warwick, RI 02886
* **RSVP deadline:** Friday, June 19, 2026
* **Hosts (equal sponsors):** Sheehan's Office Interiors, Geiger, MillerKnoll
* **Organizer / Contact:** Debbie Petrarca, debbie_petrarca@millerknoll.com

## Form field map (Google Form entry IDs)

If editing the inline form in `index.html`, the field names need to match:

| Question | Entry ID |
|----------|----------|
| Will you be joining us? | `entry.883145723` |
| Your name | `entry.811271213` |
| Company name | `entry.849224123` |
| Your email | `entry.233535198` |
| Will you be bringing a guest? | `entry.767099722` |
| Any dietary restrictions or allergies? | `entry.1072631882` |
| Comments or questions? | `entry.1497359468` |

## Editing the page

```bash
cd /home/mato/wood-wine-rsvp
# Edit index.html or tracker.html
git add -A
git commit -m "Describe change"
git push
# GitHub Pages redeploys in 30 to 60 seconds
```

To preview locally before pushing:
```bash
python3 -m http.server 8765
# Open http://localhost:8765 (or http://192.168.12.213:8765 from another machine on LAN)
```

## Editing the Apps Script

The `sendRSVPEmail` trigger function and `setupFormAndConfirmations` setup function live in the **Deb RSVP** project at script.google.com. The local `apps-script.gs` in this repo is a reference copy. If you change the local copy, remember to also paste it into the Apps Script editor and Save (no need to re-run setup unless adding new form fields).

## Origin

Built 2026-05-21 as a custom alternative to the original Google Forms RSVP, which felt too plain. Replaced with an elegant invitation page (wine + wood theme, Cormorant Garamond + Inter typography, deep wine and gold palette) that keeps Google Forms as the silent backend so existing Apps Script email infrastructure continues to work.
