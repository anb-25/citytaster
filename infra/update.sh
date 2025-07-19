#!/bin/bash
set -e

cd /home/ubuntu/app/citytaster

echo "[INFO] Pulling latest code from GitHub..."
git pull origin main

echo "[INFO] Syncing S3 CSV data files..."
aws s3 sync s3://citytaster-csv-data-c111ea24/data ./data

echo "[INFO] Logging into AWS ECR..."
aws ecr get-login-password --region $AWS_REGION | \
  docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

echo "[INFO] Pulling new Docker images..."
docker compose -f docker-compose.yml pull

# --- LOOP OVER ALL CSV FILES ---
for csv in ./data/*.csv; do
  collection=$(basename "$csv" .csv)
  echo "[INFO] Importing $csv into MongoDB collection '$collection'..."
  docker exec citytaster-mongo mongoimport \
    --db CityTasterDB \
    --collection "$collection" \
    --type csv --headerline --file "/data/$collection.csv" --drop
done

echo "[INFO] Redeploying stack..."
docker compose -f docker-compose.yml up -d

echo "[SUCCESS] All updates complete!"

