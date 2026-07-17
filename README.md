# Bright Moments Site

A public gallery, a password-protected upload dashboard for colleagues, and an
admin review page, all in one Netlify site with no extra paid services.

## What's in here
- **index.html** : the public Bright Moments gallery. This is the page your
  flyer's QR code should point to. It shows a couple of pinned, curated
  stories plus anything colleagues have submitted and you've approved.
- **upload.html** : the password-protected page colleagues use to submit a
  photo or a Vimeo video link, with a title and caption. Submissions go into
  a pending queue, nothing appears publicly until approved.
- **admin.html** : the password-protected review page. Approve items to
  publish them to the public gallery, or reject ones that shouldn't go live.
- **flyer.html** : the print flyer with the QR code.
- **netlify/functions/** : the serverless backend (login, upload, list,
  approve, and media-serving). This is what makes uploads and moderation
  actually work; it needs to be deployed to Netlify, not just opened as a
  local file.

## How it works, in plain terms
- Colleagues log in on `/upload` with one shared password and submit a photo
  (uploaded directly) or a video (they upload it to Vimeo first, then paste
  the link, since large video files don't fit through a web form well).
- Every submission is saved as "pending" and is invisible to the public.
- Whoever manages this logs into `/admin` with the same password, reviews
  each pending item, and clicks Approve or Reject.
- Approved items automatically show up on the public gallery at `/`, no
  redeploying required.

## One-time setup (about 15 minutes)

You'll need Node.js installed on your computer and a free Netlify account.

**1. Install the Netlify command-line tool** (one time, in any terminal):
```
npm install -g netlify-cli
netlify login
```
This opens a browser window to connect your Netlify account.

**2. Install this project's one dependency**, from inside this folder:
```
npm install
```

**3. Create the site and deploy it**:
```
netlify deploy --prod
```
The first time, it'll ask if you want to create a new site, say yes, and give
it a name (e.g. `luminary-bright-moments`). This gives you your live URL,
like `https://luminary-bright-moments.netlify.app`.

**4. Set your two passwords/secrets.** In the Netlify dashboard for your new
site, go to **Site configuration > Environment variables** and add:

| Key | Value |
|---|---|
| `UPLOAD_PASSWORD` | The shared password colleagues and admins will type in to log in. Pick something easy to say over the phone, e.g. a short phrase. |
| `AUTH_SECRET` | Any long random string, just used internally to sign login sessions. Mash the keyboard for 20+ characters. |

**5. Redeploy** so the new environment variables take effect:
```
netlify deploy --prod
```

That's it. Netlify Blobs (the storage for uploaded photos and the list of
submissions) works automatically once deployed, no extra account or API key
needed.

## Sharing the links
- Share **`https://your-site.netlify.app/upload`** with colleagues, along
  with the `UPLOAD_PASSWORD` (send that part separately, e.g. by text, not
  in the same email as the link).
- Keep **`https://your-site.netlify.app/admin`** and the password limited to
  whoever is doing the reviewing.
- Point your flyer's QR code and any public sharing at
  **`https://your-site.netlify.app/`** (the plain root URL), which is the
  public gallery.

## Limits worth knowing about
- Photos upload directly through the form; keep them under about 4.5MB
  (the form will warn if a file is too big). Most phone photos are fine;
  very high-resolution camera files may need to be resized first.
- Videos aren't uploaded through this form at all, they go to Vimeo first
  (which is built for exactly this) and only the link comes through here.
- The shared password is the same for uploading and reviewing right now.
  If you'd like separate passwords for colleagues vs. reviewers down the
  road, that's a small change I can make.

## Updating the logo
The logo is embedded directly in each HTML file as image data, so there's no
separate logo file to manage. If you get an updated logo, send it over and
I'll re-embed it everywhere at once.

## Consent reminder
Since real patients, families, and facilities may be identifiable, make sure
whoever is approving submissions in `/admin` is confirming a signed
photo/video release is on file before clicking Approve.
