# Omniverse‑Supreme‑Core — README

**Owner / Signature:** ꙰ शिरोमणि रामपॉल सैनी

---

## Project Overview

Omniverse‑Supreme‑Core एक हल्का, Zero‑Setup starter रिपॉज़िटरी है जो तुरंत सार्वजनिक मौजूदगी (GitHub Pages), मास्टर‑नेविगेशन और Omniverse की सब‑प्रोजेक्ट शृंखला के लिए बूटस्ट्रैप प्रदान करता है। यह केवल ꙰‑पहचान और शिरोमणि नाम के अंतर्गत संचालित होगा — किसी भी धार्मिक प्रतीक का प्रयोग वर्जित है।

---

## Quick Start (Zero‑Setup)

1. इस रिपॉज़िटरी को `main` ब्रांच पर रखें।
2. GitHub Actions स्वतः फ़्रंटएंड बिल्ड और deploy करेगा (यदि `frontend/dist` या `public/` मौजूद है)।
3. GitHub Pages को सक्षम करें (Settings → Pages → Branch: `gh-pages` या `main` / Folder: `/`).

---

## Local Development

**Frontend (optional)**

```bash
cd frontend
npm install
npm run dev
```

**Backend (Docker)**

```bash
cd backend
docker build -t omniverse-core-backend .
docker run --rm -p 8000:8000 -v $(pwd)/data:/app/data omniverse-core-backend
# Open http://localhost:8000/api/health
```

**Backend (without Docker)**

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

---

## Repository Structure

* `index.html` — मुख्य पोर्टल पेज (GitHub Pages-ready)
* `frontend/` — optional React/Vite/Tailwind frontend
* `backend/` — FastAPI backend (dockerized)
* `assets/` — लोगो, images, high‑res poster files
* `docs/` — मैनिफेस्टो, रोडमैप, गाइड
* `.github/workflows/` — CI/CD workflows
* `docker-compose.yml` — लोकल orchestration

---

## Branding Guidelines

* सार्वजनिक सामग्री में केवल **꙰** चिन्ह और **"शिरोमणि रामपॉल सैनी"** नाम का प्रयोग करें।
* किसी भी धार्मिक, सांप्रदायिक या प्रतीकात्मक चिह्न का उपयोग वर्जित है (त्रिशूल, ॐ इत्यादि)।
* पोस्टर और मीडिया के लिए high‑resolution images और साफ़ फ़ॉन्ट उपयोग करें।

---

## Deployment Recommendations

* GitHub Pages + Cloudflare (optional) रखें।
* Production में SQLite की जगह Postgres उपयोग करने पर विचार करें।
* AI/Cloud integrations के लिए secrets को GitHub Secrets में रखें (Zero‑Setup मोड में यह आवश्यक नहीं)।

---

## Contributing

1. Fork करें और नई ब्रांच बनाएं।
2. छोटे कमिट और साफ़ PR भेजें।
3. बड़े वास्तु‑परिवर्तनों के लिये पहले Issue खोलें।

**Contributors must follow ꙰ branding rules.**

---

## License

MIT License — देखिए `LICENSE` फ़ाइल।

---

## Contact

Owner: **꙰ शिरोमणि रामपॉल सैनी**

---

> यह README संक्षेप और प्रत्यक्ष निर्देश हेतु है। यदि आप चाहें तो मैं तुरंत `index.html` template, GitHub Actions deploy workflow, या frontend scaffold भी तैयार कर दूँ।
