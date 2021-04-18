#!/usr/bin/env bash

# for finding the right folder of bash script files
typescript_folder=$(dirname $0)
cd $typescript_folder

# load resources for lambda
echo Load resources started on `date`
rm -rf aws-saving
git clone https://github.com/bilardi/aws-saving.git
cd aws-saving/
pip install --upgrade -r requirements.txt -t .
cd -

# install dependencies for aws-cdk
echo Install dependencies started on `date`
pip install --upgrade -r requirements.txt
npm install -g npm@latest
echo Install AWS CDK
npm install -g aws-cdk
npm install
