<h1 align="center">
  <br/>
  🎓 Smart Student Tools
  <br/>
</h1>

<p align="center">
  <strong>An all-in-one, free, browser-based toolkit built for students.</strong><br/>
  GPA Converter · Attendance Tracker · Grade Calculator · PDF Tools · Image Tools · Calculators · and more.
</p>

<p align="center">
  <a href="https://www.smartstudenttools.xyz/" target="_blank">🌐 Live Site</a> &nbsp;|&nbsp;
  <a href="#-tools--features">Tools</a> &nbsp;|&nbsp;
  <a href="#-tech-stack">Tech Stack</a> &nbsp;|&nbsp;
  <a href="#-getting-started">Getting Started</a> &nbsp;|&nbsp;
  <a href="#-deployment">Deployment</a>
</p>

---

## 📖 About

**Smart Student Tools** is a fast, modern, and completely free web app designed to help students manage their academic life more efficiently. Every tool runs **entirely in the browser** — no login, no account, no data sent to any server.

Built with **React 18 + Vite + Tailwind CSS**, it is optimized for performance, SEO, and mobile-first usage. It covers everything from GPA calculation and attendance tracking to PDF editing and image processing.

> 🔗 Live at **[smartstudenttools.xyz](https://www.smartstudenttools.xyz/)**

---

## 🛠️ Tools & Features

### 🎓 Academic Tools
| Tool | Description |
|------|-------------|
| **GPA / CGPA Converter** | Convert CGPA to Percentage and vice versa across multiple grading systems |
| **Grade Calculator** | Calculate grades, weighted scores, and predict final results |
| **Attendance Tracker** | Track attendance subject-wise and calculate attendance percentage |
| **Backlog Tracker** | Log and monitor pending backlogs and pending subjects |
| **Study Planner** | Plan daily and weekly study schedules |
| **Exam Score Predictor** | Predict exam outcomes based on past performance |
| **Branch Predictor** | Predict engineering branch eligibility based on scores |

### 🧮 Calculators
| Tool | Description |
|------|-------------|
| **Standard Calculator** | Basic arithmetic operations |
| **Scientific Calculator** | Trigonometry, logarithms, powers, and more |
| **Financial Calculator** | EMI, SIP, interest, and investment calculations |
| **Percentage Calculator** | Quick percentage calculations (of, change, ratio) |
| **GST Calculator** | Calculate GST inclusive / exclusive amounts |
| **BMI Calculator** | Body Mass Index calculator with health range info |
| **Printing Cost Calculator** | Estimate printing costs for documents |
| **Currency Converter** | Live currency conversion between world currencies |
| **Unit Converter** | Convert between length, weight, temperature, area, and more |

### 📄 PDF Tools
| Tool | Description |
|------|-------------|
| **Merge PDF** | Combine multiple PDF files into one |
| **Split PDF** | Extract specific pages from a PDF |
| **Lock PDF** | Password-protect your PDF files |
| **Unlock PDF** | Remove password from PDF files |
| **Image to PDF** | Convert images (JPG, PNG, WebP) into a PDF document |

### 🖼️ Image Tools
| Tool | Description |
|------|-------------|
| **Paste Image Converter** | Paste an image from clipboard and convert to any format |
| **Upload Image Converter** | Upload and convert images (PNG, JPG, WebP, AVIF, BMP, ICO) |
| **Resize Image** | Resize images with social media presets and custom dimensions |
| **Compress Image** | Reduce image file size using a quality slider — all in-browser |
| **Image to Text (OCR)** | Extract text from images using AI |
| **Watermark Remover** | Remove watermarks using Gemini AI |

### 📰 Other
- **Blog** — Articles and guides useful for students
- **About, Contact, Privacy Policy, Terms & Conditions** pages

---

## ⚡ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | [React 18](https://react.dev/) |
| **Build Tool** | [Vite 7](https://vitejs.dev/) |
| **Styling** | [Tailwind CSS 3](https://tailwindcss.com/) |
| **Routing** | [React Router DOM v7](https://reactrouter.com/) |
| **PDF Processing** | [pdf-lib](https://pdf-lib.js.org/), [@pdfsmaller/pdf-encrypt](https://www.npmjs.com/package/@pdfsmaller/pdf-encrypt), [@pdfsmaller/pdf-decrypt](https://www.npmjs.com/package/@pdfsmaller/pdf-decrypt) |
| **Image Processing** | Browser Canvas API, [jsPDF](https://github.com/parallax/jsPDF), [html2canvas](https://html2canvas.hertzen.com/) |
| **Charts** | [Chart.js](https://www.chartjs.org/) + [react-chartjs-2](https://react-chartjs-2.js.org/) |
| **Progress UI** | [react-circular-progressbar](https://github.com/kevinsqi/react-circular-progressbar) |
| **SEO** | [react-helmet-async](https://github.com/staylor/react-helmet-async) |
| **Analytics** | [Vercel Analytics](https://vercel.com/analytics), [Google Analytics 4](https://analytics.google.com/), [Microsoft Clarity](https://clarity.microsoft.com/) |
| **Deployment** | [Vercel](https://vercel.com/) |
| **UI Headless** | [@headlessui/react](https://headlessui.com/) |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- npm v9 or higher

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/smartstudenttools.git

# 2. Navigate into the project directory
cd smartstudenttools

# 3. Install dependencies
npm install

# 4. Start the development server
npm run dev
```

The app will be running at **http://localhost:5173**

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start local development server (Vite HMR) |
| `npm run build` | Build optimized production bundle to `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run deploy` | Deploy to GitHub Pages (builds first) |

---

## 📁 Project Structure

```
smartstudenttools/
├── public/                  # Static assets (favicon, fonts, sitemap, manifest)
│   ├── fonts/
│   ├── sitemap.xml
│   ├── robots.txt
│   └── site.webmanifest
│
├── *.jsx                    # All tool components (flat structure)
│   ├── App.jsx              # Root app with routing
│   ├── GPAConverterTool.jsx
│   ├── AttendanceTracker.jsx
│   ├── GradeCalculator.jsx
│   ├── CompressImageTool.jsx
│   ├── ResizeImageTool.jsx
│   ├── MergePdfTool.jsx
│   └── ...                  # 40+ components
│
├── imageConversion.js       # Canvas-based image conversion utilities
├── imageUtils.js            # Image helper functions
├── blogData.js              # Blog articles data
├── index.html               # App entry HTML with SEO meta tags
├── main.jsx                 # React DOM entry point
├── index.css                # Global styles
├── tailwind.config.js       # Tailwind configuration
├── vite.config.js           # Vite build configuration
├── vercel.json              # Vercel SPA rewrite rules
└── package.json
```

---

## 🌐 Deployment

### Deploy to Vercel (Recommended)

The project includes a `vercel.json` config for proper SPA routing. Simply connect your GitHub repo to Vercel and it will auto-deploy on every push.

```bash
# Or install Vercel CLI and deploy manually
npm i -g vercel
vercel --prod
```

### Deploy to GitHub Pages

```bash
npm run deploy
```

This runs `npm run build` first, then pushes the `dist/` folder to the `gh-pages` branch using [gh-pages](https://github.com/tschaub/gh-pages).

> ⚠️ For GitHub Pages, make sure to set the correct `base` path in `vite.config.js` if deploying to a sub-path.

---

## 🔑 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_GA_MEASUREMENT_ID` | Google Analytics 4 Measurement ID | `G-S6V4E7B4RD` |

Create a `.env` file in the root:

```env
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

1. **Fork** the repository
2. **Create** a feature branch — `git checkout -b feature/new-tool`
3. **Commit** your changes — `git commit -m "feat: add new tool"`
4. **Push** to the branch — `git push origin feature/new-tool`
5. **Open** a Pull Request

Please make sure your code follows the existing component structure and is mobile-responsive.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 🙌 Acknowledgements

- [React](https://react.dev/) — UI library
- [Vite](https://vitejs.dev/) — Lightning fast build tool
- [Tailwind CSS](https://tailwindcss.com/) — Utility-first CSS framework
- [pdf-lib](https://pdf-lib.js.org/) — In-browser PDF manipulation
- [Vercel](https://vercel.com/) — Hosting and deployment

---

<p align="center">
  Made with ❤️ for students everywhere &nbsp;·&nbsp;
  <a href="https://www.smartstudenttools.xyz/">smartstudenttools.xyz</a>
</p>
