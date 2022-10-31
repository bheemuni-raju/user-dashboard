### Steps for updating ECS Task Definition

1. Register/Update task defintion
```
  aws ecs register-task-definition --family microservices-lms-td --cli-input-json "file://ecs_lms_td.json"
```

2. Get the latest task revision using the describe task defintion
```
  aws ecs describe-task-definition --task-definition microservices-lms-td | egrep "revision" | tr "/" " " | awk '{print $2}' | sed 's/"$//'
```

3. Get the desired count of the service
```
  aws ecs describe-services --cluster "development-nucleus-ecs-cluster" --services service-lms | egrep "desiredCount" | tr "/" " " | awk '{print $2}' | sed 's/,$//'
```

4. Update service on ecs
```
  aws ecs update-service --cluster development-nucleus-ecs-cluster --service service-lms --task-definition microservices-lms-td:7 --desired-count 2
```
