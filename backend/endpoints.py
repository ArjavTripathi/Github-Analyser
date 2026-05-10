from fastapi import FastAPI
import github, Logic.processor as processor
from auth import router as auth_router

app = FastAPI()
app.include_router(auth_router)


@app.get("/dev/{username}")
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

