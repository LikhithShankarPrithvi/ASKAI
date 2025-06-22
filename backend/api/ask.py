# from fastapi import FastAPI, HTTPException
# from pydantic import BaseModel
# from fastapi.middleware.cors import CORSMiddleware
# from google import genai

# app = FastAPI()

# # Allow CORS for local development (adjust origins as needed)
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# client = genai.Client(api_key="API_KEY")

# class AskRequest(BaseModel):
#     question: str
#     pageContent: str
#     pageHtml: str

# @app.post("/ask")
# def ask_ai(request: AskRequest):
#     try:
#         response = client.models.generate_content(
#             model="gemini-2.5-flash", 
#             contents=request.question + "If needed this is PageContent" + request.pageContent,
#         )   
#         return {"answer": response.text}
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

###### Old Code Above
###### New code Below - for vercel


# api/ask.py
import os
from fastapi import HTTPException
from pydantic import BaseModel
from google import genai
from starlette.requests import Request
from starlette.responses import JSONResponse

# Setup Gemini Client
client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))

class AskRequest(BaseModel):
    question: str
    pageContent: str
    pageHtml: str

async def handler(request: Request):
    try:
        data = await request.json()
        payload = AskRequest(**data)

        response = client.models.generate_content(
            model="gemini-2.5-flash", 
            contents=payload.question + " If needed this is PageContent: " + payload.pageContent
        )
        return JSONResponse({"answer": response.text})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
