import asyncio
import processor, github, scorer



username = "ArjavTripathi"

async def main():
    repos = await github.get_repos(username=username) 

    scoredict = {}

    for repo in repos:
        cleaned = await processor.clean_repo_json(username=username, repo=repo)
        score = await scorer.get_scores(cleaned)
        scoredict[repo["html_url"]] = score


    sorted_dict = dict(sorted(scoredict.items(), key=lambda item: item[1], reverse=True))
    print(sorted_dict)

    

if __name__ == "__main__":
    asyncio.run(main())