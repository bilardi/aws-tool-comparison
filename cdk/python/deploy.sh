#!/usr/bin/env bash

# check if there is environment variable named STAGE
if [ -z ${STAGE} ]; then
    echo
    echo Environment variable STAGE not exists
    echo Usage: STAGE=development bash $0
    echo
    exit 1
fi

# for finding the right folder of bash script files
python_folder=$(dirname $0)
cd $python_folder

# deploy stage
echo Deploy stage started on `date`
echo STAGE to load: ${STAGE}
if [ ${STAGE} == 'staging' ]; then
    cdk deploy basic --require-approval never
fi
if [ ${STAGE} == 'production' ]; then
    cdk deploy plus --require-approval never
fi
