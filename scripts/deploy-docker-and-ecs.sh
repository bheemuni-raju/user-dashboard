# Push Docker Image
# cp ~/byjus-secrets/ums.env server/.env
./scripts/deploy-docker.sh dev ums

# Push ECS Tasks
cd scripts
./deploy-ecs.sh ums
