# Job Hunt — Resume Relevance Analyzer

Job Hunt is a browser extension that helps applicants identify which of their existing resumes is most relevant to a job listing. It extracts job-related skills from the currently open page, scans a user-selected local directory of PDF resumes, and ranks the resumes using a transparent skill-overlap score.

The goal is to help applicants choose a suitable resume before applying—not to claim that a score guarantees an interview or hiring outcome.

## Key features

- **Job-page extraction:** Reads relevant job text from the active job listing page, including supported job boards.
- **Local resume library:** Lets the user select a directory of PDF resumes for scanning.
- **Resume ranking:** Compares extracted job requirements with skills found in each resume and displays relevance scores.
- **Skill normalization:** Maps common aliases and related terminology to canonical skill names to improve matching.
- **Actionable results:** Shows the job title, detected skills, and per-resume scores so applicants can compare options.
- **Copyable skill list:** Makes it easier to reuse extracted skills when tailoring an application.
- **Privacy-conscious workflow:** Resume processing is designed to happen locally in the browser; resume files are not intentionally uploaded to a remote service.

## How it works

1. Open a supported job listing in Chrome or a compatible Chromium browser.
2. Run the extension to extract the job title, description, skills, and relevant requirements.
3. Select the local directory containing your resume PDFs when prompted.
4. The extension parses the PDFs and normalizes the skills it detects.
5. A deterministic matching process compares job skills with resume skills.
6. Review the ranked resumes and choose the version that best represents your experience.

## Matching approach

The current approach is based on normalized skill overlap rather than a claim of deep semantic understanding. In broad terms:

- Extract candidate skills from the job listing and resume text.
- Normalize aliases to canonical skill names.
- Compare the job skill set with each resume's skill set.
- Calculate and display a relevance score for each resume.

A high score means stronger overlap under the configured matching rules. It does not independently verify years of experience, proficiency, project impact, or the truth of a resume claim.

## Technology

- Chrome Extensions API / Manifest V3
- JavaScript
- Content scripts and extension background/service-worker components
- File System Access API for user-selected local directories
- PDF.js for PDF text extraction
- Skill taxonomy and alias normalization
- Deterministic relevance scoring

## Setup

The project build uses npm.

```bash
npm install
npm run prepare-extension
```

After the build, load the generated `resume-match-extension` directory as an unpacked extension:

1. Open `chrome://extensions`.
2. Enable **Developer mode**.
3. Choose **Load unpacked**.
4. Select the generated `resume-match-extension` directory.
5. Open a supported job listing and run the extension.

If your local checkout uses different scripts or output paths, use the commands and directory names defined in its `package.json` and build configuration.

## Privacy and permissions

The extension needs access to the active job page and user-selected resume files to perform its work. Review the manifest and browser permission prompts before use. Only select directories that you intend to scan. Avoid running it on untrusted pages, and verify the final resume yourself before submitting an application.

## Current limitations

- Results depend on the text that can be extracted from the job page and PDF.
- Scanned/image-only PDFs may require OCR, which is not guaranteed by basic PDF text extraction.
- Skill overlap may miss synonyms or context not represented in the taxonomy.
- A relevance score is a decision aid, not an ATS score or a hiring prediction.
- Website layout changes may require updates to job-page extraction logic.

## Potential improvements

- Add a configurable weighted score for required versus preferred skills.
- Explain score contributions and show matched and missing skills.
- Add support for more job boards and document formats.
- Improve synonym coverage and evaluate matching quality against labeled examples.
- Add optional experience, role, and responsibility matching.
- Provide a clear export or report of the comparison.

## Project status

Use this README as a project overview; confirm supported websites, permissions, and build commands against the current source before publishing.



# Resume Match Scout

A local-first Chrome/Chromium extension that:

1. Detects the current supported job board.
2. Extracts the job title and visible job-description text.
3. Detects skills from a built-in software-engineering skill dictionary plus your custom skills.
4. Recursively scans a user-selected local resume directory for PDFs.
5. Extracts PDF text locally with PDF.js.
6. Scores every resume as `matched detected skills / detected skills`.
7. Shows the job title, extracted skills, copy button, and sorted resume scores in an in-page modal.

No resume or job text is sent to a remote service.

## Supported boards

LinkedIn, Indeed, JobStreet, SEEK, Monster, StepStone, Totaljobs, CV-Library, EURES, Glassdoor, Reed, CWJobs, Jobsite, XING Jobs, EuroJobs, Wellfound, Dice and ZipRecruiter. The content extractor has a generic visible-text fallback.



# To Support

Your list covers the dominant general and regional job boards, but it misses several high-impact, tech-specific platforms essential for modern Software Development Engineer (SDE) recruiting. [1, 2] 
Your selection is geographically comprehensive across the US, UK, Europe, and Asia-Pacific, but modern tech recruiting relies heavily on niche platforms, developer communities, and direct sourcing aggregators. [2, 3] 
## What Your List Covers Well

* 
* Global Aggregators & Networking: [LinkedIn](https://www.linkedin.com/jobs), [Indeed](https://www.indeed.com), [Glassdoor](https://www.glassdoor.com), and [ZipRecruiter](https://www.ziprecruiter.com) provide massive volume and high recruiter visibility.
* Regional Strongholds: [JobStreet](https://www.jobstreet.com/) and [SEEK](https://www.seek.com.au) dominate Southeast Asia and Australasia; [Reed](https://www.reed.co.uk), [CWJobs](https://www.cwjobs.co.uk), [Totaljobs](https://www.totaljobs.com), and [CV-Library](https://www.cv-library.co.uk) cover the UK; and [StepStone](https://www.stepstone.de), [XING Jobs](https://www.xing.com/jobs), and EURES serve mainland Europe.
* Legacy Tech & Startups: [Dice](https://www.dice.com) captures enterprise and contract engineering, while [Wellfound](https://wellfound.com) targets early-stage startups. [1, 3, 4, 5, 6, 7] 
* 

## Critical Gaps for Software Engineers
Top tech companies and tech-first startups frequently bypass generic aggregators in favor of higher-signal channels:

* 
* Startup & High-Growth Ecosystems:
* Y Combinator Work at a Startup: The primary platform for funded, high-growth YC companies hiring engineers directly.
   * Hacker News (Who is Hiring?): Monthly developer threads on [Hacker News](https://news.ycombinator.com) connect engineers directly with engineering managers and founders, bypassing standard applicant tracking systems (ATS). [1, 8, 9] 
* Developer-Centric & Transparent Boards:
* Otta: Highly curated for product-led tech companies and VC-backed scale-ups, featuring built-in salary and tech stack transparency.
   * [Levels.fyi](https://www.levels.fyi/jobs): Job board paired directly with verified compensation and leveling data.
   * [Built In](https://builtin.com): Critical for major US tech hubs, focusing on company culture, tech stacks, and engineering perks. [1, 2, 4] 
* Remote-First Engineering Hubs:
* [We Work Remotely](https://weworkremotely.com) & [Remote OK](https://remoteok.com): Standard destinations for fully remote software engineering roles with verified salary floors. [1, 2] 
* 

## Strategic Takeaways to Land an SDE Role

* 
* Ditch Low-Signal Cold Applying: Giant boards like Indeed and LinkedIn have low conversion rates due to automated applicant spam. [10] 
* Prioritize Direct Career Pages: Use boards to discover open roles, but submit applications through the company's direct careers portal (e.g., Greenhouse, Lever, Ashby, or Workday links). [10, 11] 
* Leverage Referrals: Identify target companies on these boards, then use your network to secure an internal employee referral before submitting an application. [10, 11] 
* 

Could you share your target region, years of experience, or preferred company profile (early-stage startup vs. enterprise/Big Tech) so I can tailor the most effective application channels for your search?

[1] [https://rockstardeveloperuniversity.com](https://rockstardeveloperuniversity.com/best-developer-job-boards/)
[2] [https://dev.to](https://dev.to/kstabach/best-job-sites-for-software-engineers-in-2026-complete-comparison-guide-579a)
[3] [https://mvc-resources.com](https://mvc-resources.com/list-of-job-boards-in-malaysia-10-best-job-portals-for-employers-and-job-seekers-2026-guide/)
[4] [https://proficiently.com](https://proficiently.com/blog/best-tech-job-boards/)
[5] [https://www.reeracoen.com.my](https://www.reeracoen.com.my/articles/best-job-portals-and-career-platforms-to-use-in-malaysia)
[6] [https://www.linkedin.com](https://www.linkedin.com/pulse/top-10-job-sites-worldwide-sudipta-sarkhel-kcmqc)
[7] https://www.jobstreet.com
[8] [https://medium.com](https://medium.com/coding-at-dawn/top-10-remote-job-boards-for-finding-great-software-engineering-jobs-f319c17381f1)
[9] [https://underdog.io](https://underdog.io/blog/software-engineer-job-board)
[10] [https://www.reddit.com](https://www.reddit.com/r/cscareerquestions/comments/1lwr7i6/software_engineer_top_3_favorite_job_search/)
[11] [https://www.linkedin.com](https://www.linkedin.com/posts/izzmier_this-is-the-list-of-job-platforms-i-always-activity-7355930124933869568-h09T)



## Install

```bash
npm install
npm run prepare-extension
```

Then open `chrome://extensions`, enable Developer mode, choose **Load unpacked**, and select this folder. Open **Extension options**, choose your resume directory, select the job boards you use, and add custom skills if required.

Open a job posting and click **Run resume match**.

## Scoring

`score = matched detected skills / detected job skills * 100`.

Matching is local and deterministic. It normalizes case/punctuation and includes common aliases. The score does not judge seniority, years of experience, achievements, education, location, salary, or overall resume quality.

## Limitations

- Image-only/scanned PDFs need OCR and may score 0.
- Job-board DOM structures change; selectors are intentionally layered and can be updated in `content.js`.
- The current version scans PDF files. DOCX support can be added later.
- Directory access is explicitly granted by the user through the folder picker.
