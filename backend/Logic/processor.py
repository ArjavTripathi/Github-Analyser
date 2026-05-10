import github

async def clean_repo_json(username : str, repo : dict):
    cleaned : dict = {}   
    cleaned["name"] = repo["name"]
    cleaned["isPrivate"] = repo["private"]
    cleaned["owner"] = repo["owner"]["login"]
    cleaned["htmlurl"] = repo["html_url"]
    cleaned["fork"] = repo["fork"]
    cleaned["pushtime"] = repo["pushed_at"]
    cleaned["createdtime"] = repo["created_at"]
    cleaned["topics"] = repo["topics"]
    cleaned["size"] = repo["size"]
    cleaned["license"] = repo["license"]
    cleaned["open_issues_count"] = repo["open_issues_count"]
    cleaned["stars"] = repo["stargazers_count"]
    cleaned["forks"] = repo["forks_count"]
    cleaned["description"] = repo["description"]

    return cleaned

async def clean_profiles_json(profile : dict):
    cleaned : dict = {}
    wanted = ["login", "avatar_url", "type", "location", "company", "bio"]

    for property in wanted:
        cleaned[property] = profile[property]

    return cleaned