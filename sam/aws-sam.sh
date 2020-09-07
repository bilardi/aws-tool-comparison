#!/bin/bash

# initialization
action=$1
tool=$2

# help
function help() {
    echo
    echo For the deploy of the EC2 the script uses AWS Cloudformation or Sceptre, instead for the lambda function AWS SAM
    echo
    echo Usage: bash $0 action tool
    echo
    echo Where:
    echo action can be: deploy, delete
    echo tool can be: sam, cloudformation, sceptre
    echo
    echo Examples:
    echo "export AWS_PROFILE=your-account"
    echo "bash $0 deploy sam # creates the lambda function"
    echo "bash $0 deploy cloudformation # creates lambda function with more features"
    echo "bash $0 deploy sceptre # creates lambda function with more features and SNS"
    echo "bash $0 delete sam # deletes the lambda function"
    echo "bash $0 delete cloudformation # deletes lambda function with all the extra objects"
    echo "bash $0 delete sceptre # deletes lambda function and SNS with all the extra objects"
    echo
    exit 1
}

# check parameters
if [ -z $action ] || [ -z $tool ]; then
    help
fi

# create files and stacks name
type="basic"
if [ $tool == 'sceptre' ]; then
    type="plus"
fi
if [ $tool == 'cloudformation' ]; then
    type="more"
fi
suffix="-$type"
ec2Prefix="ec2$suffix"
lambdaPrefix="lambda-$type"
snsPrefix="sns$suffix"

# deploy stacks
if [ $action == 'deploy' ]; then
    # clone repository
    git clone https://github.com/bilardi/aws-saving.git

    # deploy stacks
    if [ $tool == 'sam' ]; then
        parameters=$(tr '\n' ' ' < config/basic/lambda.txt)
        sam deploy --stack-name $lambdaPrefix-test -t ./templates/$lambdaPrefix.yaml --parameter-overrides $parameters --capabilities CAPABILITY_NAMED_IAM
    else
        if [ $tool == 'sceptre' ]; then
            sceptre launch plus
        else
            aws cloudformation create-stack --stack-name $lambdaPrefix-test --template-body file://./templates/$lambdaPrefix.yaml --parameters file://../cli/cloudformation/config/$lambdaPrefix.json --capabilities CAPABILITY_NAMED_IAM CAPABILITY_AUTO_EXPAND --tags '[{"Key": "Saving", "Value": "Enabled"},{"Key": "Delete", "Value": "0 18 . . ."}]'
        fi
    fi
fi

# terminate stacks
if [ $action == 'delete' ]; then
    if [ $tool == 'sceptre' ]; then
        sceptre delete plus
    else
        aws cloudformation delete-stack --stack-name $lambdaPrefix-test
    fi
fi
