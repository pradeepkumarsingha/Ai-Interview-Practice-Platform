import pandas as pd
import random

ROLE_SKILLS = {
    "Data Analyst": [
        "python","sql","power bi","excel",
        "tableau","statistics","data visualization"
    ],

    "Data Scientist": [
        "python","machine learning","statistics",
        "pandas","numpy","tensorflow","data analysis"
    ],

    "ML Engineer": [
        "python","tensorflow","pytorch",
        "deep learning","nlp",
        "computer vision","mlops"
    ],

    "AI Engineer": [
        "python","llm","rag",
        "langchain","transformers",
        "vector database",
        "prompt engineering"
    ],

    "Software Engineer": [
        "java","dsa","oops",
        "dbms","system design","sql"
    ],

    "Full Stack Developer": [
        "react","nodejs","mongodb",
        "javascript","html",
        "css","express"
    ],

    "DevOps Engineer": [
        "docker","kubernetes","linux",
        "jenkins","terraform",
        "github actions"
    ],

    "Cloud Engineer": [
        "aws","azure","gcp",
        "cloud security",
        "terraform","linux"
    ]
}

rows = []

for _ in range(5000):

    role = random.choice(
        list(ROLE_SKILLS.keys())
    )

    jd_skills = ROLE_SKILLS[role]

    total_jd = len(jd_skills)

    overlap = random.randint(
        int(total_jd*0.4),
        total_jd
    )

    matched_skills = random.sample(
        jd_skills,
        overlap
    )

    all_skills = list(
        set(
            sum(
                ROLE_SKILLS.values(),
                []
            )
        )
    )

    noise = random.sample(
        all_skills,
        random.randint(0,2)
    )

    resume_skills = list(
        set(
            matched_skills + noise
        )
    )

    projects = random.randint(1,5)

    internships = random.randint(0,3)

    certifications = random.randint(0,5)

    cgpa = round(
        random.uniform(6.5,9.8),
        1
    )

    skill_match = (
        overlap / total_jd
    ) * 100

    ats_score = (
        skill_match * 0.75
        + projects * 2
        + internships * 3
        + certifications * 1.5
        + cgpa * 0.5
    )

    ats_score = min(
        100,
        round(ats_score,2)
    )

    rows.append({

        "resume_skills":
            " ".join(resume_skills),

        "jd_skills":
            " ".join(jd_skills),

        "projects":
            projects,

        "internships":
            internships,

        "certifications":
            certifications,

        "cgpa":
            cgpa,

        "ats_score":
            ats_score
    })

df = pd.DataFrame(rows)

df.to_csv(
    "ats_dataset.csv",
    index=False
)

print(df.head())
print("Rows:",len(df))