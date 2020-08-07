#!/bin/bash

# initialization
action=$1
package=$2
handler=$3
runtime=$4
roleARN=$5

# help
function help() {
    echo
    echo Usage: bash $0 action package handler runtime [role]
    echo
    echo Where:
    echo action can be: deploy, invoke, tags, delete
    echo package is the folder of the code to zip
    echo handler is the name of the method within your code that Lambda calls to execute your function
    echo "runtime is the identifier for the language that you use in your code"
    echo "role is the Amazon Resource Name (ARN) of the execution role of the lambda function"
    echo
    echo Examples:
    echo "export AWS_PROFILE=your-account"
    echo "bash $0 deploy aws-saving/aws_saving saving.main # creates role and then lambda function with runtime python3.7"
    echo "bash $0 deploy aws-saving/aws_saving saving.main python3.8 # creates role and then lambda function with runtime python3.8"
    echo "bash $0 deploy aws-saving/aws_saving saving.main nodejs12.x arn:aws:iam::your-account-id:role/your-role-name # creates only lambda function"
    echo "bash $0 invoke aws-saving/aws_saving # invokes lambda function loading also payload.json"
    echo "bash $0 tags aws-saving/aws_saving # add saving tags: for saving solution, see https://github.com/bilardi/aws-saving"
    echo "bash $0 delete aws-saving/aws_saving # delete lambda function and other objects"
    echo
    exit 1
}

# check parameters
if [ -z $action ] || [ -z $package ] || [ ! -d $package ]; then
    help
fi

folder=$(dirname $package)
name=$(basename $package)
code='code.zip'

# deploy lambda function
if [ $action == 'deploy' ]; then
    # check handler
    if [ -z $handler ]; then
        echo
        echo Handler not found
        help
    fi

    # default runtime: python3.7
    if [ -z $runtime ]; then
        runtime='python3.7'
    fi

    # create zip file
    cd $folder    
    if [ ! -e $code ]; then
        echo
        echo Install packages requested ..
        pip3 install -r requirements.txt -t .
        echo
        echo Create zip file of your code ..
        zip -r $code .
    fi
    cd -

    # get the ARN of the role
    if [ -z $roleARN ]; then
        echo
        policyARN=$(aws iam create-policy --policy-name $name-policy --policy-document file://policy.json | grep Arn | sed 's/.*"Arn": "\(.*\)".*/\1/')
        echo The policy ARN is $policyARN
        roleARN=$(aws iam create-role --role-name $name-role --assume-role-policy-document file://trust-policy.json | grep Arn | sed 's/.*"Arn": "\(.*\)".*/\1/' | head -n 1)
        aws iam attach-role-policy --role-name $name-role --policy-arn $policyARN
        echo The role ARN is $roleARN
        echo
    fi

    # deploy lambda function
    aws lambda create-function --function-name $name --runtime $runtime --role $roleARN --handler $name/$handler --zip-file fileb://$folder/$code
    if [ $? -ne 0 ]; then
        echo "DEPLOY of the lambda function $name is FAILED"
        exit 1
    else
        echo
        echo The lambda function name is $name
        echo
    fi
fi

# invoke lambda function
if [ $action == 'invoke' ]; then
    # check payload
    payload="'{}'"
    if [ ! -e 'payload.json' ]; then
        echo 
        echo payload.json file not found
        help
    else
        payload=$(cat payload.json | tr '\n' ' ' | sed 's/ //g')
    fi

    aws lambda invoke --function-name $name outfile --payload $payload
fi

# add saving tags: for saving solution, see https://github.com/bilardi/aws-saving
if [ $action == 'tags' ]; then
    lambdaARN=$(aws lambda get-function --function-name $name | grep FunctionArn | sed 's/.*"FunctionArn": "\(.*\)".*/\1/' | head -n 1)
    aws lambda tag-resource --resource $lambdaARN --tags '{"Saving":"Enabled","Delete":"0 18 . . ."}'
fi

# delete lambda function and other objects
if [ $action == 'delete' ]; then
    policyARN=$(aws iam list-policies | egrep -e "(aws_saving-policy|Arn)" | grep -A 1 aws_saving-policy | head -n 2 | sed 's/.*"Arn": "\(.*\)".*/\1/' | tail -n 1)
    echo Detach $name-policy from $name-role ..
    aws iam detach-role-policy --role-name $name-role --policy-arn $policyARN
    echo Delete role $name-role ..
    aws iam delete-role --role-name $name-role
    echo Delete policy $name-policy ..
    aws iam delete-policy --policy-arn $policyARN
    echo Delete lambda function $name
    aws lambda delete-function --function-name $name
fi