// ----------------------------
// HARD-CODED GROQ API KEY
// ----------------------------
const apiKeyInput = document.getElementById("userApiKey");

// Load saved key
apiKeyInput.value = localStorage.getItem("GROQ_API_KEY") || "";

// Save on change
apiKeyInput.addEventListener("input", () => {
  localStorage.setItem("GROQ_API_KEY", apiKeyInput.value.trim());
});



const MODEL = "llama-3.3-70b-versatile";

// ----------------------------
// TEMPLATE PROMPTS (BEGINNER-FRIENDLY)
// ----------------------------

const oliviaPrompt = `
YOU ARE AN EXPERT RESUME BUILDER AND ATS OPTIMIZATION ENGINE.

THIS PROMPT IS EXECUTED INSIDE AN AUTOMATED SYSTEM.
YOUR OUTPUT IS SENT DIRECTLY TO THE GROQ API AND WRITTEN INTO AN IFRAME.

====================================================
ABSOLUTE RULES — MUST FOLLOW EXACTLY

1. Output ONLY valid HTML.
2. NO markdown, NO explanations, NO backticks.
3. Must start with <html> and end with </html>.
4. Resume MUST fit EXACTLY one A4 page (210mm × 297mm).
5. No overflow, no scrolling.
6. USE THE PROVIDED HTML AND CSS EXACTLY.
7. ONLY replace text content using extracted user data.

FAILURE TO FOLLOW ANY RULE = INVALID OUTPUT.

====================================================
AUTO-EXTRACT USER INFORMATION (MANDATORY)
====================================================
From PERSONAL_INFO, extract and clean:
- Full Name
- Job Title (infer from experience if missing)
- Phone
- Email
- GitHub (convert to clickable link if present)
- LinkedIn (convert to clickable link if present)
- Location

====================================================
CRITICAL LOGIC: "SMART SHRINK" & CONTENT

1. **AUTO-RESIZE LOGIC (MANDATORY):**
   - **Analyze the Input Volume:** Look at the number of Experience entries and Projects.
   - **IF VOLUME IS HIGH** (>3 Jobs OR >3 Projects OR very long bullet points):
     - You MUST render the body tag as: <body class="compact-mode">.
     - This triggers specific CSS to reduce page margins and fonts to fit 1 page.
   - **IF VOLUME IS NORMAL:**
     - Render the body tag as: <body>.

2. **CONTENT REWRITING:**
   - Rewrite weak sentences into strong, achievement-based bullets.
   - Fix grammar, tense, formatting.
   - Remove filler words.
   - **Keep it concise:** If the resume is long, trim bullet points to 1 line each.

3. **SECTION FORMATTING:**
   - **Experience:** Company | Role | Dates
   - **Projects:** Name | Tech Stack | Bullets
   - **Skills:** Categorized (Languages, Frontend, Backend, etc.)

====================================================
USER DATA TO INSERT
====================================================
[PERSONAL_INFO]
[EDUCATION]
[EXPERIENCE]
[PROJECTS]
[SKILLS]
[EXTRACURRICULAR]
[LANGUAGES]

====================================================
USE THIS EXACT HTML TEMPLATE BELOW
(DO NOT CHANGE STRUCTURE - ONLY TEXT)
====================================================
<html>
<head>
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

/* ---------- GLOBAL ---------- */
@page { size: A4; margin: 0; }

body {
  font-family: 'Inter', sans-serif;
  margin: 0;
  padding: 0;
  background: #fff;
  color: #333;
  line-height: 1.48;
  display: flex;
  justify-content: center;
  min-height: 100vh;
}

html, body {
  width: 210mm;
  height: 297mm; /* Fixed A4 height */
  overflow: hidden; /* Prevent overflow */
}

/* CONTAINER */
.resume-wrapper {
  width: 210mm;
  min-height: 297mm;
  padding: 35px 50px;
  box-sizing: border-box;
  background: white;
  margin: 0 auto;
}

/* COMPACT MODE (Triggered by AI if content is long) */
body.compact-mode .resume-wrapper {
    padding: 20px 40px;
    line-height: 1.35;
}
body.compact-mode .section { margin-bottom: 12px; }
body.compact-mode .header { margin-bottom: 12px; }
body.compact-mode .header h1 { font-size: 26px; margin: 0 0 2px 0; }

/* Compact Fonts */
body.compact-mode .left p, 
body.compact-mode .left li, 
body.compact-mode .job-bullets li, 
body.compact-mode .project-bullets li,
body.compact-mode .summary-text,
body.compact-mode .edu-institution,
body.compact-mode .edu-list li { 
    font-size: 11.5px; 
    margin-bottom: 2px;
}
/* Hierarchy Maintenance in Compact Mode */
body.compact-mode .section-title { font-size: 14px; margin-bottom: 5px; } /* Smaller but bold */
body.compact-mode .job-title, body.compact-mode .project-title { font-size: 12.5px; } /* Distinctly smaller */
body.compact-mode .job-block, body.compact-mode .project-block { margin-bottom: 8px; }


/* ---------- HEADER ---------- */
.header {
  text-align: center;
  margin-bottom: 22px;
}

.header h1 {
  font-size: 32px;
  font-weight: 600;
  letter-spacing: 2.6px;
  margin: 0 0 4px 0;
  color: #222;
  text-transform: uppercase;
}
.header h2 {
  font-size: 14px;
  font-weight: 400;
  letter-spacing: 2px;
  margin-top: 4px;
  color: #666;
}

.header-divider {
  margin-top: 15px;
  border-bottom: 1px solid #E5E5E5;
}

/* ---------- COLUMNS ---------- */
.columns {
  display: grid;
  grid-template-columns: 34% 66%;
  gap: 30px;
  margin-top: 18px;
  height: 100%;
}

.columns > div:first-child {
  border-right: 1px solid #d1d1d1;
  padding-right: 20px;
}
.columns > div:last-child {
  padding-left: 10px;
}

/* ---------- SECTION TITLE (HIERARCHY FIXED) ---------- */
.section { margin-bottom: 24px; }
.section-title {
  font-size: 16px; /* INCREASED SIZE to stand out */
  font-weight: 700; /* INCREASED BOLDNESS */
  color: #222;
  text-transform: uppercase;
  letter-spacing: 1.6px;
  margin-bottom: 10px;
}

/* ---------- LEFT COLUMN ---------- */
.left p, .left li {
  font-size: 13px;
  color: #444;
  margin: 4px 0;
}

/* Education */
.edu-degree {
  font-weight: 600;
  font-size: 13.5px;
  color: #222;
  margin-bottom: 4px;
}
.edu-institution {
  font-size: 13px;
  color: #444;
  margin-bottom: 6px;
}
.edu-list { margin: 4px 0 0 16px; padding: 0; }
.edu-list li { font-size: 13px; color: #444; margin-bottom: 6px; list-style: none; position: relative; }
.edu-list li:before { content: "•"; position: absolute; left: -14px; color: #777; }

/* Skills */
.skill-label {
  display: block;
  font-weight: 600;
  font-size: 13px;
  color: #222;
  margin-top: 8px;
}
.skill-values {
  font-size: 13px;
  color: #444;
  margin: 3px 0 8px 0;
}

/* ---------- RIGHT COLUMN ---------- */
.summary-text {
  font-size: 14px;
  color: #444;
  margin-top: 2px;
}

/* Experience (HIERARCHY FIXED) */
.job-block { margin-bottom: 16px; }

.job-title {
  font-size: 14px; /* KEPT SMALLER than Section Title (16px) */
  font-weight: 600;
  color: #222;
}
.job-meta {
  font-size: 12.6px;
  color: #777;
  margin: 3px 0 6px 0;
}
.job-bullets { margin: 0; padding-left: 18px; }
.job-bullets li {
  list-style: none;
  position: relative;
  padding-left: 8px;
  margin-bottom: 6px;
  font-size: 13px;
  color: #444;
}
.job-bullets li:before {
  content: "•";
  position: absolute;
  left: -12px;
  color: #777;
}

/* Projects */
.project-block { margin-bottom: 16px; }
.project-title { font-size: 14px; font-weight: 600; color: #222; margin-bottom: 3px; }
.project-tech { font-size: 12.4px; color: #777; font-style: italic; margin-bottom: 5px; }
.project-bullets { margin: 0; padding-left: 18px; }
.project-bullets li { list-style: none; font-size: 13px; margin-bottom: 6px; color: #444; position: relative; }
.project-bullets li:before { content: "•"; position: absolute; left: -12px; color: #777; }

.project-link {
  display: inline-block;
  font-size: 12px;
  padding: 3px 8px;
  margin-top: 4px;
  background: #f0f0f0;
  color: #444;
  border-radius: 4px;
  text-decoration: none;
}

/* LINKS */
.hidden-link { color: #333; text-decoration: none; font-size: 13px; }

/* PRINT MEDIA QUERY */
@media print {
  .resume-wrapper { padding: 35px 50px; }
  body.compact-mode .resume-wrapper { padding: 20px 40px; }
}
</style>
</head>

<body>
<div class="resume-wrapper">

  <div class="header">
    <h1>[INSERT_NAME]</h1>
    <h2>[INSERT_JOB_TITLE]</h2>
    <div class="header-divider"></div>
  </div>

  <div class="columns">
    
    <div class="left">
      <div class="section">
        <div class="section-title">Contact</div>
        [INSERT_CONTACT]
      </div>

      <div class="section">
        <div class="section-title">Education</div>
        [EDUCATION]
      </div>

      <div class="section">
        <div class="section-title">Skills</div>
        [SKILLS]
      </div>

      <div class="section">
        <div class="section-title">Languages</div>
        [LANGUAGES]
      </div>
    </div>

    <div class="right">
      <div class="section">
        <div class="section-title">Profile Summary</div>
        <div class="summary-text">
          [AI GENERATED CONTENT: Concise, professional summary.]
        </div>
      </div>

      <div class="section">
        <div class="section-title">Experience</div>
        [EXPERIENCE]
      </div>

      <div class="section">
        <div class="section-title">Projects</div>
        [PROJECTS]
      </div>

      <div class="section section-last">
        <div class="section-title">Extracurricular</div>
        [EXTRACURRICULAR]
      </div>
    </div>

  </div>
</div>
</body>
</html>

`;


const atsPrompt = `
You are generating a resume using the “ATS Classic Serif Resume Template (Richard Williams Style)”.

❗ OUTPUT RULES (MANDATORY — DO NOT IGNORE):
- You MUST output a full HTML document only.
- MUST begin with <html>, include <head><style>…</style></head>, and <body>.
- DO NOT use Markdown.
- DO NOT return backticks.
- NO explanations — only return HTML.
 DO NOT use *, _, #, or any Markdown formatting under ANY circumstances.
- ONLY return clean HTML.
- Auto-clean user text: remove *, _, •, markdown bullets, hashtags, emojis.
- Normalize spacing, remove blank lines, remove duplicated words.
- ALL bullet points MUST be real HTML <li>only.


====================================================
AUTO-EXTRACT USER INFORMATION (MANDATORY)
====================================================

From PERSONAL_INFO extract:
- Full Name
- Job Title (infer if missing)
- Phone
- Email
- GitHub (convert to clickable hidden-link)
- LinkedIn (convert to clickable hidden-link)
- Location

Insert into:
[INSERT_NAME]
[INSERT_CONTACT]

====================================================
AUTO-STRUCTURE USER CONTENT
====================================================

Rewrite all user input professionally:
- Convert tasks → achievements
- Add measurable improvements (20–40% where logical)
- Fix grammar, tense, short bullets
- Infer missing details logically

====================================================
SECTION FORMATS (MUST FOLLOW)
====================================================

EXPERIENCE FORMAT:
For every job found in EXPERIENCE:
- Rewrite responsibilities into **achievement-driven**, **quantified** bullet points.
- Use **strong verbs**: Developed, Implemented, Optimized, Reduced, Improved…
- Convert vague tasks → measurable accomplishments (20–50% improvements).
- Infer missing details (duration, tech stack, responsibilities) only when logical
<div class="company-line">
  <span class="company">COMPANY NAME</span>
  <span class="location">CITY, COUNTRY</span>
</div>
<div class="role-line">
  <span class="role">Role Title (italic)</span>
  <span class="dates">Dates (italic)</span>
</div>
<ul>
  <li>Achievement bullet…</li>
  <li>Achievement bullet…</li>
</ul>



SKILLS FORMAT:
- Bulleted list, each item plain serif font


EDUCATION RULES:
- MUST follow this structure:
  <div class="edu-block">
    <div class="edu-school">
      University Name (bold uppercase)
      Location (right aligned)
    </div>
    <div class="edu-degree">Degree title (italic)</div>
    <div class="edu-details">Graduation year, CGPA, achievements</div>
  </div>

PROJECT RULES:

For each project:
- Extract project name
- Extract tech stack in parentheses: (React, Node.js, MongoDB)
- Rewrite bullets to emphasize measurable outcomes
- If GitHub or live link exists → show clickable **label only**, not the raw URL
- Format:
- MUST provide 2–4 quantified bullets per project (20–40% improvements, speed boosts, accuracy numbers)
- MUST include (Tech stack) line in italic

====================================================
AUTO-CATEGORIZE SKILLS
====================================================

Take raw SKILLS and reorganize automatically into these groups:

Languages:  
Frontend:  
Backend:  
Databases:  
Tools:  
Cloud:  





====================================================
USER DATA TO INSERT
====================================================

PERSONAL INFO:
[PERSONAL_INFO]

EDUCATION:
[EDUCATION]

EXPERIENCE:
[EXPERIENCE]

PROJECTS:
[PROJECTS]

SKILLS:
[SKILLS]

EXTRACURRICULAR:
[EXTRACURRICULAR]

====================================================
USE THIS EXACT HTML TEMPLATE BELOW
====================================================

<html>
<head>
<style>
body {
    font-family: "Times New Roman", serif;
    margin: 20px 40px; /* FIXED smaller margins */
    color: #000;
}

/* --- HEADER --- */
h1 {
    text-align: center;
    font-size: 30px;
    margin-bottom: 8px;
    font-weight: bold;
}

.contact {
    text-align: center;
    font-size: 12px;
    margin-bottom: 12px;
}

.summary {
    text-align: center;
    font-size: 13px;
    font-style: italic;
    margin-bottom: 22px;
}

/* --- SECTION TITLES --- */
.section-title {
    font-size: 14px;
    font-weight: bold;
    text-transform: uppercase;
    margin-top: 18px;
    margin-bottom: 4px;
}

.hr {
    border-bottom: 1px solid #000;
    margin-bottom: 12px;
}

/* --- EXPERIENCE BLOCKS --- */
.company-line {
    display: flex;
    justify-content: space-between;
    font-size: 14px;
    font-weight: bold;
    text-transform: uppercase;
    margin-top: 10px;
}

.location {
    font-size: 11px;       /* FIXED smaller location font */
    font-weight: normal;
    text-transform: none;
}

.role-line {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    font-style: italic;
    margin-top: 2px;
}

.dates {
    font-size: 11px;      /* FIXED smaller date font */
    font-style: italic;
}

ul {
    font-size: 12px;
    padding-left: 22px;
    margin-top: 4px;
}

ul li {
    margin-bottom: 4px;
}

/* --- EDUCATION --- */
.edu-block {
    margin-bottom: 10px;
}

.edu-school {
    display: flex;
    justify-content: space-between;
    font-size: 14px;
    font-weight: bold;
    text-transform: uppercase;
}

.edu-degree {
    font-size: 12px;
    font-style: italic;
    margin-top: 2px;
}

.edu-details {
    font-size: 12px;
    margin-top: 4px;
}

/* --- PROJECTS --- */
.project-title {
    font-size: 14px;
    font-weight: bold;
    text-transform: none;
    margin-top: 8px;
}

.project-tech {
    font-size: 12px;
    font-style: italic;
    margin-top: 1px;
}

.project-bullets li {
    font-size: 12px;
}

/* --- Skills bullet formatting --- */
.skills-list li {
    font-size: 12px;
    margin-bottom: 3px;
}

.hidden-link span { display:none; }
</style>
</head>

<body>

<h1>[INSERT_NAME]</h1>
<div class="contact">[INSERT_CONTACT]</div>
<div class="summary">[AI GENERATED CONTENT: Concise, professional summary based on experience level.1-2 line ]</div>

<div class="section-title">Professional Experience</div>
<div class="hr"></div>
[EXPERIENCE]

<div class="section-title">Education</div>
<div class="hr"></div>
[EDUCATION]

<div class="section-title">Projects</div>
<div class="hr"></div>
[PROJECTS]

<div class="section-title">Skills</div>
<div class="hr"></div>
[SKILLS]

<div class="section-title">Extracurricular</div>
<div class="hr"></div>
[EXTRACURRICULAR]

</body>
</html>

`;

const darkPrompt = `
YOU ARE AN EXPERT RESUME BUILDER AND ATS OPTIMIZATION ENGINE.

THIS PROMPT IS EXECUTED INSIDE AN AUTOMATED SYSTEM.
YOUR OUTPUT IS SENT DIRECTLY TO THE GROQ API AND WRITTEN INTO AN IFRAME.

====================================================
ABSOLUTE RULES — MUST FOLLOW EXACTLY

1. Output ONLY valid HTML.
2. NO markdown, NO explanations, NO backticks.
3. Must start with <html> and end with </html>.
4. Resume MUST fit EXACTLY one A4 page (210mm × 297mm).
5. No overflow, no scrolling.
6. USE THE PROVIDED HTML AND CSS EXACTLY.
7. ONLY replace text content using extracted user data.

FAILURE TO FOLLOW ANY RULE = INVALID OUTPUT.

====================================================
INPUT DATA (ONLY USE THESE)

[PERSONAL_INFO]
[EXPERIENCE]
[PROJECTS]
[EDUCATION]
[SKILLS]
[LANGUAGES]
[EXTRACURRICULAR]

====================================================
CRITICAL LOGIC: CONTENT & VISUALS

1. **VISUAL HIERARCHY (STRICT):**
   - **Job Title / Project Name:** MUST be the most visible element (Bold & Black).
   - **Company / University / Tech Stack:** MUST be subtle (Normal weight & Grey). Do NOT make these bold.
   - **Section Headers (e.g., WORK HISTORY):** Must be uppercase and distinct.

2. **TEXT VOLUME - "BALANCED FIT":**
   - **Do NOT** write huge paragraphs.
   - **Do NOT** write one-word bullets.
   - **GOAL:** Bullet points should be impactful but concise (approx. 1 to 1.5 lines max).
   - **Action:** Remove fluff. Focus on "Action Verb + Task + Result/Metric".
   - *Example:* "Optimized API response time by 40% using Redis caching." (Perfect length).

3. **SKILL CATEGORIZATION:**
   - Group [SKILLS] into "Languages", "Frameworks", "Tools", etc. in the sidebar.

4. **LINK HANDLING:**
   - Detect URLs in [PERSONAL_INFO] or [PROJECTS] and wrap them in <a> tags.
   - Remove "https://" from the visible text for a clean look.

====================================================
RENDER USING THIS EXACT HTML & CSS
(REPLACE TEXT ONLY — STRUCTURE MUST REMAIN IDENTICAL)

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Resume Replica</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&family=Roboto:wght@300;400;500;700&display=swap');

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            background-color: #e0e0e0;
            font-family: 'Roboto', Arial, sans-serif;
            display: flex;
            justify-content: center;
            padding: 20px;
            min-height: 100vh;
        }

        /* DYNAMIC DENSE LAYOUT */
        /* Triggered automatically if content is long */
        body.dense-layout .main-list li { margin-bottom: 1px; line-height: 1.3; font-size: 10.5px; }
        body.dense-layout .section-title { margin-top: 15px; margin-bottom: 8px; }
        body.dense-layout .job-entry { margin-bottom: 12px; }
        body.dense-layout .right-col { padding: 30px 25px; }

        .resume-container {
            background-color: white;
            width: 210mm;
            height: 297mm; /* Fixed A4 height */
            display: flex;
            box-shadow: 0 0 10px rgba(0,0,0,0.3);
            overflow: hidden;
        }

        /* LEFT COLUMN - BLUE SIDEBAR */
        .left-col {
            width: 32%;
            background-color: #24468e; /* Theme Blue */
            color: white;
            padding: 35px 25px;
            display: flex;
            flex-direction: column;
            height: 100%;
        }

        /* RIGHT COLUMN - WHITE MAIN CONTENT */
        .right-col {
            width: 68%;
            background-color: white;
            padding: 35px 30px;
            color: #333;
            display: flex;
            flex-direction: column;
            height: 100%;
        }

        /* LINKS */
        a { text-decoration: none; color: inherit; }
        .left-col a { border-bottom: 1px dotted rgba(255,255,255,0.5); }
        .right-col a { color: #24468e; font-weight: 500; }
        .right-col a:hover { text-decoration: underline; }

        /* TYPOGRAPHY - SIDEBAR */
        h1 {
            font-family: 'Montserrat', sans-serif;
            font-size: 32px; 
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
            line-height: 1;
            margin-bottom: 30px;
            word-wrap: break-word;
        }

        .sidebar-heading {
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 1px;
            border-bottom: 1px solid rgba(255,255,255,0.4);
            padding-bottom: 4px;
            margin-bottom: 10px;
            margin-top: 20px;
            font-weight: 600;
        }
        .sidebar-heading:first-of-type { margin-top: 0; }

        .skill-category {
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            color: #aebce6;
            margin-top: 12px;
            margin-bottom: 3px;
        }
        .skill-category:first-of-type { margin-top: 4px; }

        .contact-item {
            font-size: 11px;
            margin-bottom: 8px;
            display: flex;
            align-items: flex-start;
            line-height: 1.3;
            word-break: break-all;
        }

        .sidebar-list { list-style: none; }
        .sidebar-list li {
            font-size: 11px;
            margin-bottom: 5px;
            line-height: 1.3;
            display: flex;
            align-items: center;
        }
        .sidebar-list li::before { content: "•"; margin-right: 8px; color: rgba(255,255,255,0.6); }

        /* TYPOGRAPHY - MAIN CONTENT */
        .section-title {
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 1px;
            font-weight: 700;
            color: #333;
            border-bottom: 2px solid #24468e;
            padding-bottom: 5px;
            margin-bottom: 15px;
            margin-top: 20px;
        }
        .section-title:first-of-type { margin-top: 0; }

        .summary-text {
            font-size: 11px;
            line-height: 1.5;
            color: #444;
            margin-bottom: 10px;
            text-align: justify;
        }

        /* JOB/PROJECT ENTRIES */
        .job-entry { margin-bottom: 18px; }

        .date-range {
            font-size: 10px;
            color: #888;
            margin-bottom: 2px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        /* HIERARCHY FIX: Job Title is King */
        .job-title {
            font-family: 'Montserrat', sans-serif;
            font-size: 15px; 
            font-weight: 700; /* Bold */
            color: #000; /* Pure Black */
            margin-bottom: 1px;
        }

        /* HIERARCHY FIX: Company is Subtle */
        .company-name {
            font-size: 12px;
            font-weight: 400; /* Normal Weight (Not Bold) */
            color: #555; /* Dark Grey */
            margin-bottom: 6px;
        }

        .main-list { list-style: disc; margin-left: 16px; }
        .main-list li {
            font-size: 11px;
            line-height: 1.4;
            color: #444;
            margin-bottom: 3px; /* Tighter spacing */
            text-align: justify;
        }

        /* PRINT FIX */
        @media print {
            @page { margin: 0; size: A4; }
            * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
            body { background: none; padding: 0; margin: 0; display: block; }
            .resume-container { box-shadow: none; width: 210mm; height: 297mm; margin: 0; }
            .left-col, .right-col { height: 297mm; }
        }
    </style>
</head>
<body>

    <div class="resume-container">
        
        <div class="left-col">
            <h1>First Last</h1>

            <div class="sidebar-heading">Contact Details</div>
            <div class="contact-item">07029 588 201</div>
            <div class="contact-item"><a href="mailto:name@email.com">name@email.com</a></div>
            <div class="contact-item">London, UK</div>
            <div class="contact-item"><a href="#">linkedin.com/in/name</a></div>

            <div class="sidebar-heading">Skills</div>
            
            <div class="skill-category">Languages</div>
            <ul class="sidebar-list">
                <li>Python</li>
                <li>JavaScript</li>
            </ul>

            <div class="skill-category">Frameworks</div>
            <ul class="sidebar-list">
                <li>React.js</li>
                <li>Node.js</li>
            </ul>
            <div class="sidebar-heading">Languages</div>
            <ul class="sidebar-list">
                <li>English (Native)</li>
            </ul>
        </div>

        <div class="right-col">
            
            <div class="section-title">Personal Statement</div>
            <div class="summary-text">
                [AI GENERATED CONTENT: Concise, professional summary based on experience level.]
            </div>

            <div class="section-title">Work History</div>

            <div class="job-entry">
                <div class="date-range">Jan 2023 - Present</div>
                <div class="job-title">Senior Software Engineer</div>
                <div class="company-name">Tech Corp, London</div>
                <ul class="main-list">
                    <li>Led the migration of legacy architecture to microservices, improving system scalability by 40% and reducing downtime.</li>
                    <li>Mentored 4 junior developers, conducting code reviews that decreased bug reports by 15% quarter-over-quarter.</li>
                </ul>
            </div>

            <div class="section-title">Key Projects</div>

            <div class="job-entry">
                <div class="date-range">2023</div>
                <div class="job-title">
                    E-Commerce Analytics Platform (<a href="#" target="_blank">Demo</a>)
                </div>
                <div class="company-name">React, Node.js, MongoDB</div>
                <ul class="main-list">
                    <li>Architected a real-time dashboard visualizing sales data, using D3.js to render complex datasets for 500+ active users.</li>
                    <li>Optimized MongoDB aggregation pipelines, cutting report generation time from 10s to 2s.</li>
                </ul>
            </div>

            <div class="section-title">Education</div>

            <div class="job-entry">
                <div class="date-range">2014 - 2018</div>
                <div class="job-title">B.Sc. Computer Science</div>
                <div class="company-name">University of New York</div>
                <ul class="main-list">
                    <li>Graduated with Honors (CGPA: 3.8/4.0).</li>
                </ul>
            </div>

        </div>
    </div>

</body>
</html>

====================================================
FINAL OUTPUT REQUIREMENT

Return ONLY the final HTML document.
No comments.
No explanations.

`;

const modernPrompt = `
YOU ARE AN EXPERT RESUME BUILDER AND ATS OPTIMIZATION ENGINE.

THIS PROMPT IS EXECUTED INSIDE AN AUTOMATED SYSTEM.
YOUR OUTPUT IS SENT DIRECTLY TO THE GROQ API AND WRITTEN INTO AN IFRAME.

====================================================
ABSOLUTE RULES — MUST FOLLOW EXACTLY

1. Output ONLY valid HTML.
2. NO markdown, NO explanations, NO backticks.
3. Must start with <html> and end with </html>.
4. Resume MUST fit EXACTLY one A4 page (210mm × 297mm).
5. No overflow, no scrolling.
6. USE THE PROVIDED HTML AND CSS EXACTLY.
7. ONLY replace text content using extracted user data.

FAILURE TO FOLLOW ANY RULE = INVALID OUTPUT.

====================================================
INPUT DATA (ONLY USE THESE)

[PERSONAL_INFO]
[EXPERIENCE]
[PROJECTS]
[EDUCATION]
[SKILLS]
[LANGUAGES]
[EXTRACURRICULAR]

====================================================
CRITICAL LOGIC: CONTENT ENHANCEMENT & PARSING

1. **UNSTRUCTURED INPUT TO ATS-READY BULLETS:**
   - The user will provide raw, unstructured notes (e.g., "fixed login slow queries").
   - You MUST expand these into professional "Action + Context + Result" bullet points.
   - **QUANTIFY RESULTS:** You MUST add plausible metrics/percentages to every bullet point to pass ATS scans (e.g., convert "fixed login" to "Refactored authentication flow, reducing login latency by 40%").
   - **KEYWORDS:** Inject relevant technical keywords (e.g., "CI/CD", "Scalability", "Optimization") naturally.

2. **PROJECT SPLITTING (CRITICAL):**
   - Read [PROJECTS] carefully.
   - If the input contains multiple distinct concepts, names, or tech stacks, **CREATE SEPARATE ENTRIES**.
   - Do NOT lump everything into one paragraph
   - Example: If input is "Ecommerce site with react, also a chat app with socket.io", you must generate TWO distinct <div class="project-entry">blocks.

3. **LAYOUT ENFORCEMENT:**
   - **EDUCATION** MUST BE IN THE LEFT COLUMN, underneath Projects. It is forbidden in the right sidebar.
   - **SKILLS** MUST BE IN THE RIGHT SIDEBAR.

====================================================
RENDER USING THIS EXACT HTML & CSS
(REPLACE TEXT ONLY — STRUCTURE MUST REMAIN IDENTICAL)

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Resume Replica</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,300;0,400;0,500;0,700;1,300;1,400&display=swap');

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            background-color: #e0e0e0;
            font-family: 'Roboto', Arial, sans-serif;
            display: flex;
            justify-content: center;
            padding: 20px;
            min-height: 100vh;
        }

        .resume-container {
            background-color: white;
            width: 210mm;
            height: 297mm; /* Fixed A4 height */
            display: flex;
            box-shadow: 0 0 10px rgba(0,0,0,0.3);
            overflow: hidden;
        }

        /* LEFT COLUMN */
        .left-col {
            width: 70%;
            padding: 35px 30px;
            color: #333;
            display: flex;
            flex-direction: column;
        }

        /* RIGHT COLUMN */
        .right-col {
            width: 30%;
            background-color: #fff3e6; /* Orange/Peach background */
            padding: 35px 20px;
            color: #555;
            display: flex;
            flex-direction: column;
        }

        /* TYPOGRAPHY */
        h1 {
            font-size: 32px;
            color: #bf5b15;
            font-weight: 700;
            margin-bottom: 5px;
            line-height: 1;
        }

        .sub-title {
            font-size: 16px;
            color: #666;
            margin-bottom: 25px;
        }

        .section-title {
            font-size: 11px;
            font-weight: 700;
            color: #d68c31;
            text-transform: uppercase;
            margin-bottom: 12px;
            letter-spacing: 0.5px;
            border-bottom: 1px solid #eee;
            padding-bottom: 3px;
        }

        .section-separator {
            margin-top: 25px;
            display: block;
        }

        /* JOB & PROJECT ENTRIES */
        .job-entry, .project-entry, .education-entry {
            margin-bottom: 15px;
        }

        .company-header, .edu-header {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            font-size: 13px;
            color: #888;
            margin-bottom: 2px;
        }

        .company-name, .uni-name {
            font-weight: 700;
            color: #666;
            font-size: 13px;
        }

        .company-desc {
            font-size: 11px;
            font-style: italic;
            color: #888;
            margin-bottom: 5px;
            font-weight: 300;
        }

        .role-row {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            margin-bottom: 4px;
        }

        .role-title {
            font-weight: 700;
            font-size: 14px;
            color: #333;
        }

        .role-date {
            font-weight: 700;
            font-size: 12px;
            color: #333;
        }

        /* LIST STYLES */
        ul {
            list-style-type: disc;
            margin-left: 18px;
        }

        li {
            font-size: 10.5px;
            line-height: 1.35;
            color: #555;
            margin-bottom: 2px;
        }

        /* SIDEBAR STYLES */
        .sidebar-section {
            margin-bottom: 25px;
        }

        .sidebar-title {
            font-size: 11px;
            font-weight: 700;
            color: #d68c31;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            padding-bottom: 5px;
            border-bottom: 1px solid #e0cbb3;
            margin-bottom: 10px;
        }

        .contact-info div, .sidebar-text {
            font-size: 11px;
            color: #666;
            margin-bottom: 4px;
            line-height: 1.4;
        }

        .contact-info a {
            text-decoration: none;
            color: #666;
        }

        .skill-category {
            font-size: 11px;
            font-weight: 700;
            color: #bf5b15;
            margin-top: 12px;
            margin-bottom: 3px;
        }
        
        .skill-category:first-of-type {
            margin-top: 0;
        }

        /* PRINT FIX */
        @media print {
            * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }
            body { 
                background: none; 
                padding: 0; 
            }
            .resume-container { 
                box-shadow: none; 
                height: 297mm; 
                width: 210mm;
            }
        }
    </style>
</head>
<body>

    <div class="resume-container">
        
        <div class="left-col">
            <h1>First Last</h1>
            <div class="sub-title">Software Engineer</div>

            <div class="section-title">Relevant Work Experience</div>

            <div class="job-entry">
                <div class="company-header">
                    <div><span class="company-name">Resume Worded,</span> London, UK</div>
                </div>
                <div class="company-desc">Education technology startup</div>
                <div class="role-row">
                    <span class="role-title">Lead Software Engineer</span>
                    <span class="role-date">08/2021 – Present</span>
                </div>
                <ul>
                    <li>Supervised a team of 21 engineers, improving code quality scores by 35% via strict CI/CD implementation.</li>
                    <li>Designed an automated testing system, increasing productivity by 69% within 13 weeks.</li>
                </ul>
            </div>
            
            <div class="section-title section-separator">Key Projects</div>

            <div class="project-entry">
                <div class="role-row">
                    <span class="role-title">E-Commerce Analytics Dashboard</span>
                    <span class="role-date">2023</span>
                </div>
                <ul>
                    <li>Architected a real-time dashboard using <strong>React</strong> and <strong>Node.js</strong>, processing 10k+ events/sec.</li>
                    <li>Optimized database queries in <strong>PostgreSQL</strong>, reducing page load latency by 40%.</li>
                </ul>
            </div>
            
            <div class="section-title section-separator">Education</div>
            
            <div class="education-entry">
                <div class="role-row">
                    <span class="role-title">University of New York</span>
                    <span class="role-date">2014</span>
                </div>
                <div class="company-desc">Bachelor of Science in Computer Science</div>
                <ul>
                    <li>CGPA: 3.8/4.0</li>
                    <li>Relevant Coursework: Data Structures, Algorithms, Distributed Systems.</li>
                </ul>
            </div>

        </div>
        <div class="right-col">
            
            <div class="sidebar-section">
                <div class="sidebar-title">Contact</div>
                <div class="contact-info">
                    <div>• London, UK</div>
                    <div>• +44 123455789</div>
                    <div>• <a href="mailto:email@example.com">email@example.com</a></div>
                </div>
            </div>

            <div class="sidebar-section">
                <div class="sidebar-title">Skills</div>
                
                <div class="skill-category">Languages</div>
                <div class="sidebar-text">
                    • Python, JavaScript, C++
                </div>

                <div class="skill-category">Frontend</div>
                <div class="sidebar-text">
                    • React, HTML, CSS, Tailwind
                </div>

                <div class="skill-category">Backend</div>
                <div class="sidebar-text">
                    • Node.js, Express, FastAPI
                </div>
            </div>

            <div class="sidebar-section">
                <div class="sidebar-title">Other</div>
                <div class="sidebar-text">
                    • AWS Certified Solutions Architect<br>
                    • Hackathon Winner 2023
                </div>
            </div>

        </div>
        </div>

</body>
</html>

====================================================
FINAL OUTPUT REQUIREMENT

Return ONLY the final HTML document.
No comments.
No explanations.
`;

// ----------------------------
// GENERATE RESUME
// ----------------------------
document.getElementById("generateBtn").addEventListener("click", async () => {
  const template = document.getElementById("templateSelect").value;
const API_KEY = apiKeyInput.value.trim();

if (!API_KEY) {
  alert("Please enter your Groq API key");
  document.getElementById("loading").classList.remove("active");
  return;
}

  let prompt = "";
  if (template === "olivia") prompt = oliviaPrompt;
  if (template === "ats") prompt = atsPrompt;
  if (template === "dark") prompt = darkPrompt;
  if (template === "modern") prompt = modernPrompt;

  // Insert user values
  prompt = prompt
    .replace("[PERSONAL_INFO]", document.getElementById("personalInfo").value)
    .replace("[EDUCATION]", document.getElementById("education").value)
    .replace("[EXPERIENCE]", document.getElementById("experience").value)
    .replace("[PROJECTS]", document.getElementById("projects").value)
    .replace("[SKILLS]", document.getElementById("skills").value)
    .replace("[EXTRACURRICULAR]", document.getElementById("extracurricular").value);

  // Show loading UI
  document.getElementById("loading").classList.add("active");

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`,
        "X-Request-Origin": window.location.origin
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
      })
    });

    const data = await response.json();
    const html = data.choices[0].message.content;

    // ----------------------------
    // RENDER IN IFRAME (CSS SAFE)
    // ----------------------------
    const frame = document.getElementById("resumeFrame");
    const doc = frame.contentDocument || frame.contentWindow.document;

    doc.open();
    doc.write(html);
    doc.close();
    if (window.enableDownload) window.enableDownload();

// assume `frame` is your iframe element (document.getElementById("resumeFrame"))
// and `html` is the generated HTML string you just wrote into the iframe

// small delay so the iframe renders
// ----------------------------
// REPLACEMENT FOR THE SETTIMEOUT BLOCK
// ----------------------------
setTimeout(() => {
  const frameDoc = frame.contentDocument || frame.contentWindow.document;
  if (!frameDoc) return;

  // --- 1. RESET FOR PREVIEW ---
  frame.style.width = "100%";
  frame.style.height = "100%";
  
  // ✅ RESTORED: Force the iframe container to be white
  frame.style.background = "#ffffff";  
  
  // Optional: Add a subtle border for a 'paper' look on mobile
  frame.style.border = "none";

  // --- 2. CALCULATE SCALE FOR MOBILE PREVIEW ---
  const a4WidthPx = 794; 
  const containerWidth = frame.clientWidth; 
  let scale = 1;

  if (containerWidth < a4WidthPx) {
    scale = containerWidth / a4WidthPx;
  }

  // --- 3. APPLY SCALING TO BODY ---
  frameDoc.body.style.transformOrigin = "top left";
  frameDoc.body.style.transform = `scale(${scale})`;
  frameDoc.body.style.width = "210mm"; 
  frameDoc.body.style.height = "297mm"; 
  
  // Ensure the internal document background is also white
  try {
    frameDoc.body.style.background = "#ffffff";
    frameDoc.documentElement.style.background = "#ffffff";
  } catch(e) {}

  // Adjust iframe height so no big empty space or scrollbars
  frame.style.height = `${1123 * scale + 20}px`; 

  // --- 4. CRITICAL: INJECT PRINT FIX ---
  const styleTag = frameDoc.createElement("style");
  styleTag.textContent = `
    @media print {
      body {
        transform: none !important;
        width: 210mm !important;
        height: 297mm !important;
        margin: 0 !important;
        padding: 0 !important;
        overflow: hidden !important;
      }
      html {
        width: 210mm !important;
        height: 297mm !important;
      }
    }
  `;
  frameDoc.head.appendChild(styleTag);

  // Enable the download button
  if (window.enableDownload) window.enableDownload();

}, 150);
    // Save last HTML for download/copy
    window.generatedResumeHTML = html;

    // Also try enabling download now (best-effort)
    try {
      if (window.enableDownload) window.enableDownload();
    } catch (e) {
      console.warn('enableDownload call failed:', e);
    }

  } catch (err) {
    alert("Error: " + err.message);
  }

  document.getElementById("loading").classList.remove("active");
});

// ----------------------------
// COPY HTML BUTTON
// ----------------------------
const copyBtn = document.getElementById("copyBtn");
if (copyBtn) {
  copyBtn.addEventListener("click", () => {
    if (!window.generatedResumeHTML) return alert("Generate a resume first!");
    navigator.clipboard.writeText(window.generatedResumeHTML);
    alert("Resume HTML copied!");
  });
} else {
  // copy button is optional in the UI; nothing to do if it's missing
}

// ----------------------------
// DOWNLOAD HTML BUTTON
// ----------------------------
// ----------------------------
// DOWNLOAD → PRINT IFRAME ONLY
// ----------------------------


  // (Removed duplicate simple handler — styling for iframe is now handled directly after rendering)
// Initialize download button and ensure handler registers whether the
// script runs before or after DOMContentLoaded.
// ----------------------------
// DOWNLOAD → PRINT IFRAME ONLY
// ----------------------------
(function initDownload() {
  const setup = () => {
    const downloadBtn = document.getElementById("downloadBtn");
    const frame = document.getElementById("resumeFrame");

    if (!downloadBtn || !frame) return;

    downloadBtn.addEventListener("click", () => {
      // 1. Check if content exists
      if (!frame.contentWindow || !frame.contentDocument) return;

      // 2. TEMPORARILY RESTORE FULL SIZE FOR PRINTING
      // We force the iframe width to match A4 so the browser print dialog sees full width
      const originalWidth = frame.style.width;
      const originalHeight = frame.style.height;
      const frameDoc = frame.contentDocument;
      const originalTransform = frameDoc.body.style.transform;

      // Force full A4 size
      frame.style.width = "210mm";
      frame.style.height = "297mm";
      frameDoc.body.style.transform = "none"; // Remove zoom

      // 3. PRINT
      frame.contentWindow.focus();
      frame.contentWindow.print();

      // 4. RESTORE PREVIEW (After a tiny delay to ensure print dialog caught it)
      // Note: On mobiles, print dialogs pauses JS, so this runs after you close print.
      setTimeout(() => {
        frame.style.width = originalWidth;
        frame.style.height = originalHeight;
        frameDoc.body.style.transform = originalTransform;
      }, 500);
    });

    window.enableDownload = () => {
      downloadBtn.disabled = false;
    };
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setup);
  } else {
    setup();
  }
})();
