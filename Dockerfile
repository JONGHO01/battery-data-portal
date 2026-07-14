FROM python:3.12-slim

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends build-essential \
  && rm -rf /var/lib/apt/lists/*

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV PORT=10000
ENV DATA_DIR=/data

EXPOSE 10000

CMD ["sh", "-c", "uvicorn python_backend:app --host 0.0.0.0 --port ${PORT:-10000}"]
