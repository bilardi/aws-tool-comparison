import os
from aws_cdk import (core, aws_lambda as lambda_)

# environment for ec2.Vpc.from_lookup method
env = core.Environment(
    account=os.getenv('CDK_DEFAULT_ACCOUNT', "123456789012"),
    region=os.getenv('CDK_DEFAULT_REGION', "eu-west-1"),
)

# tags
tags = {
    "Saving": "Enabled",
    "Delete": "0 18 . . .",
}

# ec2
basic_ec2_params = {
    "region":"eu-west-1",
    "ami_id":"ami-030d7f4bcfae3b935",
    "vpc_id":"vpc-a98d49cf",
    "security_group_id":"sg-05ab5779a25ef0938",
    "instance_type":"t2.micro",
    "key_name":"minetest",
    "instance_name":"minetest",
    "user_data":"wget -O - https://raw.githubusercontent.com/bilardi/minetest/master/install.sh | bash",
    "tags":tags
}

more_ec2_params = basic_ec2_params.copy()
del more_ec2_params['vpc_id']
del more_ec2_params['security_group_id']
more_ec2_params['from_port'] = 3000
more_ec2_params['to_port'] = 3000
more_ec2_params['ebs_optimized'] = False
more_ec2_params['disable_api_termination'] = False
more_ec2_params['device_name'] = "/dev/xvda"
more_ec2_params['volume_size'] = 8
more_ec2_params['volume_type'] = "GP2"
more_ec2_params['delete_on_termination'] = True
more_ec2_params['description'] = "CPUUtilization of {} on AWS {}"
more_ec2_params['metric_name'] = "CPUUtilization"
more_ec2_params['namespace'] = "AWS/EC2"
more_ec2_params['dimension'] = "InstanceName"
more_ec2_params['evaluation_periods'] = 2
more_ec2_params['period'] = 300
more_ec2_params['statistic'] = "Average"
more_ec2_params['threshold'] = 100
more_ec2_params['dashboard_file'] = "ec2_dashboard.json"

bug_ec2_params = more_ec2_params.copy()
bug_ec2_params['security_group_id'] = basic_ec2_params['security_group_id']

# lambda
lambda_actions = [
    "cloudformation:*",
    "ec2:*",
    "lambda:*",
    "logs:*",
    "iam:*",
    "rds:*",
    "s3:*",
]

basic_lambda_params = {
    "name_prefix":"saving-",
    "path":"aws-saving",
    "handler":"aws_saving/saving.main",
    "memory_size":512,
    "runtime":lambda_.Runtime.PYTHON_3_8,
    "timeout":300,
    "actions":lambda_actions,
    "tags":tags
}

more_lambda_params = basic_lambda_params.copy()
more_lambda_params['description'] = "Errors of {} on AWS {}"
more_lambda_params['metric_name'] = "Errors"
more_lambda_params['namespace'] = "AWS/Lambda"
more_lambda_params['dimension'] = "FunctionName"
more_lambda_params['evaluation_periods'] = 2
more_lambda_params['period'] = 60
more_lambda_params['statistic'] = "Average"
more_lambda_params['threshold'] = 1
more_lambda_params['dashboard_file'] = "lambda_dashboard.json"

# sns
sns_params = {
    "topic_name": "alarms-sns",
    "display_name": "My alarms",
    "endpoint": "my@email.net"
}
