from datetime import datetime, timezone

def polish_score(repo: dict) -> float:
    score = 0.0
    if repo.get("description"):   score += 0.33
    if repo.get("topics"):        score += 0.33
    if repo.get("license"):       score += 0.33
    return score

def recency_score(pushed_at: str) -> float:
    pushed = datetime.fromisoformat(pushed_at.replace("Z", "+00:00"))
    days_ago = (datetime.now(timezone.utc) - pushed).days
    return max(0.0, 1.0 - (days_ago / 730))

def normalize(values: list[float]) -> list[float]:
    max_val = max(values) if max(values) > 0 else 1
    return [v / max_val for v in values]

def rank(repos: list[dict]) -> list[dict]:
    owned = [r for r in repos if not r["fork"]]
    stars_norm = normalize([r["stars"] for r in owned])
    forks_norm = normalize([r["forks"] for r in owned])

    for i, repo in enumerate(owned):
        repo["score"] = (
            stars_norm[i] * 0.4 +
            forks_norm[i] * 0.3 +
            recency_score(repo["pushtime"]) * 0.2 +
            polish_score(repo) * 0.1
        )

    return sorted(owned, key=lambda r: r["score"], reverse=True)