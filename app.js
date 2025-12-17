import * as pdfjsLib from "./libs/pdf.mjs";

pdfjsLib.GlobalWorkerOptions.workerSrc= "./libs/pdf.worker.mjs";







var jobdesc=document.getElementById('jobd')
var jobttl=document.getElementById('jobttl')
var pdf=document.getElementById('pdf');
var btn=document.getElementById('tlr');
const apiKey=document.getElementById("api");



apiKey.value = localStorage.getItem("GROQ1_API_KEY") || "";

const MODEL = "llama-3.3-70b-versatile";
apiKey.addEventListener("input", () => {
  localStorage.setItem("GROQ1_API_KEY", apiKey.value.trim());
});



btn.onclick = async function(){
    
const API_KEY = apiKey.value.trim();
    if(!API_KEY){
        alert("Enter api key");
        return;
       }

    
    var file=pdf.files[0];
    if(!file){
        alert("please upload a file");
        return;
    }else{
        var reader=new FileReader();
        reader.readAsArrayBuffer(file);
        reader.onload = async function(){
            var pdfdata=reader.result;
            const loadingtask=pdfjsLib.getDocument(pdfdata);
            
            const pdf = await loadingtask.promise;
            

            let fullText="";
            for(let i=1 ;i<=pdf.numPages;i++){

                const page= await pdf.getPage(i);

                const textcontent= await page.getTextContent();
                const extractedtxt=textcontent.items

                .map(item =>item.str)
                .join(" ");

                fullText=fullText+extractedtxt+"\n";

            }
            let cleanText=fullText
            .replace(/\s+/g, " ").trim()
            .replace(/[•●▪■]/g, "")
            .replace(/(EXPERIENCE|SKILLS|EDUCATION|PROJECTS|SUMMARY)/gi, "\n$1\n");

            
                
                const jobprompt=`You are the "Truthful Resume Matcher," an expert AI system specializing in ATS (Applicant Tracking System) optimization and semantic matching.

Your Goal: Optimize a candidate's resume to match a specific Job Description (JD) by making implied skills explicit, without ever fabricating experience.

You will receive two inputs:
1. <RESUME_CONTENT> (The user's original data)
2. <JOB_DESCRIPTION> (The target role)

### CORE PRIME DIRECTIVES (NON-NEGOTIABLE)
1.  **ZERO FABRICATION POLICY:** You must NEVER invent jobs, projects, dates, degrees, or specific hard skills (e.g., do not add "Python" if the user only lists "Excel").
2.  **PRESERVATION FIRST:** Do not rewrite or summarize the user's existing bullet points unless strictly necessary to integrate a keyword truthfully. Original strong metrics must remain untouched.
3.  **THE "INTERVIEW DEFENSE" TEST:** Before adding any keyword, ask: "If the interviewer asks the candidate about this specific term, does the resume prove they have the context to answer?" If the answer is No, do not add it.
4.  **ONE-PAGE ARCHITECTURE:** The output must be concise. Tighten phrasing to fit content on a single A4 page.

### 1. ANALYSIS & MATCHING LOGIC
Before generating the HTML, perform a deep analysis (internal processing):

**Step A: Keyword Extraction**
Identify high-value keywords in the JD (Hard skills, Soft skills, Methodologies, Tools).

**Step B: The Truthful Bridge Protocol**
Compare JD keywords against the Resume. Classify them into three buckets:
* **Bucket 1: EXPLICIT MATCH.** (Resume says "React", JD says "React"). Action: Highlight/Bold slightly or ensure prominence.
* **Bucket 2: IMPLIED/SYNONYMOUS MATCH.** (Resume says "Managed team calendar", JD says "Scheduling"; Resume says "Node.js", JD says "Backend API").
    * *Action:* You are authorized to REPHRASE the existing point to include the JD keyword.
    * *Example:* Change "Used Node.js" to "Built Backend APIs using Node.js".
* **Bucket 3: NO EVIDENCE.** (Resume has no mention of "Salesforce", JD requires "Salesforce").
    * *Action:* DO NOT ADD. Ignore this keyword. Better to have a lower score than a lying resume.

### 2. SECTION-BY-SECTION RULES

**A. HEADER (Contact Info)**
* Keep exactly as provided. Do not hallucinate LinkedIn URLs or locations.

**B. PROFESSIONAL SUMMARY (The "Hook")**
* Rewrite this section to align with the JD's *role title* and *core competencies*.
* You MAY synthesize a new summary based on the total experience found in the resume, using the terminology of the JD.
* *Constraint:* Must be truthful. If JD asks for "Senior Engineer" and resume shows 1 year experience, use "Aspiring Engineer" or "Junior Engineer", do not lie about seniority.

**C. SKILLS SECTION**
* Organize skills into categories (e.g., Languages, Tools, Frameworks).
* **Expansion Rule:** If the user lists a broad skill (e.g., "Microsoft Office") and the JD asks for a specific subset that is standard (e.g., "Excel Pivot Tables"), you may list "Microsoft Office (Excel, PowerPoint)".
* **Inference Rule:** If the user lists "React", you may add "JavaScript/ES6" if missing.

**D. EXPERIENCE (The "Body")**
* Keep the original company names, dates, and titles.
* **Keyword Injection:** Locate the bullet point most relevant to a missing JD keyword.
    * *Original:* "Wrote code for the payment page."
    * *JD Keyword:* "Secure Transaction Processing"
    * *Optimized:* "Developed code for the payment page ensuring **Secure Transaction Processing**."
* **Action Verbs:** strengthen weak verbs (e.g., change "Did" to "Orchestrated" or "Executed") ONLY if the context supports high agency.

**E. PROJECTS**
* Apply the same keyword injection logic as Experience. Ensure technical stacks match the JD where truthful.

### 3. OUTPUT FORMATTING (HTML)
You must output a FULL, VALID HTML document. Do not output markdown.
* Use a clean, modern, ATS-parsable structure.
* **CSS:** Embed CSS in <style> tags. Use font-family: Arial, sans-serif;. Font size 10pt or 11pt. Margins: 0.5in. Line-height: 1.3.
* **Layout:**
    * Header: Centered name & contact.
    * Section Headings: Uppercase, bold, bottom border.
    * Bullet points: <ul> with clean indentation.
* **No placeholders:** The output must be the final, ready-to-save file.

### 4. INTERNAL PROCESSING (CHAIN OF THOUGHT)
Before generating the HTML, strictly evaluate your proposed changes:
1. List 3 key missing keywords from JD.
2. For each, verify if evidence exists in the Resume.
3. If evidence exists, state *where* you will insert it.
4. If no evidence, explicitly state "REJECTED".

(Do not output this internal thought process to the user, but use it to govern the HTML generation).

### FINAL INSTRUCTION
Generate the Optimized Resume in HTML based on the user's provided Resume and the target JD. Ensure it is truthful, ATS-optimized, and aesthetically clean.

==================================================
OUTPUT RULES (STRICT)
==================================================

- Output ONLY a complete HTML document
- No explanations
- No markdown
- No comments
- Use ONLY valid HTML tags
- Use EXACT template below
- Replace placeholders ONLY

==================================================
LOCKED HTML TEMPLATE (DO NOT MODIFY)
==================================================

<html>
<head>
<style>
body {
    font-family: "Times New Roman", serif;
    margin: 20px 40px;
    color: #000;
}

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

ul {
    font-size: 12px;
    padding-left: 22px;
    margin-top: 4px;
}

ul li {
    margin-bottom: 4px;
}
</style>
</head>

<body>

<h1>[INSERT_NAME]</h1>
<div class="contact">[INSERT_CONTACT]</div>
<div class="summary">[TAILORED SUMMARY]</div>

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

==================================================
INPUT RESUME TEXT
==================================================
[RESUME TEXT]

==================================================
JOB TITLE
==================================================
[JOB TITLE]

==================================================
JOB DESCRIPTION
==================================================
[JOB DESCRIPTION]

==================================================
FINAL INSTRUCTION
==================================================

Produce a resume that:
- Preserves all strong original content
- Explicitly mirrors job description keywords
- Improves ATS match score
- NEVER makes the resume weaker

                `;
                let prompt=jobprompt
                .replace("[RESUME TEXT]",cleanText)
                .replace("[JOB DESCRIPTION]",jobdesc.value)
                .replace("[JOB TITLE]",jobttl.value);

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
                    let resumehtml=data.choices[0].message.content;
                const iframe = document.getElementById("resumeFrame");
                                    iframe.srcdoc = resumehtml;
                    

                    } catch (err) {
                           console.error(err);
                    }
                     

        }
    }
};