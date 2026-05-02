import re
import os
import torch
from sentence_transformers import SentenceTransformer, util
from typing import List, Dict, Any
import json
import torch.nn as nn
from transformers import AutoTokenizer, AutoModel# ==============================
# CONFIG & MODEL
# ==============================
MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

print(f"Loading Profile Analyzer base model: {MODEL_NAME} on {device}...")
model = SentenceTransformer(MODEL_NAME, device=device)

# ==============================
# CUSTOM TRAINED MODEL
# ==============================
MODEL_DIR = os.path.join(os.path.dirname(__file__), "model_v1")

class ResumeModel(nn.Module):
    def __init__(self, model_name, num_labels):
        super().__init__()
        self.bert = AutoModel.from_pretrained(model_name)
        hidden = self.bert.config.hidden_size
        self.classifier = nn.Linear(hidden, num_labels)
        self.regressor = nn.Linear(hidden, 1)

    def forward(self, input_ids, attention_mask, labels=None, scores=None):
        out = self.bert(input_ids=input_ids, attention_mask=attention_mask)
        cls = out.last_hidden_state[:, 0]
        logits = self.classifier(cls)
        score = self.regressor(cls)
        return {"logits": logits, "score": score}

def load_trained_model():
    with open(os.path.join(MODEL_DIR, "config.json")) as f:
        cfg = json.load(f)

    tokenizer = AutoTokenizer.from_pretrained(MODEL_DIR)
    custom_model = ResumeModel(cfg["model_name"], cfg["num_labels"])
    custom_model.load_state_dict(torch.load(os.path.join(MODEL_DIR, "model.pt"), map_location=device))
    custom_model.to(device)
    custom_model.eval()

    return custom_model, tokenizer, cfg

try:
    if os.path.exists(MODEL_DIR):
        print("Loading custom trained Resume Model...")
        custom_model, custom_tokenizer, custom_cfg = load_trained_model()
    else:
        print("Custom model not found, falling back to heuristics.")
        custom_model = None
except Exception as e:
    print(f"Error loading custom model: {e}")
    custom_model = None

# ==============================
# ROLE SKILLS DATABASE (UPDATED)
# ==============================
ROLE_SKILLS = {
    # ===== TECH =====
    "backend developer": ["Python", "Django", "FastAPI", "SQL", "PostgreSQL", "NoSQL", "Redis", "AWS", "Docker", "Kubernetes", "CI/CD", "Microservices", "REST API", "Unit Testing"],
    "frontend developer": ["React", "JavaScript", "TypeScript", "HTML5", "CSS3", "Next.js", "TailwindCSS", "Redux", "Zustand", "Webpack", "Vite", "Accessibility", "Responsive Design"],
    "full stack developer": ["React", "Node.js", "Express", "MongoDB", "PostgreSQL", "JavaScript", "TypeScript", "Docker", "AWS", "CI/CD", "REST API", "Git", "System Design"],
    "data scientist": ["Python", "Pandas", "NumPy", "Scikit-Learn", "TensorFlow", "PyTorch", "NLP", "Machine Learning", "Data Visualization", "Matplotlib", "Seaborn", "Statistics"],
    "data engineer": ["Python", "SQL", "Spark", "Hadoop", "ETL", "Airflow", "Data Warehousing", "Snowflake", "Databricks", "BigQuery", "Data Modeling", "Kafka"],
    "data analyst": ["SQL", "Excel", "Tableau", "Power BI", "Python", "Data Cleaning", "Statistics", "A/B Testing", "Dashboarding", "R", "Pandas"],
    "machine learning engineer": ["Python", "TensorFlow", "PyTorch", "Scikit-Learn", "MLOps", "Model Deployment", "Neural Networks", "Deep Learning", "KServe", "MLflow"],
    "devops engineer": ["AWS", "Terraform", "Docker", "Kubernetes", "Jenkins", "GitHub Actions", "Linux", "Bash", "Monitoring", "Prometheus", "Grafana", "Ansible", "Cloud Security"],
    "cloud architect": ["AWS", "Azure", "GCP", "Cloud Formation", "Serverless", "Infrastructure as Code", "Security Compliance", "Network Design", "Cost Optimization"],
    "cybersecurity analyst": ["Network Security", "Penetration Testing", "SIEM", "Incident Response", "Vulnerability Assessment", "Firewalls", "Cryptography", "Compliance"],
    "software engineer": ["Java", "C++", "Python", "Go", "Git", "Algorithms", "Data Structures", "System Design", "Agile", "Unit Testing"],
    "qa engineer": ["Selenium", "Automation Testing", "Unit Testing", "Jira", "Postman", "Test Planning", "Cypress", "Appium", "Regression Testing"],
    "game developer": ["Unity", "C#", "Unreal Engine", "C++", "3D Modeling", "Physics Engine", "Game Design", "OpenGL", "DirectX"],
    "mobile app developer": ["Swift", "Kotlin", "React Native", "Flutter", "iOS Development", "Android Development", "Mobile UX", "Firebase"],
    "ui engineer": ["CSS", "HTML", "JavaScript", "Figma", "Design Systems", "Tailwind", "SASS", "Animation", "Responsive Design"],

    # ===== NON-TECH & BUSINESS =====
    "hr": ["Recruitment", "Talent Acquisition", "Onboarding", "Employee Relations", "HR Policies", "Performance Management", "Payroll", "Conflict Resolution", "HRIS"],
    "human resources specialist": ["Recruitment", "Talent Acquisition", "Onboarding", "Employee Relations", "HR Policies", "Performance Management", "Payroll", "Conflict Resolution", "HRIS"],
    "marketing": ["SEO", "Content Marketing", "Social Media", "Branding", "Campaign Management", "Google Analytics", "Lead Generation", "Email Marketing", "PPC", "Market Research"],
    "digital marketing specialist": ["SEO", "SEM", "Social Media Ads", "Content Strategy", "Email Automation", "Google Ads", "Analytics", "Brand Management"],
    "sales": ["Lead Generation", "CRM", "Negotiation", "Client Relationship", "Sales Strategy", "Cold Calling", "B2B Sales", "Revenue Growth", "Salesforce"],
    "finance": ["Financial Analysis", "Excel", "Budgeting", "Forecasting", "Accounting", "Financial Modeling", "Risk Analysis", "Taxation", "Audit"],
    "business analyst": ["Requirements Gathering", "Stakeholder Management", "Data Analysis", "Excel", "SQL", "Documentation", "Process Improvement", "UML", "Agile", "Jira"],
    "product manager": ["Product Vision", "Roadmapping", "Agile", "Scrum", "User Research", "Market Analysis", "Data Analytics", "Prioritization", "Communication", "Stakeholder Management"],
    "project manager": ["Budgeting", "Risk Management", "Agile", "Scrum", "Kanban", "Resource Planning", "Stakeholder Communication", "Jira", "MS Project"],
    "content writer": ["Copywriting", "Creative Writing", "SEO Optimization", "Editing", "Proofreading", "Research", "Script Writing", "Blog Post"],
    "ux designer": ["User Research", "Wireframing", "Prototyping", "Figma", "Adobe XD", "Usability Testing", "Interaction Design", "User Journeys"],
    "ui designer": ["Figma", "Visual Design", "Typography", "Color Theory", "Prototyping", "Design Systems", "Iconography", "Layout Design"]
}

# ==============================
# PROFILE ANALYZER
# ==============================
class ProfileAnalyzer:
    def __init__(self, target_role: str):
        # Strip and handle case-insensitivity
        self.target_role = target_role.strip().lower()
        self.target_skills = ROLE_SKILLS.get(self.target_role, [])

    # ------------------------------
    def _clean_text(self, text: str) -> str:
        text = text.lower()
        text = re.sub(r'\s+', ' ', text).strip()
        return text

    # ------------------------------
    def _extract_skills(self, text: str) -> List[str]:
        detected = []
        text_lower = text.lower()

        for skill in self.target_skills:
            # Use regex for whole-word matching to avoid false positives (e.g., 'java' in 'javascript')
            pattern = r'\b' + re.escape(skill.lower()) + r'\b'
            if re.search(pattern, text_lower):
                detected.append(skill)

        return list(set(detected))

    # ------------------------------
    def _compute_semantic_similarity(self, resume_text: str, linkedin_text: str) -> float:
        if not self.target_skills:
            return 0.5

        combined_text = f"{resume_text} {linkedin_text}"
        profile_string = f"{self.target_role} " + " ".join(self.target_skills)

        text_embedding = model.encode(combined_text, convert_to_tensor=True)
        profile_embedding = model.encode(profile_string, convert_to_tensor=True)

        similarity = util.cos_sim(text_embedding, profile_embedding).item()
        return max(0.0, min(1.0, similarity))

    # ------------------------------
    def _generate_suggestions(self, missing_skills: List[str], similarity_score: float) -> List[str]:
        suggestions = []

        for skill in missing_skills[:5]:
            suggestions.append(f"Add or highlight '{skill}' in your profile for {self.target_role} roles.")

        if similarity_score < 0.6:
            suggestions.append("Improve alignment of your resume with the target role using clearer keywords.")

        # Role-specific suggestions
        if self.target_role in ["marketing", "sales", "hr"]:
            suggestions.append("Include measurable achievements (e.g., % growth, targets achieved, hiring numbers).")

        if self.target_role in ["finance", "business analyst"]:
            suggestions.append("Highlight analytical tools like Excel, dashboards, or reporting.")

        if self.target_role == "product manager":
            suggestions.append("Add product case studies, roadmap ownership, or user impact stories.")

        if len(missing_skills) > 5:
            suggestions.append("Focus on building core skills before optimizing your resume.")

        return suggestions

    # ------------------------------
    def _generate_linkedin_suggestions(self, missing_skills: List[str]) -> Dict[str, Any]:
        """
        Provides specific LinkedIn profile section suggestions.
        """
        role = self.target_role.title()
        top_skills = self.target_skills[:5]
        
        if not top_skills:
            top_skills = ["Key Industry Skills", "Strategic Planning", "Leadership"]

        # Headline suggestion
        headline = f"{role} | Specializing in {', '.join(top_skills[:3])} | Building high-impact solutions"
        if not headline or len(headline) < 5:
            headline = f"{role} Professional | Strategic Industry Leader"
        
        # About suggestion
        about = f"As a {role} with a deep passion for excellence and innovation, " \
                f"I specialize in {', '.join(top_skills[:4])}. I have a proven track record of " \
                f"driving results and delivering value through strategic, data-informed decisions."
        
        # Experience bullet points
        experience = [
            f"Implemented {top_skills[0]} solutions to optimize project delivery and efficiency.",
            f"Collaborated with cross-functional teams to integrate {top_skills[1] if len(top_skills) > 1 else 'advanced workflows'} into standard operations.",
            f"Leveraged {top_skills[2] if len(top_skills) > 2 else 'industry-leading tools'} to improve performance and scalability across multi-stage projects."
        ]
        
        if missing_skills:
            experience.append(f"Actively building proficiency in {', '.join(missing_skills[:2])} to stay at the forefront of {role} trends.")

        return {
            "headline": headline,
            "about": about,
            "experience": experience
        }

    # ------------------------------

    # ------------------------------
    def analyze(self, resume_text: str, linkedin_text: str) -> Dict[str, Any]:

        # Skill extraction
        resume_skills = self._extract_skills(resume_text)
        linkedin_skills = self._extract_skills(linkedin_text)

        all_detected_skills = list(set(resume_skills + linkedin_skills))

        # Skill match
        if not self.target_skills:
            skill_match_percent = 0
            missing_skills = []
        else:
            skill_match_percent = round((len(all_detected_skills) / len(self.target_skills)) * 100, 2)
            missing_skills = [s for s in self.target_skills if s not in all_detected_skills]

        # Semantic similarity
        similarity_score = self._compute_semantic_similarity(resume_text, linkedin_text)

        # Utilize custom model if available
        model_confidence = 0.5
        predicted_roles = []
        combined_text = f"{resume_text} {linkedin_text} {self.target_role}"

        if custom_model is not None:
            inputs = custom_tokenizer(combined_text, return_tensors="pt", truncation=True, padding=True).to(device)
            with torch.no_grad():
                out = custom_model(input_ids=inputs["input_ids"], attention_mask=inputs["attention_mask"])
            
            probs = torch.softmax(out["logits"], dim=1)
            top3 = torch.topk(probs, k=3)
            
            top_conf = float(top3.values[0][0].item())
            # Normalize confidence map
            model_confidence = 0.5 + 0.5 * top_conf
            
            for i in range(3):
                idx = top3.indices[0][i].item()
                role_name = custom_cfg["id2label"][str(idx)].lower()
                predicted_roles.append({
                    "role": role_name.title(),
                    "confidence": round(top3.values[0][i].item()*100, 2)
                })

        # Quality heuristics
        quality = 0.0
        words = len(resume_text.split())
        if words > 250: quality += 0.4
        elif words > 120: quality += 0.3
        elif words > 60: quality += 0.2
        else: quality += 0.1

        if "project" in resume_text.lower(): quality += 0.2
        if "experience" in resume_text.lower(): quality += 0.2
        if "skill" in resume_text.lower(): quality += 0.2
        quality = min(quality, 1.0)

        # ATS Score combining semantic similarity, confidence, and quality
        ats_score = round(
            (0.65 * similarity_score) +
            (0.25 * model_confidence) +
            (0.1 * quality),
            2
        ) * 100
        ats_score = min(100.0, max(ats_score, 30.0))

        return {
            "ATS Score": ats_score,
            "Skill Match %": skill_match_percent,
            "Matched Skills": all_detected_skills,
            "Missing Skills": missing_skills,
            "Suggestions": self._generate_suggestions(missing_skills, similarity_score),
            "LinkedIn Suggestions": self._generate_linkedin_suggestions(missing_skills),
            "Semantic Similarity Score": round(similarity_score, 3),
            "Predicted Roles": [pr["role"] for pr in predicted_roles] if predicted_roles else []
        }

# ==============================
# TEST
# ==============================
if __name__ == "__main__":

    resume = """
    Worked on social media campaigns, branding strategy, and content marketing.
    Increased engagement by 40% and handled email marketing campaigns.
    """

    linkedin = """
    Marketing professional skilled in analytics, branding, and lead generation.
    """

    analyzer = ProfileAnalyzer("marketing")
    result = analyzer.analyze(resume, linkedin)

    print("\n--- ANALYSIS RESULTS ---")
    for key, val in result.items():
        print(f"{key}: {val}")