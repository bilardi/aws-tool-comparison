#!/bin/bash

# initialization
action=$1
type=$2

# help
function help() {
    echo
    echo Usage: bash $0 action type
    echo
    echo Where:
    echo action can be: deploy, tags, delete
    echo type can be: basic, more, plus
    echo
    echo Examples:
    echo "export AWS_PROFILE=your-account"
    echo "bash $0 deploy basic # creates the EC2 and lambda function"
    echo "bash $0 deploy more # creates the EC2 and lambda function with more features"
    echo "bash $0 deploy plus # creates the EC2, lambda function and SNS"
    echo "bash $0 delete basic # deletes the EC2 and lambda function"
    echo "bash $0 delete more # deletes the EC2 and lambda function with all the extra objects"
    echo "bash $0 delete plus # deletes the EC2, lambda function and SNS with all the extra objects"
    echo
    exit 1
}

# check parameters
if [ -z $action ] || [ -z $type ]; then
    help
fi

# create files and stacks name
suffix="-$type"
ec2Prefix="ec2$suffix"
lambdaPrefix="lambda$suffix"
snsPrefix="sns$suffix"

# deploy stacks
if [ $action == 'deploy' ]; then
    # create zip file for lambda function template
    code='code.zip'
    git clone https://github.com/bilardi/aws-saving.git
    cd aws-saving
    if [ ! -e $code ]; then
        echo
        echo Install packages requested ..
        pip3 install -r requirements.txt -t .
        echo
        echo Create zip file of your code ..
        zip -r $code .
    fi
    aws s3 cp $code s3://your-bucket-name/cli/cloudformation/templates/lambda/
    cd -

    # deploy stacks
    if [ $type == 'plus' ]; then
    	sed 's/SNS_STACK_NAME/'$snsPrefix-test'/' config/$ec2Prefix.json > config/tmp.$ec2Prefix.json
    	sed 's/SNS_STACK_NAME/'$snsPrefix-test'/' config/$lambdaPrefix.json > config/tmp.$lambdaPrefix.json
        aws cloudformation create-stack --stack-name $snsPrefix-test --template-body file://./templates/$snsPrefix.yaml --parameters file://./config/$snsPrefix.json --capabilities CAPABILITY_NAMED_IAM --tags '[{"Key": "Saving", "Value": "Enabled"},{"Key": "Delete", "Value": "0 18 . . ."}]'
        aws cloudformation create-stack --stack-name $ec2Prefix-test --template-body file://./templates/$ec2Prefix.yaml --parameters file://./config/tmp.$ec2Prefix.json --capabilities CAPABILITY_NAMED_IAM --tags '[{"Key": "Saving", "Value": "Enabled"},{"Key": "Delete", "Value": "0 18 . . ."}]'
        aws cloudformation create-stack --stack-name $lambdaPrefix-test --template-body file://./templates/$lambdaPrefix.yaml --parameters file://./config/tmp.$lambdaPrefix.json --capabilities CAPABILITY_NAMED_IAM --tags '[{"Key": "Saving", "Value": "Enabled"},{"Key": "Delete", "Value": "0 18 . . ."}]'
        rm config/tmp.$ec2Prefix.json config/tmp.$lambdaPrefix.json
    else
        aws cloudformation create-stack --stack-name $ec2Prefix-test --template-body file://./templates/$ec2Prefix.yaml --parameters file://./config/$ec2Prefix.json --capabilities CAPABILITY_NAMED_IAM --tags '[{"Key": "Saving", "Value": "Enabled"},{"Key": "Delete", "Value": "0 18 . . ."}]'
        aws cloudformation create-stack --stack-name $lambdaPrefix-test --template-body file://./templates/$lambdaPrefix.yaml --parameters file://./config/$lambdaPrefix.json --capabilities CAPABILITY_NAMED_IAM --tags '[{"Key": "Saving", "Value": "Enabled"},{"Key": "Delete", "Value": "0 18 . . ."}]'
    fi
fi

# terminate stacks
if [ $action == 'delete' ]; then
    if [ $type == 'plus' ]; then
        aws cloudformation delete-stack --stack-name $snsPrefix-test
    fi
    aws cloudformation delete-stack --stack-name $ec2Prefix-test
    aws cloudformation delete-stack --stack-name $lambdaPrefix-test
fi
