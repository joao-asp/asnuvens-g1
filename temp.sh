# 1. Cria os diretórios isolados
mkdir -p frontend backend

# 2. Move os arquivos do React da raiz para a pasta frontend
mv src public node_modules package.json package-lock.json vite.config.js index.html .eslintrc.json bash.sh frontend/ 2>/dev/null || true

# 3. Cria o Dockerfile do Frontend (React/Vite)
cat << 'EOF' > frontend/Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
EOF

# 4. Cria os Requisitos do Backend (FastAPI + PostGIS)
cat << 'EOF' > backend/requirements.txt
fastapi
uvicorn
python-multipart
psycopg2-binary
sqlalchemy
geoalchemy2
EOF

# 5. Cria o Dockerfile do Backend
cat << 'EOF' > backend/Dockerfile
FROM python:3.10-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
EOF

# 6. Cria o arquivo vazio para a API
touch backend/main.py
