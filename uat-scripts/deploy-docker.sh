#!/bin/bash
export NODE_ENV=$1
export IMAGE_NAME="uat-microservices-ums-image"
export PROFILE_ID=$([ "$NODE_ENV" = "uat" ] && echo "733716689918" || echo "602393328267")

cd server
aws ecr get-login-password --region ap-south-1 | docker login --username AWS --password-stdin ${PROFILE_ID}.dkr.ecr.ap-south-1.amazonaws.com
docker build -t  $IMAGE_NAME .
docker tag $IMAGE_NAME:latest ${PROFILE_ID}.dkr.ecr.ap-south-1.amazonaws.com/$IMAGE_NAME:latest
docker push ${PROFILE_ID}.dkr.ecr.ap-south-1.amazonaws.com/$IMAGE_NAME:latest
