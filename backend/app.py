from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from google import genai

app = FastAPI()

# Allow CORS for local development (adjust origins as needed)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = genai.Client(api_key="AIzaSyD8jmT7tMl7Oymvl3zMoDe33DLWE86FuMU")

class AskRequest(BaseModel):
    question: str

@app.post("/ask")
def ask_ai(request: AskRequest):
    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash", contents=request.question
        )
        return {"answer": response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

