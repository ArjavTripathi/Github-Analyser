from fastapi import FastAPI
import github, processor

app = FastAPI()

@app.get("/profile/{username}")
async def get_profile(username: str):
    user = await github.get_user(username=username)
    return user 

@app.get("/profile/{username}/getTopRepos")
async def get_all_repos(username: str):
    repos = await github.get_repos(username=username)
    return repos

@app.get("/health")
def health():
    return {"status": "ok"}