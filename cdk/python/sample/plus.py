"""The class for managing plus environment

The class requires the follow properties:
    'id' (str): the suffix name of resource created
    'ec2_params' (dict): the dictionary of the EC2 custom parameters
    'lambda_params' (dict): the dictionary of the Lambda custom parameters
    'sns_params' (dict): the dictionary of the SNS custom parameters

All properties are mandatory. See the unit tests for an example.
The class extendes the class named More.

# license MIT
# support https://github.com/bilardi/aws-simple-pipeline/issues
"""
from aws_cdk import (core, aws_cloudwatch as cloudwatch,
                     aws_cloudwatch_actions as cw_actions,
                     aws_sns as sns, aws_sns_subscriptions as subscriptions)
from sample.more import More

class Plus(More):

    def __init__(self, scope: core.Construct, id: str, ec2_params: dict, lambda_params: dict, sns_params: dict, **kwargs) -> None:
        """
        deploys all AWS resources for plus environment
            Resources:
                AWS::EC2::Instance with your details
                AWS::Lambda::Function with your policies
                AWS::Cloudwatch::Alarm for EC2 and Lambda
                AWS::Cloudwatch::Dashboard for EC2 and Lamnbda
                AWS::SNS::Topic for EC2 and Lambda alarms
        """
        super().__init__(scope, id, ec2_params, lambda_params, **kwargs)

        # sns
        topic = sns.Topic(self, "Topic",
            topic_name = sns_params['topic_name'],
            display_name = sns_params['display_name']
        )
        topic.add_subscription(subscriptions.EmailSubscription(sns_params['endpoint']))

        # ec2
        self.ec2_alarm.add_alarm_action(cw_actions.SnsAction(topic))
        self.ec2_alarm.add_ok_action(cw_actions.SnsAction(topic))

        # lambda
        self.lambda_alarm.add_alarm_action(cw_actions.SnsAction(topic))
        self.lambda_alarm.add_ok_action(cw_actions.SnsAction(topic))
