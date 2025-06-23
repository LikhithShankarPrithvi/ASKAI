from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from google import genai
from dotenv import load_dotenv
from typing import List, Dict, Optional
load_dotenv()
import os


app = FastAPI()

# Allow CORS for local development (adjust origins as needed)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))

class AskRequest(BaseModel):
    question: str
    pageContent: str
    pageHtml: str
    summary: Optional[str] = ""
    recentMessages: Optional[List[Dict]] = []

@app.post("/ask")
def ask_ai(request: AskRequest):
    try:
        # Build conversation context
        context = (
            f"Summary so far: {request.summary}\n"
        )
        for msg in request.recentMessages or []:
            context += f"{msg.get('role', 'user')}: {msg.get('content', '')}\n"
        context += f"User: {request.question}\n"
        if request.pageContent:
            context += f"PageContent: {request.pageContent}\n"
        context += "\nAs an AI assistant, answer ONLY the user's latest question above. Do NOT summarize the conversation."
        # Ask for answer
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=context,
        )
        answer = response.text
        # Ask for updated summary
        summary_prompt = (
            f"Here is the previous summary: {request.summary}\n"
            f"Here are the latest messages (including the new answer):\n"
        )
        for msg in request.recentMessages or []:
            summary_prompt += f"{msg.get('role', 'user')}: {msg.get('content', '')}\n"
        summary_prompt += f"assistant: {answer}\n"
        summary_prompt += "\nPlease provide a concise summary of the conversation so far."
        summary_response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=summary_prompt,
        )
        new_summary = summary_response.text
        return {"answer": answer, "summary": new_summary}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

###### Old Code Above
###### New code Below - for vercel


# # api/ask.py
# import os
# from fastapi import HTTPException
# from pydantic import BaseModel
# from google import genai
# from starlette.requests import Request
# from starlette.responses import JSONResponse

# # Setup Gemini Client
# client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))

# class AskRequest(BaseModel):
#     question: str
#     pageContent: str
#     pageHtml: str

# async def handler(request: Request):
#     try:
#         data = await request.json()
#         payload = AskRequest(**data)

#         response = client.models.generate_content(
#             model="gemini-2.5-flash", 
#             contents=payload.question + " If needed this is PageContent: " + payload.pageContent
#         )
#         return JSONResponse({"answer": response.text})
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))
