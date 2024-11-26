from fastapi import FastAPI, HTTPException
from fastapi.responses import HTMLResponse
from dotenv import load_dotenv
from pydantic import BaseModel
from fastapi.staticfiles import StaticFiles
import google.generativeai as genai
import os

load_dotenv()
app = FastAPI()
app.mount("/static", StaticFiles(directory=os.path.join(os.path.dirname(__file__), "static")), name="static")

#Basemodel to specify the types
class ChatRequest(BaseModel):
    parts: str
    history: list = []

@app.get("/")
def read_root():
    return {"Hola": "Samvardha :)"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", 8080)))

#Chatbot Get Route
@app.get("/chatbot", response_class=HTMLResponse)
async def index_load():

    #Readd index.html
    with open(os.path.join(os.path.dirname(__file__), "index.html"), "r") as f:
        content = f.read()
    return content

#Chatbot Post Route
@app.post("/chatbot")
def gemini_api(chat_request: ChatRequest):
    try:

        api_key = os.environ.get("geminiAPI")
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel("gemini-1.5-flash")
        
        #Chat History - Backend Side
        chat_history = chat_request.history.copy()
        chat_history.append({"role": "user", "parts": chat_request.parts})

        chat = model.start_chat(history=chat_history)
        
        response = chat.send_message(chat_request.parts)

        #Generated text from the Bot
        generated_text = ""
        for chunk in response:
            if chunk.text:
                generated_text += chunk.text

        #Chat History annd Generated Text returned
        return {"response": generated_text, "history": chat_history}

    #Error Handling
    except KeyError:
        raise HTTPException(status_code=500, detail="API key is not set in environment variables")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))