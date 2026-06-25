import os
from dotenv import load_dotenv
import uvicorn

load_dotenv()

if __name__ == "__main__":
    port = int(os.environ.get("AI_SERVICE_PORT", 5000))
    uvicorn.run("main:app", host="127.0.0.1", port=port, reload=True)
