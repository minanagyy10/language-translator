# Lingo Relay — Language Translation Tool

A single-page web app for translating text between 30+ languages, with read-aloud and copy-to-clipboard support. No build step, no backend, no API key required.

## Files

| File | What's in it |
|---|---|
| `index.html` | Page structure — the header, the two text panels, language dropdowns, and buttons. Loads `style.css` in the `<head>` and `script.js` at the end of `<body>`. |
| `style.css` | All visual styling — colors, layout, fonts, the swap-button spin animation, responsive rules for mobile. |
| `script.js` | All behavior — the language list, calling the translation API, the swap/copy/speak button logic, and the typing animation on the output text. |
| `README.md` | This file. |

## Features

- Text input with a live character counter (500-character limit per request)
- Source and target language dropdowns with a one-click swap button
- Live translation via the free [MyMemory Translation API](https://mymemory.translated.net/)
- Text-to-speech playback for both the original and translated text, using the browser's built-in speech engine
- One-click copy of the translated text to the clipboard

## Running it locally

Keep all three files (`index.html`, `style.css`, `script.js`) in the same folder, then open `index.html` directly in any modern browser. That's it — there's nothing to install.

## Hosting it for free with GitHub Pages

1. Push this repo to GitHub (see steps in the main chat response).
2. In the repo, go to **Settings > Pages**.
3. Under **Build and deployment**, set **Source** to **Deploy from a branch**, pick the `main` branch and `/ (root)` folder, then **Save**.
4. After a minute, GitHub will give you a live URL like `https://yourusername.github.io/your-repo-name/`.

## Swapping in a different translation API

The app calls MyMemory by default because it works straight from the browser with no key. If you'd rather use Google Cloud's Translation API, see the commented-out example inside `script.js` — note that Google's API expects a server-side call (so your API key isn't exposed publicly), so you'd need a small backend in front of it.

## License

Free to use, modify, and share.