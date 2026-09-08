# Mythologica

A Greek mythology and religion encyclopedia with a Gemini-powered chat assistant.

## Features

- Greek gods, heroes, events, and religion topics
- Search and category filters
- Character relationships and sources
- One shared Gemini chat for the Greek collection
- Static JSON content with a small serverless API function
- Responsive light museum-style interface

## Requirements

- Node.js 20 or newer
- A Google Gemini API key

## Local Setup

Install dependencies once:

```powershell
npm install
```

Create a `.env` file in the project root:

```env
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-3.6-flash
```

Start the local server:

```powershell
npm start
```

Open:

```text
http://localhost:3000/#/browse
```

You can also double-click `start-mythologica.bat` on Windows. It installs dependencies if necessary, starts the server, and opens the app.

## Vercel Deployment

1. Push the project to GitHub. Do not commit `.env` or `node_modules`.
2. Import the repository into Vercel.
3. Choose **Other** as the framework preset.
4. Leave the build command and output directory empty.
5. Add these Vercel environment variables:

```text
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-3.6-flash
```

6. Deploy the project.

Vercel automatically serves the static frontend and runs `api/ask.js` as the Gemini serverless function. After deployment, open:

```text
https://your-project.vercel.app/#/browse
```

## Project Structure

```text
index.html       Main application shell
script.js        Frontend routing, rendering, search, and chat UI
style.css        Site styling
api/ask.js       Gemini serverless API function
server.js        Local development server
data/            Encyclopedia JSON files
images/          Local image assets
```

Never place the Gemini API key in frontend JavaScript or commit it to GitHub. If a key is exposed, disable it and create a replacement key.
