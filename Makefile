build-nextjs:
	docker compose -f docker-compose.yml build -d nx_nextjs_c 
	
start-full: ## Start the full docker container.
	docker compose -f docker-compose.yml up -d

rm-b-cache:
	docker buildx prune -f