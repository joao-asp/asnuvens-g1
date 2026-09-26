from pathlib import Path
from uuid import uuid4

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

app = FastAPI()
uploads_dir = Path("uploads")
uploads_dir.mkdir(parents=True, exist_ok=True)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

@app.get("/")
def read_root():
    return {"message": "API do As Nuvens funcionando!"}


@app.post("/evidencias")
async def create_evidence(
    lat: float = Form(...),
    lng: float = Form(...),
    categoria: str = Form(...),
    descricao: str = Form(...),
    imagem: UploadFile | None = File(None),
):
    image_url = None

    if imagem and imagem.filename:
        allowed_types = {"image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp"}
        extension = allowed_types.get(imagem.content_type)
        if not extension:
            raise HTTPException(status_code=400, detail="Envie uma imagem JPG, PNG ou WEBP.")

        image_data = await imagem.read()
        if len(image_data) > 10 * 1024 * 1024:
            raise HTTPException(status_code=413, detail="A imagem deve ter no máximo 10 MB.")

        filename = f"{uuid4().hex}{extension}"
        (uploads_dir / filename).write_bytes(image_data)
        image_url = f"/uploads/{filename}"

    return {
        "id": uuid4().hex,
        "lat": lat,
        "lng": lng,
        "categoria": categoria,
        "desc": descricao,
        "imagem_url": image_url,
    }