# Spotify Roaster

A modern, responsive, and hilarious web application built with **Next.js App Router** and styled with **Tailwind CSS**. It securely connects to the Spotify Web API to analyze your music taste (top tracks, top artists, vibe features, and recently played tracks) and delivers a savage, sarcastic AI-generated roast card.

---

## Key Features

- **OAuth Authorization Flow**: Fully secure backend-side token exchange. Client secrets never touch the browser.
- **Vibe Analysis**: Calculates your track popularity, top genres, energy levels, and mood valence (happiness index).
- **Parallel Fetching**: Queries all Spotify profile statistics concurrently using `Promise.all` to ensure zero API latency overhead.
- **Dynamic OG Image Sharing**: Automatically generates high-fidelity visual cards for Twitter/X/Discord sharing previews using Next.js `next/og` (built-in Satori ImageResponse).
- **AI Upgrade Panel**: Generate highly customized AI roasts directly in the dashboard by pasting a Gemini API key.
- **Local JSON Database**: Persists generated roasts indefinitely inside `data/roasts.json` so share links remain public and revisitable.

---

## Step-by-Step Local Setup

### 1. Register Spotify App
Spotify's OAuth service enforces strict security guidelines and **no longer supports `localhost` redirects**. You must use loopback IP `127.0.0.1` instead.

1. Go to the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard) and log in.
2. Click **Create App** in the top right.
3. Fill in details (e.g., Name: `Spotify Roaster`, Description: `AI-powered music roaster`).
4. Set the **Redirect URI** to:
   ```text
   http://127.0.0.1:3000/api/auth/callback
   ```
5. **CRITICAL STEP**: Click the **Add** button next to the input field so the URI appears in the list below it, then scroll to the bottom and click the green **Save** button.
6. Under your app page, go to **Settings** and copy the **Client ID** and **Client Secret**.

---

### 2. Configure Environment Variables
Create a file named `.env.local` in the project root folder (you can use [.env.local](file:///home/whysooraj/Projects/spotify-roaster/.env.local) as a template):

```env
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
SPOTIFY_REDIRECT_URI=http://127.0.0.1:3000/api/auth/callback

# Google Gemini API Credentials
# Get a key at https://aistudio.google.com
# Leave blank to fall back to the offline rule-based roaster engine
GEMINI_API_KEY=your_gemini_api_key
```

---

### 3. Run the Project
1. Install dependencies (if not done yet):
   ```bash
   npm install
   ```
2. Start the Next.js development server explicitly listening on loopback IP `127.0.0.1`:
   ```bash
   npm run dev -- --hostname 127.0.0.1
   ```
3. Open your browser to: [http://127.0.0.1:3000](http://127.0.0.1:3000)
4. Click **Connect Spotify & Roast Me** to authorize and view your roast!
