def clean_repo_json(repo: dict) -> dict:
    return {
        "name": repo["name"],
        "isPrivate": repo["private"],
        "owner": repo["owner"]["login"],
        "htmlurl": repo["html_url"],
        "fork": repo["fork"],
        "pushtime": repo["pushed_at"],
        "createdtime": repo["created_at"],
        "topics": repo["topics"],
        "size": repo["size"],
        "license": repo["license"],
        "open_issues_count": repo["open_issues_count"],
        "stars": repo["stargazers_count"],
        "forks": repo["forks_count"],
        "description": repo["description"],
        "language": repo.get("language"),
    }

def clean_profiles_json(profile: dict) -> dict:
    wanted = [
        "login", "name", "avatar_url", "type", "location",
        "company", "bio", "public_repos", "followers", "following", "created_at",
    ]
    return {key: profile.get(key) for key in wanted}

def compute_language_percentages(aggregated: dict) -> dict:
    total = sum(aggregated.values())
    if total == 0:
        return {}
    return {
        lang: round((bytes_count / total) * 100, 2)
        for lang, bytes_count in sorted(aggregated.items(), key=lambda x: x[1], reverse=True)
    }
