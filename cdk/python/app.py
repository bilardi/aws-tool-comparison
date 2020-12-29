#!/usr/bin/env python3
import os
from aws_cdk import (core, aws_lambda as lambda_)
from sample.basic import Basic
from sample.more import More
from sample.plus import Plus
from aws_simple_pipeline.pipeline_stack import PipelineStack

app = core.App()

# environment for ec2.Vpc.from_lookup method
env = core.Environment(
    account=os.getenv('CDK_DEFAULT_ACCOUNT', "123456789012"),
    region=os.getenv('CDK_DEFAULT_REGION', "eu-west-1"),
)

# token
github_token = core.SecretValue.secrets_manager(
    "/aws-simple-pipeline/secrets/github/token",
    json_field='github-token',
)

# tags
tags = {
    "Saving": "Enabled",
    "Delete": "0 18 . . .",
}

# ec2 - basic
ec2_params = {
    "region":"eu-west-1",
    "ami_id":"ami-02e64d6c81725f843",
    "vpc_id":"vpc-a98d49cf",
    "security_group_id":"sg-04eb1b7f031f3b20b",
    "instance_type":"t2.micro",
    "key_name":"minetest",
    "instance_name":"minetest",
    "user_data":"wget -O - https://raw.githubusercontent.com/bilardi/minetest/master/install.sh | bash",
    "tags":tags
}

# lambda - basic
lambda_actions = [
    "cloudformation:*",
    "ec2:*",
    "lambda:*",
    "logs:*",
    "iam:*",
    "rds:*",
    "s3:*",
]
lambda_params = {
    "name_prefix":"saving-",
    "path":"aws-saving",
    "handler":"aws_saving/saving.main",
    "memory_size":512,
    "runtime":lambda_.Runtime.PYTHON_3_8,
    "timeout":300,
    "actions":lambda_actions,
    "tags":tags
}

# stacks
Basic(app,
    id="basic",
    ec2_params=ec2_params,
    lambda_params=lambda_params,
    env=env
)

# ec2 - more
ec2_params['from_port'] = 30000
ec2_params['to_port'] = 30000
# ec2_params['ebs_optimized'] = False
# ec2_params['disable_api_termination'] = False
ec2_params['device_name'] = "/dev/xvda"
ec2_params['volume_size'] = 8
ec2_params['volume_type'] = "GP2"
ec2_params['delete_on_termination'] = True
ec2_params['description'] = "CPUUtilization of {} on AWS {}"
ec2_params['metric_name'] = "CPUUtilization"
ec2_params['namespace'] = "AWS/EC2"
ec2_params['dimension'] = "InstanceName"
ec2_params['evaluation_periods'] = 2
ec2_params['period'] = 300
ec2_params['statistic'] = "Average"
ec2_params['threshold'] = 100
ec2_params['dashboard_file'] = "ec2_dashboard.json"

# lambda - more
lambda_params['description'] = "Errors of {} on AWS {}"
lambda_params['metric_name'] = "Errors"
lambda_params['namespace'] = "AWS/Lambda"
lambda_params['dimension'] = "FunctionName"
lambda_params['evaluation_periods'] = 2
lambda_params['period'] = 60
lambda_params['statistic'] = "Average"
lambda_params['threshold'] = 1
lambda_params['dashboard_file'] = "lambda_dashboard.json"

More(app,
    id="more",
    ec2_params=ec2_params,
    lambda_params=lambda_params,
    env=env
)

Plus(app,
    id="plus",
    ec2_params=ec2_params,
    lambda_params=lambda_params,
    sns_params={
        "topic_name": "alarms-sns",
        "display_name": "My alarms",
        "endpoint": "my@email.net"
    },
    env=env
)

# pipeline
notify_emails = [ "your@email.net" ]
policies = [
    "AmazonEC2FullAccess",
    "AmazonS3FullAccess",
    "AWSLambdaFullAccess",
    "AWSCloudFormationFullAccess",
    "IAMFullAccess",
]

PipelineStack(app,
    id="pipeline",
    github_owner="bilardi",
    github_repo="aws-tool-comparison",
    github_branch="master",
    github_token=github_token,
    notify_emails=notify_emails,
    policies=policies,
    buildspec_path="cdk/python/buildspec.yml",
    manual_approval_exists=True
)

for tag in tags:
    core.Tags.of(app).add(tag, tags[tag])

app.synth()
