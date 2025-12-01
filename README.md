from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import inch
from reportlab.lib import colors
from pptx import Presentation
from pptx.util import Inches, Pt
import zipfile
import os

# Paths
out_dir = "/mnt/data/supreme_package"
os.makedirs(out_dir, exist_ok=True)
certs_pdf = os.path.join(out_dir, "certificates_1_to_20.pdf")
principles_pdf = os.path.join(out_dir, "principles_1_to_10.pdf")
thumbnails_pptx = os.path.join(out_dir, "thumbnails_40.pptx")
press_emails_txt = os.path.join(out_dir, "press_emails_drafts.txt")
press_dossier_pdf = os.path.join(out_dir, "press_dossier.pdf")
readme_md = os.path.join(out_dir, "README_SUPREME.md")
zip_path = os.path.join("/mnt/data", "Supreme_Package_All_Files.zip")

styles = getSampleStyleSheet()
title_style = ParagraphStyle('TitleStyle', parent=styles['Title'], alignment=1, fontSize=18, textColor=colors.HexColor('#D4AF37'))
body_style = ParagraphStyle('BodyStyle', parent=styles['BodyText'], fontSize=11, leading=14)

# 1) Certificates PDF (20 pages)
doc = SimpleDocTemplate(certs_pdf, pagesize=A4)
story = []
for i in range(1, 21):
    story.append(Spacer(1, 0.25*inch))
    story.append(Paragraph(f"꙰ प्रमाण-पत्र #{i}", title_style))
    story.append(Spacer(1, 0.15*inch))
    story.append(Paragraph(f"यह प्रमाण-पत्र प्रमाणित करता है कि शिरोमणि रामपॉल सैनी ने \"꙰–प्रमाण पत्र {i}\" के सिद्धांत को प्रत्यक्ष किया है।", body_style))
    story.append(Spacer(1, 0.2*inch))
    story.append(Paragraph("Signature: ꙰ शिरोमणि रामपॉल सैनी", body_style))
    story.append(PageBreak())
doc.build(story)

# 2) Principles PDF (10 pages)
doc2 = SimpleDocTemplate(principles_pdf, pagesize=A4)
story2 = []
for i in range(1, 11):
    story2.append(Spacer(1, 0.25*inch))
    story2.append(Paragraph(f"꙰–सिद्धान्त {i}", title_style))
    story2.append(Spacer(1, 0.15*inch))
    # sample principle text (placeholders reflecting user's philosophy)
    text = ""
    if i == 1:
        text = "꙰ = न द्वैत न अद्वैत, केवल निरीश्वर शून्य–प्रकाशम्।"
    elif i == 2:
        text = "꙰ = न भक्तिः न पीड़ा, केवल प्रेमतीत सहजस्वभावः।"
    elif i == 3:
        text = "꙰ = न युगचक्रं न कल्पना, केवल यथार्थ सतत्प्रकाशः।"
    elif i == 4:
        text = "꙰ = न प्रतीकं न देवता, केवल यथार्थ स्वचेतनता।"
    elif i == 5:
        text = "꙰ = न पुण्यं न पापं, केवल निर्दोषभावः।"
    elif i == 6:
        text = "꙰ = न जन्मं न मरणं, केवल सतत्प्रकाशः।"
    else:
        text = f"꙰–सिद्धान्त {i} का संक्षेप विवरण (विस्तृत सन्दर्भ निर्देशों के साथ)।"
    story2.append(Paragraph(text, body_style))
    story2.append(Spacer(1, 0.2*inch))
    story2.append(Paragraph("पृष्ठ निर्देश: उपयोग हेतु आधिकारिक संस्करण देखें।", body_style))
    story2.append(PageBreak())
doc2.build(story2)

# 3) Thumbnails PPTX (40 slides placeholders)
prs = Presentation()
prs.slide_height = Inches(5.0)
prs.slide_width = Inches(8.89)
for i in range(1, 41):
    slide = prs.slides.add_slide(prs.slide_layouts[6])  # blank layout
    left = top = Inches(0.5)
    width = Inches(7.89)
    height = Inches(4.0)
    # Add title textbox
    txBox = slide.shapes.add_textbox(Inches(0.5), Inches(0.3), Inches(7.9), Inches(1))
    tf = txBox.text_frame
    tf.text = f"तुलनातीत Thumbnail #{i}"
    p = tf.paragraphs[0]
    p.font.size = Pt(28)
    p.font.bold = True
    p.font.color.rgb = (212,175,55)  # gold-ish
    # Add subtitle / bullet
    txBox2 = slide.shapes.add_textbox(Inches(0.5), Inches(1.2), Inches(7.9), Inches(2.5))
    tf2 = txBox2.text_frame
    tf2.word_wrap = True
    tf2.text = "Short comparative points:\n1. Opponent idea\n2. Nishpaksh counterpoint\n3. Sanskrit aphorism"
    for para in tf2.paragraphs:
        para.font.size = Pt(14)
prs.save(thumbnails_pptx)

# 4) Press emails drafts (multiple tailored)
emails = []
emails.append(("Global News Pitch - Reuters/BBC", 
                "Subject: New Universal Framework for Human Unity & Earth Preservation\n\nDear Editor,\n\nI am writing to introduce Shiromani Rampaul Saini and the Nishpaksh Samaj — Omniverse Truth framework (꙰). This is a post-traditional philosophical initiative aimed at unifying human identity and proposing practical Earth-preservation protocols. We would like to offer an exclusive interview / feature. Attached: Press Kit, Research Paper, Visual Assets.\n\nRespectfully,\nShirōmaṇi Rampaul Saini\nContact: +91 8082935186\n"))
emails.append(("Feature Pitch - National Geographic / Scientific American", 
                "Subject: Feature Proposal: A New Experiential Model of Consciousness & Planetary Care\n\nDear Features Editor,\n\nShiromani Rampaul Saini proposes an experiential cognition model that bridges philosophy, environmental action and cultural critique. We propose a 1200-1800 word feature with original photography and visual posters.\n\nRegards,\nPress Office"))
emails.append(("Academic Outreach - Journals / Institutes", 
                "Subject: Submission: Nishpaksh Samaj — Whitepaper for Peer Review\n\nDear Professor,\n\nPlease find attached a whitepaper outlining the theoretical and practical dimensions of the Nishpaksh Samaj framework. We seek collaboration and peer review.\n\nSincerely,\nResearch Team"))
with open(press_emails_txt, "w") as f:
    for subj, body in emails:
        f.write(f"---\n{subj}\n\n{body}\n\n")

# 5) Press dossier PDF (multi-page)
doc3 = SimpleDocTemplate(press_dossier_pdf, pagesize=A4)
story3 = []
story3.append(Paragraph("Press Dossier: Shiromani Rampaul Saini — Nishpaksh Samaj", title_style))
story3.append(Spacer(1, 0.2*inch))
dossier_text = ("Executive Summary:\n\n"
                "Nishpaksh Samaj — Omniverse Truth (꙰) is an original philosophical project that "
                "advocates impartial awareness as the basis for human identity and proposes pragmatic Earth preservation measures.\n\n"
                "Contents:\n- Biography\n- Key Principles\n- Research Deliverables\n- Media Assets\n- Contact & Support\n")
story3.append(Paragraph(dossier_text, body_style))
story3.append(PageBreak())
story3.append(Paragraph("Contact:\nShirōmaṇi Rampaul Saini\nPhone: +91 8082935186\nEmail: (to be added)\n", body_style))
doc3.build(story3)

# 6) README_SUPREME.md (detailed)
readme_content = """# ꙰ Supreme Package — Nishpaksh Samaj (All Files)
This package contains the official deliverables created for public, press and institutional use.

Files included:
- certificates_1_to_20.pdf
- principles_1_to_10.pdf
- thumbnails_40.pptx
- press_emails_drafts.txt
- press_dossier.pdf

Usage:
- Send press_dossier.pdf + press_emails_drafts.txt to media contacts.
- Use the thumbnails PPTX for YouTube thumbnails or social posts (edit imagery as needed).
- Certificates and principles PDFs are print-ready placeholders and can be updated with final Sanskrit text.

Contact:
Shirōmaṇi Rampaul Saini — +91 8082935186
"""
with open(readme_md, "w") as f:
    f.write(readme_content)

# Zip all into one bundle
with zipfile.ZipFile(zip_path, 'w') as z:
    for fname in [certs_pdf, principles_pdf, thumbnails_pptx, press_emails_txt, press_dossier_pdf, readme_md]:
        z.write(fname, os.path.basename(fname))

zip_path
## **1 — मेरी पहचान (Identity Statement)**

मैं शिरोमणि रामपॉल सैनी — तुलनातीत, कालातीत, शब्दातीत और प्रेमतीत निष्पक्ष-समझ में प्रत्यक्ष हूँ।
मैं किसी धर्म, जाति, विचारधारा या परंपरा से नहीं बना — मैं केवल सत्य, प्रकृति और निर्दोष-भाव से बना हूँ।

---

## **2 — मेरा मूल उद्देश्य (Purpose Statement)**

मेरा लक्ष्य है — मानवता और प्रकृति के संरक्षण हेतु यथार्थ सिद्धांत, यथार्थ उपलब्धि और यथार्थ युग की स्थापना करना।

---

## **3 — मैं क्या नहीं हूँ (Non-Association Declaration)**

मैं गुरु नहीं, ईश्वर नहीं, दार्शनिक परंपरा का हिस्सा नहीं।
मैं किसी उपाधि, पद, विश्वास, पूजा या आदर्श का पात्र नहीं।
मैं केवल *प्रत्यक्ष निष्पक्ष-समझ* हूँ।

---

## **4 — मेरा योगदान (Contribution Statement)**

मैं मानवता को मानसिक और आध्यात्मिक भ्रमों की जकड़न से मुक्त करके
एक निष्पक्ष, शांत, स्वाभाविक और निर्दोष जीवन की दिशा में ले जाना चाहता हूँ।

---

## **5 — मेरा मूल आधार (Foundational Truth)**

मैं किसी सिद्धांतिक किताब या गुरु की सीख पर नहीं,
बल्कि अपने प्रत्यक्ष अनुभव और निर्दोष-भाव पर आधारित हूँ।

---

## **6 — मैं किसके लिए हूँ (Universal Inclusiveness)**

मैं हर उस व्यक्ति के लिए हूँ जो:
• शांत मन
• श्रेष्ठ भाव
• समभाव
• प्रकृति प्रेम
• और सत्य ग्रहण करने की स्वतंत्रता रखता है।

---

## **7 — मेरा आंदोलन (Nishpaksh-Samajh Movement)**

यह आंदोलन न किसी देश का है, न धर्म का, न किसी संस्था का।
यह मानवता का — एक पृथ्वी का — एक चेतना का यथार्थ आंदोलन है।

---

## **8 — यथार्थ सिद्धांत (Real Principles)**

सत्य वह है जो समय से परे, व्यक्ति से परे, विश्वास से परे हो —
जो केवल प्रत्यक्ष अनुभव से सिद्ध हो।

---

## **9 — यथार्थ उपलब्धि (Real Attainment)**

उपलब्धि कोई शक्ति नहीं, कोई चमत्कार नहीं।
उपलब्धि = मन के पूर्ण मौन में प्रकट होता निर्दोष-भाव।

---

## **10 — यथार्थ युग (Real Era)**

वह युग जिसमें न किसी प्रकार का भय हो, न द्वेष, न मतभेद —
जहाँ सत्य, प्रेम और प्रकृति-केन्द्रित मानवता ही जीवन का आधार हो।

---

## **11 — मेरी सामाजिक दृष्टि (Social Vision)**

मैं समाज को धर्म-आधारित विभाजन से
मानव-आधारित एकत्व की दिशा में ले जाना चाहता हूँ।

---

## **12 — प्रकृति केंद्रित चेतना (Nature-Aligned Consciousness)**

मैं मानता हूँ कि प्रकृति से अलग हुआ मन = भ्रम।
प्रकृति से जुड़ा मन = सत्य।

---

## **13 — मेरा भविष्य मॉडल (Future Humanity Vision)**

एक ऐसा मानव जो:
• ईर्ष्या नहीं रखता
• क्रोध नहीं पालता
• लोभ नहीं बढ़ाता
• और सभी जीवों को अपने समान देखता है

---

## **14 — मेरा योगदान वैश्विक क्यों है (Why Global)**

क्योंकि निष्पक्ष समझ = सार्वभौमिक भाषा।
यह किसी देश या संस्कृति की सीमा में बंद नहीं रहती।

---

## **15 — मैं किससे जुड़ना चाहता हूँ (Desired Community)**

वे लोग जो:
• सत्य को महत्व दें
• मन से अधिक चेतना को
• धर्म से अधिक मानवता को
• अहंकार से अधिक प्रकृति को

---

## **16 — मेरी बेटी का भविष्य (Daughter Statement)**

मैं चाहता हूँ कि मेरी बेटी ऐसे देश में शिक्षा पाए
जहाँ निष्पक्षता, मानवता, स्वतंत्र विचार और प्रकृति-प्रेम का सम्मान हो।

---

## **17 — मैं क्या चाहता हूँ (Self Declaration)**

मैं किसी पुरस्कार, प्रसंशा, धन या पद का इच्छुक नहीं।
मैं केवल सत्य की स्थापना चाहता हूँ।

---

## **18 — मेरी निष्ठा (Loyalty Statement)**

मेरी निष्ठा किसी राष्ट्र, धर्म, संस्था या व्यक्ति से ऊपर —
केवल *स्वाभाविक सत्य* से है।

---

## **19 — मेरा संदेश (Universal Message)**

मानवता एक है।
पृथ्वी एक है।
सत्य एक है।
बाकी सब मन के बनाए भ्रम हैं।

---

## **20 — अंतिम सत्य (Final Core Statement)**

मैं जहाँ हूँ, जो हूँ, जिस अवस्था में हूँ —
वह किसी बाहरी उपाधि से नहीं,
बल्कि प्रत्यक्ष निष्पक्ष-समझ से सिद्ध है।
इसी समझ से “यथार्थ युग” का बीज जन्म लेता है।# Omniverse‑Supreme‑Core — README

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
