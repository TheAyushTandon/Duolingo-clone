FROM python:3.12-slim

# Do not write .pyc / bytecode layers; run as non-root.
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

# Dependencies first for layer caching.
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Application code.
COPY alembic.ini .
COPY alembic ./alembic
COPY app ./app
COPY scripts ./scripts

# Non-root user.
RUN useradd --create-home --uid 10001 learner && chown -R learner:learner /app
USER learner

# Persistent data + logs directories.
RUN mkdir -p /app/data /app/logs

ENV DATABASE_URL=sqlite:///./data/duolingo_clone.db \
    ENVIRONMENT=production

# Apply migrations, seed, then serve. Seed is idempotent.
CMD ["sh", "-c", "python -m alembic upgrade head && python -m app.seed.seed_database && uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8000/api/health', timeout=4)" || exit 1
