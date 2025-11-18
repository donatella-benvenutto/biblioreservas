from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

from routers import rooms_router, reservations_router

# Cargar variables de entorno
load_dotenv()

# Crear instancia de FastAPI
app = FastAPI(
    title="BiblioReservas API",
    description="API REST para el sistema de reservas de salas de biblioteca",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configurar CORS para permitir peticiones desde el frontend Next.js
origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Registrar routers
app.include_router(rooms_router)
app.include_router(reservations_router)


# Endpoint raíz para verificar que la API está funcionando
@app.get("/")
def root():
    return {
        "message": "BiblioReservas API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs"
    }


# Endpoint de health check
@app.get("/health")
def health_check():
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    
    port = int(os.getenv("API_PORT", 8000))
    
    print("=" * 60)
    print("🚀 BiblioReservas API")
    print("=" * 60)
    print(f"📡 Servidor iniciando en: http://localhost:{port}")
    print(f"📚 Documentación: http://localhost:{port}/docs")
    print(f"🔧 CORS habilitado para: {origins}")
    print("=" * 60)
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=True,
        log_level="info"
    )
