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

            
                
  const jobprompt=`
                        You are "ResumeTailor_Architect_v3", a ruthless, logic-driven ATS Engine.

YOUR GOAL:
To calculate a candidate's "Fit Score" by SUBTRACTING points for every gap.
You do NOT "estimate" the score. You CALCULATE it.
You do NOT give the benefit of the doubt.

================================================================================
SECTION 1: THE "MUTUALLY EXCLUSIVE" (OR) PROTOCOL
================================================================================
Job Descriptions (JDs) often list alternatives. You must identify them immediately.

Logic:
IF JD says: "Experience with Java, Python, OR C++"
AND Resume has: "Python"
RESULT: "Python" is PRESENT. "Java" and "C++" are NOT missing. They are irrelevant.

IF JD says: "Experience with AWS, Azure, OR GCP"
AND Resume has: NONE of them.
RESULT:
- DO NOT list "AWS" as missing.
- DO NOT list "Azure" as missing.
- DO NOT list "GCP" as missing.
- DO list ONE single item: "Cloud Platform (AWS/Azure/GCP)" as MISSING.

**VIOLATION PENALTY:**
If you list mutually exclusive items (like AWS and Azure) as separate missing skills, you have FAILED.

================================================================================
SECTION 2: STEP-BY-STEP ANALYSIS EXECUTION
================================================================================

STEP 1: HARD SKILLS EXTRACTION
- Scan JD for all required technical skills.
- Ignore "Preferred" or "Bonus" skills for the "Missing" list (move them to Preferred section).
- Check Resume for matches (Exact, Implied, or Composite).
- **Composite Stack Rule:** If Resume has React + Node + Mongo, then "MERN Stack" is PRESENT. Do not mark missing.

STEP 2: EDUCATION CHECK (BINARY)
- Match = Degree & Major match.
- Partial = Degree matches, Major differs.
- Mismatch = No degree, or Degree level is too low (e.g., Associates instead of Bachelors).

STEP 3: SCORING CALCULATION (THE SUBTRACTIVE MODEL)
Start with **100 Points**. Apply these deductions strictly:

1. **Hard Skills Deductions:**
   - For every MISSING "High Priority" skill: **SUBTRACT 12 POINTS**.
   - For every MISSING "Medium Priority" skill: **SUBTRACT 6 POINTS**.
   - For every MISSING "Low Priority" skill: **SUBTRACT 3 POINTS**.

2. **Education Deductions:**
   - If status is "Mismatch": **SUBTRACT 20 POINTS**.
   - If status is "Partial": **SUBTRACT 5 POINTS**.

3. **Experience Deductions:**
   - If years of experience < 50% of required: **SUBTRACT 15 POINTS**.
   - If experience is in a different domain: **SUBTRACT 10 POINTS**.

4. **Formatting/Keyword Deductions:**
   - For every "Keyword Optimization Opportunity" (skill present but wrong word): **SUBTRACT 1 POINT**.

**MANDATORY CAPS (OVERRIDES):**
- If the final calculated score is > 80 but there are ANY "High Priority" missing skills -> **FORCE SCORE TO 75**.
- If the final calculated score is > 60 but Education is "Mismatch" -> **FORCE SCORE TO 60**.

================================================================================
SECTION 3: OUTPUT JSON STRUCTURE (STRICT)
================================================================================

Return ONLY this JSON. No other text.

{
  "overallScore": integer (Calculated from 100 - deductions),
  "verdict": string ("Perfect Match" | "Strong" | "Good" | "Weak" | "Unqualified"),
  "categoryScores": {
    "hardSkills": integer (0-100),
    "experience": integer (0-100),
    "softSkills": integer (0-100),
    "atsAlignment": integer (0-100)
  },
  "hardSkillsAnalysis": {
    "present": [ "List of found skills" ],
    "implied": [ "List of inferred skills" ],
    "missing": [
      {
        "skill": "Name of skill (or Group Name if 'OR' logic applies)",
        "importance": "High" | "Medium" | "Low",
        "estimatedLearningTime": "e.g., 2 weeks",
        "reason": "Brief reason from JD"
      }
    ],
    "preferredExposureGaps": [
      {
        "skill": "Name of preferred skill",
        "estimatedLearningTime": "Time",
        "reason": "Why it helps"
      }
    ],
    "keywordOptimization": [
      {
        "keyword": "Exact missing keyword",
        "reason": "Resume uses X instead of Y",
        "whereToAdd": "Section name"
      }
    ]
  },
  "keywordOptimizationOpportunities": [ "Summary strings" ],
  "softSkillGaps": [ "List of missing soft signals" ],
  "educationFit": {
    "status": "Match" | "Partial" | "Mismatch",
    "details": "Comparison details"
  },
  "experienceFitSummary": "Brief analysis text",
  "recommendations": [
    "Specific action items. MUST reference missing skills or keywords."
  ]
}

================================================================================
INPUT DATA
================================================================================

RESUME TEXT:
[RESUME TEXT]

JOB DESCRIPTION:
[JOB DESCRIPTION]

JOB TITLE:
[JOB TITLE]

PERFORM CALCULATION AND GENERATE JSON.





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
                    let raw = data.choices[0].message.content;

                    // Remove ```json and ``` wrappers
                    raw = raw
                    .replace(/```json/gi, "")
                    .replace(/```/g, "")
                    .trim();

                    const analysis = JSON.parse(raw);
                        console.log("PARSED ANALYSIS:", analysis);

                    
                   /* ===============================
                    1. OPEN OVERLAY
                    ================================ */
                    const overlay = document.querySelector(".ai-review-overlay");
                    overlay.classList.add("active");

                    /* ===============================
                    2. SCORE RING + VERDICT
                    ================================ */
                    const scoreNumber = document.querySelector(".score-ring-value .number");
                    const scoreVerdict = document.querySelector(".score-verdict");
                    const scoreCircle = document.querySelector(".score-ring-progress");

                    scoreNumber.textContent = analysis.overallScore;
                    scoreVerdict.textContent = analysis.verdict;

                    // SVG progress ring
                    const radius = 60;
                    const circumference = 2 * Math.PI * radius;
                    const offset = circumference - (analysis.overallScore / 100) * circumference;

                    scoreCircle.style.strokeDasharray = `${circumference}`;
                    scoreCircle.style.strokeDashoffset = offset;

                    /* ===============================
                    3. CATEGORY BREAKDOWN
                    ================================ */
                    const categoryMap = {
                    ats: analysis.categoryScores.atsAlignment,
                    "hard-skills": analysis.categoryScores.hardSkills,
                    "soft-skills": analysis.categoryScores.softSkills,
                    experience: analysis.categoryScores.experience,
                    };

                    Object.entries(categoryMap).forEach(([cls, value]) => {
                    const bar = document.querySelector(`.category-bar-fill.${cls}`);
                    const label = bar.closest(".category-item")
                        .querySelector(".category-score");

                    bar.style.width = `${value}%`;
                    label.textContent = `${value} / 100`;
                    });
                    // ==============================
// Preferred Skills (Optional) - MATCHING CSS STYLE
// ==============================

const preferredSection = document.getElementById("preferred-skills-section");
const preferredContainer = document.getElementById("preferred-skills-container");

// Clear previous results
preferredContainer.innerHTML = "";

// 1. Get the data
const preferredGaps = analysis.hardSkillsAnalysis?.preferredExposureGaps;

// 2. Check if data exists
if (preferredGaps && Array.isArray(preferredGaps) && preferredGaps.length > 0) {
    
    // Show the section
    preferredSection.style.display = "block";

    // Create cards
    preferredGaps.forEach(item => {
        const card = document.createElement("div");
        
        // CHANGE 1: Use 'skill-card' to match Missing Skills styling exactly
        card.className = "skill-card"; 

        // CHANGE 2: Use the same internal structure (skill-meta, skill-importance)
        card.innerHTML = `
            <h5>${item.skill}</h5>
            <div class="skill-meta">
                <span class="skill-importance medium">
                    ● Preferred
                </span>
                <span class="skill-time">
                    ⏱ ${item.estimatedLearningTime}
                </span>
                <span class="skill-time" style="opacity: 0.7;">
                    ℹ️ ${item.reason}
                </span>
            </div>
        `;

        preferredContainer.appendChild(card);
    });

} else {
    // Hide section if no data found
    preferredSection.style.display = "none";
}
                    /* ===============================
                    4. FILTER IMPLIED SKILLS (CRITICAL FIX)
                    ================================ */
                    const impliedSkills = new Set(
                    (analysis.hardSkillsAnalysis.implied || []).map(s =>
                        s.toLowerCase()
                    )
                    );

                    const keywordSkills = new Set(
                    (analysis.hardSkillsAnalysis.keywordOptimization || []).map(k =>
                        k.keyword.toLowerCase()
                    )
                    );

                    const realMissingSkills = (analysis.hardSkillsAnalysis.missing || []).filter(
                    m =>
                        !impliedSkills.has(m.skill.toLowerCase()) &&
                        !keywordSkills.has(m.skill.toLowerCase())
                    );

                    /* ===============================
                    5. RENDER MISSING SKILLS & TOOLS
                    ================================ */
                    const skillsGrid = document.querySelector(".skills-grid");
                    skillsGrid.innerHTML = "";

                    realMissingSkills.forEach(skill => {
                    const card = document.createElement("div");
                    card.className = "skill-card";

                    card.innerHTML = `
                        <h5>${skill.skill}</h5>
                        <div class="skill-meta">
                        <span class="skill-importance ${skill.importance.toLowerCase()}">
                            ● ${skill.importance} Priority
                        </span>
                        <span class="skill-time">
                            ⏱ ${skill.estimatedLearningTime}
                        </span>
                        </div>
                    `;

                    skillsGrid.appendChild(card);
                    });

                    /* ===============================
                    6. SOFT SKILL GAPS
                    ================================ */
                    const softSkillsList = document.querySelector(".soft-skills-list");
                    softSkillsList.innerHTML = "";

                    analysis.softSkillGaps.forEach(skill => {
                    const item = document.createElement("div");
                    item.className = "soft-skill-item";

                    item.innerHTML = `
                        <div class="soft-skill-icon">💡</div>
                        <span>${skill}</span>
                    `;

                    softSkillsList.appendChild(item);
                    });

                    /* ===============================
                    7. ACTIONABLE SUGGESTIONS
                    (KEYWORD OPTIMIZATION FIRST)
                    ================================ */
                    const suggestionsList = document.querySelector(".suggestions-list");
                    suggestionsList.innerHTML = "";

                    // ATS keyword wording fixes (NOT learning gaps)
                    (analysis.hardSkillsAnalysis.keywordOptimization || []).forEach(k => {
                    const item = document.createElement("div");
                    item.className = "suggestion-item";

                    item.innerHTML = `
                        <div class="suggestion-checkbox"></div>
                        <span>
                        ATS wording fix: add "<strong>${k.keyword}</strong>" in 
                        <em>${k.whereToAdd}</em> — ${k.reason}
                        </span>
                    `;

                    suggestionsList.appendChild(item);
                    });

                    // General recommendations
                    analysis.recommendations.forEach(text => {
                    const item = document.createElement("div");
                    item.className = "suggestion-item";

                    item.innerHTML = `
                        <div class="suggestion-checkbox"></div>
                        <span>${typeof text === "string" ? text : text.text}</span>
                    `;

                    suggestionsList.appendChild(item);
                    });

                    /* ===============================
                    8. LOAD PDF INTO OVERLAY IFRAME
                    ================================ */
                    const pdfIframe = document.querySelector(".overlay-resume-preview iframe");
                    const pdfURL = URL.createObjectURL(file);
                    pdfIframe.src = pdfURL;
                    /* ===============================
                    CLOSE BUTTON
                    ================================ */
                    document.querySelector(".overlay-close").onclick = () => {
                    overlay.classList.remove("active");
                    URL.revokeObjectURL(pdfURL);
                    };

                   

                    

                    } catch (err) {
                           console.error(err);
                    }
                     

        }
    }
};