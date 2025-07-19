# Run dev stack
dev:
	docker compose -f docker-compose/docker-compose-dev.yml up --build

# Run production stack
prod:
	docker compose -f docker-compose/docker-compose.yml up -d

# Stop dev stack
stop-dev:
	docker compose -f docker-compose/docker-compose-dev.yml down

# Stop prod stack
stop-prod:
	docker compose -f docker-compose/docker-compose.yml down

# Clean up all containers, networks, volumes
clean:
	docker system prune -af --volumes

# See logs (prod)
logs-prod:
	docker compose -f docker-compose/docker-compose.yml logs -f

# See logs (dev)
logs-dev:
	docker compose -f docker-compose/docker-compose-dev.yml logs -f
