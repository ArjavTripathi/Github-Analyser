import os
import httpx
from dotenv import load_dotenv
import Logic.processor as processor

load_dotenv()

BASE_URL = "https://api.github.com"
TOKEN = os.getenv("GITHUB_TOKEN")

HEADERS = {
    "Authorization": f"Bearer {TOKEN}",
    "Accept": "application/vnd.github+json",
    "X-GitHub-Api-Version": "2026-03-10",
}

async def get_user(username: str) -> dict:
    async with httpx.AsyncClient() as client:
        res = await client.get(f"{BASE_URL}/users/{username}", headers=HEADERS)
        res.raise_for_status()  
        cleaned = await processor.clean_profiles_json(res.json())  
        return cleaned
    

async def get_repos(username: str) -> list:
    repos = []
    page = 1

    async with httpx.AsyncClient() as client:
        while True:
            res = await client.get(
                f"{BASE_URL}/users/{username}/repos",
                headers=HEADERS,
                params={
                    "per_page": 100,   
                    "page": page,
                    "sort": "updated",
                },
            )
            res.raise_for_status()
            batch = res.json()
            if not batch:
                break             
            repos.extend(batch)
            page += 1

    return repos

async def get_repo_languages(username: str, repo_name: str) -> dict:
    async with httpx.AsyncClient() as client:
        res = await client.get(
            f"{BASE_URL}/repos/{username}/{repo_name}/languages",
            headers=HEADERS,
        )
        res.raise_for_status()
        return res.json() 




