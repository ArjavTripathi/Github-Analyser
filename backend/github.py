import os
import asyncio
import httpx
from dotenv import load_dotenv

import Logic.processor as processor

load_dotenv()

BASE_URL = "https://api.github.com"
TOKEN = os.getenv("GITHUB_TOKEN")

HEADERS = {
    "Authorization": f"Bearer {TOKEN}",
    "Accept": "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
}

async def get_user(username: str) -> dict:
    async with httpx.AsyncClient() as client:
        res = await client.get(f"{BASE_URL}/users/{username}", headers=HEADERS)
        res.raise_for_status()
        return processor.clean_profiles_json(res.json())

async def get_repos(username: str) -> list:
    repos = []
    page = 1
    async with httpx.AsyncClient() as client:
        while True:
            res = await client.get(
                f"{BASE_URL}/users/{username}/repos",
                headers=HEADERS,
                params={"per_page": 100, "page": page, "sort": "updated"},
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

async def get_languages_for_repos(username: str, repo_names: list[str]) -> dict:
    tasks = [get_repo_languages(username, name) for name in repo_names]
    results = await asyncio.gather(*tasks, return_exceptions=True)

    aggregated: dict[str, int] = {}
    for result in results:
        if isinstance(result, Exception):
            continue
        for lang, byte_count in result.items():
            aggregated[lang] = aggregated.get(lang, 0) + byte_count

    return processor.compute_language_percentages(aggregated)

async def get_events(username: str) -> list:
    events = []
    async with httpx.AsyncClient() as client:
        for page in range(1, 4):
            res = await client.get(
                f"{BASE_URL}/users/{username}/events/public",
                headers=HEADERS,
                params={"per_page": 100, "page": page},
            )
            if res.status_code != 200:
                break
            batch = res.json()
            if not batch:
                break
            events.extend(batch)
    return events
