param (
    [ValidateSet("local", "prod")]
    [string]$env = "local"
)

if ($env -eq "prod") {
    $composeFile = "docker-compose-prod.yml"
    Write-Host "Deploying with production settings..."
} else {
    $composeFile = "docker-compose.yml"
    Write-Host "Deploying with local/dev settings..."
}

Write-Host "Stopping running containers..."
docker-compose -f $composeFile down

Write-Host "Rebuilding containers with new code..."
docker-compose -f $composeFile up --build -d

Write-Host "Cleaning up unused images..."
docker image prune -f

Write-Host "Deployment complete! Containers are now running with latest code."
docker-compose -f $composeFile ps
