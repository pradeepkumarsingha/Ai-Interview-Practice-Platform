import os
import uvicorn
from fastapi import FastAPI

app = FastAPI()

# ... your AI prediction endpoints ...

if __name__ == "__main__":
    # Render automatically sets the 'PORT' env variable to 10000 by default
    port = int(os.environ.get("PORT", 10000))
    # Crucial: host MUST be "0.0.0.0", not "127.0.0.1" or "localhost"
    uvicorn.run(app, host="0.0.0.0", port=port)