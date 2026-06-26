import joblib
from pathlib import Path

BASE_DIR = Path(__file__).parent.parent
import numpy as np

from scipy.sparse import hstack


model = joblib.load(
    str(BASE_DIR / "role_recommender" / "models" / "role_model.pkl")
)

tfidf = joblib.load(
    str(BASE_DIR / "role_recommender" / "models" / "tfidf.pkl")
)

encoder = joblib.load(
    str(BASE_DIR / "role_recommender" / "models" / "label_encoder.pkl")
)


def predict_roles(
        skills,
        projects,
        internships,
        certifications,
        cgpa
):

    skill_vector = tfidf.transform([skills])

    numeric_features = np.array(
        [[
            projects,
            internships,
            certifications,
            cgpa
        ]]
    )

    X = hstack([
        skill_vector,
        numeric_features
    ])

    probs = model.predict_proba(X)[0]

    top3_idx = probs.argsort()[-3:][::-1]

    results = []

    for idx in top3_idx:

        results.append({
            "role":
            encoder.inverse_transform([idx])[0],

            "confidence":
            round(float(probs[idx] * 100), 2)
        })

    return results