from datetime import datetime, timezone

async def get_scores(repo : dict) -> float:
    pushed = repo["pushtime"]
    push = await recency_score(pushed)
    polish = await polish_score(repo)
    score = ( 
        repo["stars"] * 0.4 +
        repo["forks"] * 0.3 +
        push * 0.2 +
        polish * 0.1
        )
    
    return score


async def polish_score(repo: dict) -> float:
    score = 0.0
    if repo.get("description"):   score += 0.33
    if repo.get("topics"):        score += 0.33
    if repo.get("license"):       score += 0.33
    return score

async def recency_score(pushed_at: str) -> float:
    pushed = datetime.fromisoformat(pushed_at.replace("Z", "+00:00"))
    days_ago = (datetime.now(timezone.utc) - pushed).days
    return max(0.0, 1.0 - (days_ago / 730))