Write-Host "Stopping running containers..."
docker-compose down

Write-Host "Rebuilding containers with new code..."
docker-compose up --build -d

Write-Host "Cleaning up unused images..."
docker image prune -f

Write-Host "Deployment complete! Containers are now running with latest code."
docker-compose ps


