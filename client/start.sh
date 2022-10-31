export JOB_NAME="byjus-oms"
sudo $(aws ecr get-login --no-include-email --region ap-south-1)
sudo docker build -t  $JOB_NAME .
sudo docker tag $JOB_NAME:latest 644062857332.dkr.ecr.ap-south-1.amazonaws.com/$JOB_NAME:latest
sudo docker push 644062857332.dkr.ecr.ap-south-1.amazonaws.com/$JOB_NAME:latest
