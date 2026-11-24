import os
import sys
import uvicorn

# Ensure the backend directory is in python path
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)

if __name__ == "__main__":
    host = os.environ.get("HOST", "0.0.0.0")
    port = int(os.environ.get("PORT", 8000))
    print("=" * 65)
    print("  AEGISCROP KRISHI™ ENTERPRISE - PRECISION IRRIGATION ENGINE")
    print(f"  Server listening on http://{host}:{port}")
    print(f"  Swagger API Docs: http://{host}:{port}/docs")
    print("=" * 65)
    uvicorn.run("app.main:app", host=host, port=port, reload=False, log_level="info")
