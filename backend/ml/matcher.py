from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

# ----------------------------------------------------
# LEVEL WEIGHTS (must match DB values: beginner/intermediate/advanced)
# ----------------------------------------------------
LEVEL_WEIGHTS = {
    "beginner": 1,
    "intermediate": 2,
    "advanced": 3,
}


# ----------------------------------------------------
# BUILD SKILL VOCAB
# ----------------------------------------------------
def build_skill_vocab(users_list):
    """
    Build a mapping: skill_name -> index in vector
    We collect skills from both "skills_have" and "skills_want".
    """
    skills = set()

    for user in users_list:
        # skills_have: list of {"name": ..., "level": ...}
        for s in user.get("skills_have", []):
            skills.add(s["name"].strip().lower())

        # skills_want: list of "skill_name" strings
        for name in user.get("skills_want", []):
            skills.add(name.strip().lower())

    # Sort so it's deterministic
    return {skill: idx for idx, skill in enumerate(sorted(skills))}


# ----------------------------------------------------
# BUILD VECTORS
# ----------------------------------------------------
def build_have_vector(user, skill_vocab):
    """
    For a given user, build a vector based on skills they HAVE.
    Each skill contributes a weight based on level.
    """
    vec = np.zeros(len(skill_vocab), dtype=float)

    for s in user.get("skills_have", []):
        name = s["name"].strip().lower()
        idx = skill_vocab.get(name)
        if idx is None:
            continue

        level = s.get("level", "beginner")
        weight = LEVEL_WEIGHTS.get(level, 1)
        vec[idx] = weight

    return vec


def build_want_vector(user, skill_vocab):
    """
    For a given user, build a vector based on skills they WANT.
    Each wanted skill has weight 1.
    """
    vec = np.zeros(len(skill_vocab), dtype=float)

    for name in user.get("skills_want", []):
        idx = skill_vocab.get(name.strip().lower())
        if idx is not None:
            vec[idx] = 1.0

    return vec


# ----------------------------------------------------
# MAIN MATCHING FUNCTION
# ----------------------------------------------------
def find_best_mentors(current_user_id, users_list, top_k=5, min_score=0.0):
    """
    current_user_id: user who is LEARNING
    users_list: list of dicts with keys:
        id, name, skills_have (list of {name, level}), skills_want (list of names)

    Returns: list of {"user": <user_dict>, "score": <float>} sorted by score desc.
    """
    if not users_list:
        return []

    # Build vocabulary of all skills
    skill_vocab = build_skill_vocab(users_list)

    # Find the current user object
    current_user = None
    for user in users_list:
        if user["id"] == current_user_id:
            current_user = user
            break

    if current_user is None:
        return []

    # Build WANT vector for current user
    current_vec = build_want_vector(current_user, skill_vocab)
    if not current_vec.any():
        # user has no "wants", can't match
        return []

    mentor_vectors = []
    mentor_meta = []

    # Build HAVE vectors for all potential mentors
    for user in users_list:
        if user["id"] == current_user_id:
            continue  # don't match with self

        have_vec = build_have_vector(user, skill_vocab)
        if not have_vec.any():
            # this user has no skills to teach
            continue

        mentor_vectors.append(have_vec)
        mentor_meta.append(user)

    if not mentor_vectors:
        return []

    mentor_matrix = np.stack(mentor_vectors)

    # Compute cosine similarity
    sims = cosine_similarity(current_vec.reshape(1, -1), mentor_matrix)[0]

    results = []
    for meta, score in zip(mentor_meta, sims):
        if score >= min_score:
            results.append(
                {
                    "user": meta,
                    "score": float(score),
                }
            )

    # Sort highest score first
    results.sort(key=lambda x: x["score"], reverse=True)
    return results[:top_k]


# ----------------------------------------------------
# Small manual test (optional)
# ----------------------------------------------------
if __name__ == "__main__":
    users_sample = [
        {
            "id": 1,
            "name": "learner1",
            "skills_have": [],
            "skills_want": ["react", "dsa"],
        },
        {
            "id": 2,
            "name": "mentor1",
            "skills_have": [
                {"name": "react", "level": "advanced"},
                {"name": "dsa", "level": "intermediate"},
            ],
            "skills_want": [],
        },
    ]

    matches = find_best_mentors(1, users_sample, top_k=5)
    print(matches)
