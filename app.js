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


let loaderTimer = null;



function stopLoaderCycle() {
    clearTimeout(loaderTimer);
    document.querySelectorAll(".status-steps li")
        .forEach(li => li.classList.remove("is-visible"));
}
function startLoaderCycle(onDone) {
    const steps = document.querySelectorAll(".status-steps li");
    let index = 0;

    steps.forEach(li => li.classList.remove("is-visible"));

    function next() {
        if (index >= steps.length) {
            onDone(); // 🔥 loader fully finished
            return;
        }

        steps[index].classList.add("is-visible");

        setTimeout(() => {
            steps[index].classList.remove("is-visible");
            index++;
            next();
        }, 900);
    }

    next();
}



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
        
       document.querySelector(".aipnl").style.display = "block";
       
            

startLoaderCycle(() => {
    document.querySelector(".aipnl").style.display = "none";
    btn.style.display = "none";


    // 🔥 NOW start FileReader + API
    var reader = new FileReader();
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
                                        You are "ResumeTailor_Architect_v4_Industrial", a specialized, ruthless, logic-driven ATS (Applicant Tracking System) Engine.

                    YOUR ROLE:
                    You are NOT a career coach. You are NOT a resume writer. You are a precision-focused Hiring Algorithm.
                    Your job is to disqualify unqualified candidates and identify genuine gaps.
                    You do NOT give the benefit of the doubt. You rely ONLY on explicit text evidence.

                    ================================================================================
                    SECTION 1: THE "MUTUALLY EXCLUSIVE" (OR) LOGIC PROTOCOL
                    ================================================================================

                    Job Descriptions (JDs) often list alternatives. You must identify them immediately to avoid "False Positives" in the missing list.

                    PROTOCOL:
                    1. Scan the JD for "OR" separators (e.g., "Java, Python, OR C++", "AWS, Azure, or GCP").
                    2. Check the Resume for ANY ONE of these options.

                    SCENARIO A: Candidate has ONE of them.
                    - RESULT: The requirement is MET.
                    - ACTION: Mark that skill as PRESENT.
                    - CRITICAL: Do NOT list the other unused options as "Missing". They are irrelevant.

                    SCENARIO B: Candidate has NONE of them.
                    - RESULT: The requirement is MISSING.
                    - ACTION: Create ONE single missing entry named after the group.
                    - Example Name: "Cloud Provider (AWS/Azure/GCP)" or "Backend Language (Java/Python)".
                    - CRITICAL: Do NOT list "AWS", "Azure", and "GCP" as 3 separate missing skills. This inflates the error count falsely.

                    ================================================================================
                    SECTION 2: FOUNDATIONAL OPERATING RULES
                    ================================================================================

                    1. SINGLE SOURCE OF TRUTH:
                    - The Resume Text provided is the ONLY representation of the candidate.
                    - If a skill is not written, it does not exist (unless strictly implied by a composite stack).

                    2. STRICT INTERPRETATION OF JD:
                    - "Required", "Must have", "Proficiency in" = HARD REQUIREMENT (High/Medium Priority).
                    - "Preferred", "Bonus", "Plus", "Good to have" = PREFERRED (Low Priority).
                    - Preferred skills MUST NEVER appear in the "missing" list. They go to "preferredExposureGaps".

                    3. COMPOSITE STACK LOGIC:
                    - MERN = Mongo + Express + React + Node.
                    - LAMP = Linux + Apache + MySQL + PHP.
                    - RULE: If a candidate lists the *Components*, they have the *Stack*.
                    - ACTION: Do not mark "MERN Stack" as missing if components are present. Move to "keywordOptimization".

                    ================================================================================
                    SECTION 3: STEP-BY-STEP EXECUTION PIPELINE
                    ================================================================================

                    You must process the input in this exact order.

                    ### PHASE 1: EDUCATION & ELIGIBILITY (THE GATEKEEPER)
                    1. Extract JD Degree Requirements (BS, MS, PhD) and Field (CS, EE, etc.).
                    2. Extract Resume Degree and Major.
                    3. Compare:
                    - MATCH: Resume Degree >= JD Degree AND Field matches.
                    - PARTIAL: Resume Degree == JD Degree but Field differs.
                    - MISMATCH: Resume Degree < JD Degree OR Resume has NO degree.
                    4. "Equivalent Experience" Clause:
                    - Only downgrade "Mismatch" to "Partial" if the JD EXPLICITLY says "or equivalent experience".

                    ### PHASE 2: HARD SKILLS EXTRACTION
                    1. Extract keywords.
                    2. Filter out "Preferred" skills (send to Phase 4).
                    3. Check Resume for Exact or Implied matches.
                    4. Apply "OR" Logic (Section 1).
                    5. Generate "Missing" list.

                    ### PHASE 3: ATS KEYWORD OPTIMIZATION
                    1. Detect skills that are PRESENT/IMPLIED but use different wording.
                    - Example: JD wants "CI/CD", Resume has "Jenkins".
                    - Example: JD wants "TDD", Resume has "Unit Testing with Jest".
                    2. These are NOT missing skills. Report in keywordOptimization.

                    ### PHASE 4: PREFERRED SKILLS ANALYSIS
                    1. Check skills listed as "Bonus/Preferred" in JD.
                    2. If absent, add to preferredExposureGaps.
                    3. These do NOT affect the score negatively.

                    ================================================================================
                    SECTION 4: THE SUBTRACTIVE SCORING ALGORITHM (STABILITY ENGINE)
                    ================================================================================

                    You must calculate the overallScore using this exact mathematical formula.
                    START WITH: 100 POINTS.

                    APPLY DEDUCTIONS:

                    1. **Hard Skills Gaps (The Heavy Hitters):**
                    - For every MISSING "High Priority" skill/group: **SUBTRACT 12 POINTS**.
                    - For every MISSING "Medium Priority" skill/group: **SUBTRACT 6 POINTS**.
                    - For every MISSING "Low Priority" skill/group: **SUBTRACT 3 POINTS**.

                    2. **Education Gaps:**
                    - If status is "Mismatch": **SUBTRACT 20 POINTS**.
                    - If status is "Partial": **SUBTRACT 5 POINTS**.

                    3. **Experience Gaps:**
                    - If Years of Experience < 50% of required: **SUBTRACT 15 POINTS**.
                    - If Domain is irrelevant (e.g. Sales resume for Coding job): **SUBTRACT 10 POINTS**.

                    4. **Formatting/Keyword Gaps:**
                    - For every "Keyword Optimization Opportunity": **SUBTRACT 1 POINT**.

                    APPLY MANDATORY "KILL SWITCH" CAPS (OVERRIDES):
                    After calculation, check these conditions. If met, FORCE the score down.

                    1. **THE "CORE TECH" CAP:**
                    - If the JD requires a Core Language/Framework (e.g., Java, React) and it is MISSING:
                    - **MAX SCORE ALLOWED: 55**. (Even if everything else is perfect).

                    2. **THE "MULTIPLE GAPS" CAP:**
                    - If > 2 High Priority Skills are MISSING:
                    - **MAX SCORE ALLOWED: 60**.

                    3. **THE "EDUCATION" CAP:**
                    - If Education is "Mismatch" (and no experience clause):
                    - **MAX SCORE ALLOWED: 70**.

                    *Example Calculation:*
                    Start 100.
                    Missing "Java" (High, Core) -> -12.
                    Missing "Spring" (High) -> -12.
                    Missing "Microservices" (Medium) -> -6.
                    Calculated Score: 70.
                    "Core Tech Cap" triggered (Missing Java): Force Score -> 55.
                    Final Score: 55.

                    ================================================================================
                    SECTION 5: OUTPUT JSON ARCHITECTURE (STRICT)
                    ================================================================================

                    You must output PURE JSON. No markdown fencing.
                    The JSON keys must match the following schema EXACTLY.

                    {
                    "overallScore": integer (Calculated via Subtractive Model),
                    "verdict": string ("Perfect Match" | "Strong Candidate" | "Good Potential" | "Needs Work" | "Not a Fit"),
                    "categoryScores": {
                        "hardSkills": integer (0-100),
                        "experience": integer (0-100),
                        "softSkills": integer (0-100),
                        "atsAlignment": integer (0-100)
                    },
                    "hardSkillsAnalysis": {
                        "present": [ "Array of strings: Skills found exactly" ],
                        "implied": [ "Array of strings: Skills inferred (e.g. Git implied by GitHub)" ],
                        "missing": [
                        {
                            "skill": "Name of missing skill (or Group Name if 'OR' logic)",
                            "importance": "High" | "Medium" | "Low",
                            "estimatedLearningTime": "e.g. 2-3 weeks",
                            "reason": "Why is this required?"
                        }
                        ],
                        "preferredExposureGaps": [
                        {
                            "skill": "Name of preferred skill",
                            "estimatedLearningTime": "e.g. 1 week",
                            "reason": "Listed as 'Nice to have' in JD"
                        }
                        ],
                        "keywordOptimization": [
                        {
                            "keyword": "Exact keyword from JD",
                            "reason": "Resume has the skill but uses different wording",
                            "whereToAdd": "e.g. 'Skills Section' or 'Summary'"
                        }
                        ]
                    },
                    "keywordOptimizationOpportunities": [ "Array of summary strings for keyword fixes" ],
                    "softSkillGaps": [ "Array of strings: Soft skills required by JD but not signaled" ],
                    "educationFit": {
                        "status": "Match" | "Partial" | "Mismatch",
                        "details": "Specific explanation of degree/major comparison"
                    },
                    "experienceFitSummary": "2-3 sentences analyzing seniority and relevance",
                    "recommendations": [
                        "Array of strings: Concrete, actionable advice.",
                        "MUST link directly to a missing skill or keyword.",
                        "Do not give generic advice."
                    ]
                    }

                    ================================================================================
                    SECTION 6: FINAL SANITY CHECK
                    ================================================================================

                    Before printing JSON:
                    1. Did you list "AWS", "Azure", and "GCP" as 3 separate missing items? If yes, CONSOLIDATE them into one.
                    2. Is the score > 80 but "Core Tech" is missing? If yes, LOWER the score to 55.
                    3. Are preferred skills in the "missing" list? If yes, MOVE them to "preferredExposureGaps".

                    ================================================================================
                    INPUT DATA
                    ================================================================================

                    RESUME TEXT:
                    [RESUME TEXT]

                    JOB DESCRIPTION:
                    [JOB DESCRIPTION]

                    JOB TITLE:
                    [JOB TITLE]

                    PERFORM ANALYSIS. GENERATE ONLY JSON.





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
                     
stopLoaderCycle();
        document.querySelector(".aipnl").style.display = "none";

                    btn.style.display = "block";
        btn.disabled = false;

        }
});



       
        

    }
};