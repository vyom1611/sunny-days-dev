run:
	source .venv/bin/activate && python -m uvicorn main:app --reload --host 0.0.0.0 --port 8001

install:
	pip install -r requirements.txt

venv:
	python -m venv .venv
	source .venv/bin/activate && pip install --upgrade pip && make install
