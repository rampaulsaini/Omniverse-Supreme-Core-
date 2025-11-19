# backend/Dockerfile (production-ready, slim)
FROM python:3.11-slim

# env
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# system deps (kept minimal)
RUN apt-get update \
  && apt-get install -y --no-install-recommends build-essential ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# copy requirements and install (ensure requirements.txt includes gunicorn and uvicorn[standard])
COPY requirements.txt /app/requirements.txt
RUN pip install --upgrade pip setuptools wheel \
  && pip install --no-cache-dir -r /app/requirements.txt

# create a non-root user
RUN groupadd -r omniverse && useradd -r -g omniverse omniverse

# copy app code
COPY ./app /app/app
COPY ./start.sh /app/start.sh

# permissions
RUN chmod +x /app/start.sh \
  && chown -R omniverse:omniverse /app

USER omniverse

EXPOSE 8000

CMD ["/app/start.sh"]
