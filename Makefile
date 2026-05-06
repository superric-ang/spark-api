.PHONY: dev setup db test

dev:
	turbo run dev --parallel

setup:
	npm install
	cd services/matching && pip install -r requirements.txt

db:
	# Assumes Supabase CLI is installed
	supabase db push

test:
	turbo run test

clean:
	rm -rf node_modules
	rm -rf apps/*/node_modules
	rm -rf services/*/venv
	rm -rf services/*/__pycache__