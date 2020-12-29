"""The class for managing basic environment

The class requires the follow properties:
    'id' (str): the suffix name of resource created
    'ec2_params' (dict): the dictionary of the EC2 custom parameters
    'lambda_params' (dict): the dictionary of the Lambda custom parameters

All properties are mandatory. See the unit tests for an example.

# license MIT
# support https://github.com/bilardi/aws-simple-pipeline/issues
"""
from aws_cdk import (core, aws_iam as iam,
                     aws_ec2 as ec2,
                     aws_lambda as lambda_)

class Basic(core.Stack):
    ec2_name = None
    lambda_name = None

    def __init__(self, scope: core.Construct, id: str, ec2_params: dict, lambda_params: dict, **kwargs) -> None:
        """
        deploys all AWS resources for basic environment
            Resources:
                AWS::EC2::Instance with your details
                AWS::Lambda::Function with your policies
        """
        super().__init__(scope, id, **kwargs)

        # ec2
        self.ec2_name = '{}-{}'.format(ec2_params['instance_name'], id)
        ec2_instance = self.get_instance(ec2_params)

        # lambda
        self.lambda_name = lambda_params['name_prefix'] + id
        lambda_params['lambda_role'] = self.get_role(lambda_params)
        lambda_function = self.get_lambda(lambda_params)

    def get_vpc(self, ec2_params):
        return ec2.Vpc.from_lookup(self, "vpc", vpc_id=ec2_params['vpc_id'])
    
    def get_security_group(self, ec2_params):
        return ec2.SecurityGroup.from_security_group_id(self, "SecurityGroup",
            security_group_id=ec2_params['security_group_id'],
            mutable=False
        )

    def add_tags(self, name, instance, tags):
        core.Tags.of(instance).add('Name', name)
        for tag in tags:
            core.Tags.of(instance).add(tag, tags[tag])

    def get_instance(self, ec2_params):
        if 'vpc' not in ec2_params:
            ec2_params['vpc'] = self.get_vpc(ec2_params)
        if 'security_group' not in ec2_params:
            ec2_params['security_group'] = self.get_security_group(ec2_params)
        ec2_instance = ec2.Instance(self, self.ec2_name,
            machine_image=ec2.MachineImage.generic_linux(
                ami_map={ec2_params['region']:ec2_params['ami_id']}
            ),
            vpc=ec2_params['vpc'],
            security_group=ec2_params['security_group'],
            instance_type=ec2.InstanceType(ec2_params['instance_type']),
            key_name=ec2_params['key_name']
        )
        ec2_instance.user_data.add_commands(ec2_params['user_data'])
        self.add_tags(self.ec2_name, ec2_instance, ec2_params['tags'])
        return ec2_instance

    def get_role(self, lambda_params):
        lambda_policy = iam.PolicyStatement()
        for action in lambda_params['actions']:
            lambda_policy.add_actions(action)
        lambda_policy.add_all_resources()
        lambda_role = iam.Role(self, 'LambdaRole', assumed_by=iam.ServicePrincipal('lambda.amazonaws.com'))
        lambda_role.add_to_policy(lambda_policy)
        return lambda_role

    def get_lambda(self, lambda_params):
        lambda_function = lambda_.Function(self, self.lambda_name,
            handler=lambda_params['handler'],
            role=lambda_params['lambda_role'],
            memory_size=lambda_params['memory_size'],
            runtime=lambda_params['runtime'],
            timeout=core.Duration.seconds(lambda_params['timeout']),
            code=lambda_.AssetCode(lambda_params['path'])
        )
        self.add_tags(self.lambda_name, lambda_function, lambda_params['tags'])
        return lambda_function