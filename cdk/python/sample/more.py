"""The class for managing more environment

The class requires the follow properties:
    'id' (str): the suffix name of resource created
    'ec2_params' (dict): the dictionary of the EC2 custom parameters
    'lambda_params' (dict): the dictionary of the Lambda custom parameters

All properties are mandatory. See the unit tests for an example.
The class extendes the class named Basic.

# license MIT
# support https://github.com/bilardi/aws-simple-pipeline/issues
"""
from aws_cdk import (core, aws_ec2 as ec2,
                     aws_cloudwatch as cloudwatch)
from sample.basic import Basic
import json

class More(Basic):
    ec2_alarm = None
    lambda_alarm = None

    def __init__(self, scope: core.Construct, id: str, ec2_params: dict, lambda_params: dict, **kwargs) -> None:
        """
        deploys all AWS resources for more environment
            Resources:
                AWS::EC2::Instance with your details
                AWS::Lambda::Function with your policies
                AWS::Cloudwatch::Alarm for EC2 and Lambda
                AWS::Cloudwatch::Dashboard for EC2 and Lamnbda
        """
        super().__init__(scope, id, ec2_params, lambda_params, **kwargs)

        # ec2
        ec2_params['name'] = self.ec2_name
        self.ec2_alarm = self.get_alarm(ec2_params)
        ec2_dashboard = self.get_dashboard(ec2_params)

        # lambda
        lambda_params['name'] = self.lambda_name
        self.lambda_alarm = self.get_alarm(lambda_params)
        lambda_dashboard = self.get_dashboard(lambda_params)

    def get_vpc(self, ec2_params):
        vpc = None
        if 'vpc' in ec2_params:
            vpc = ec2_params['vpc']
        else:
            if 'vpc_id' in ec2_params and ec2_params['vpc_id']:
                vpc = ec2.Vpc.from_lookup(self, "vpc", vpc_id=ec2_params['vpc_id'])
            else:
                vpc = ec2.Vpc.from_lookup(self, "vpc", is_default=True)
        return vpc
    
    def get_security_group(self, ec2_params):
        security_group = None
        if 'security_group' in ec2_params:
            security_group = ec2_params['security_group']
        else:
            if 'security_group_id' in ec2_params and ec2_params['security_group_id']:
                security_group = ec2.SecurityGroup.from_security_group_id(self, "SecurityGroup",
                    security_group_id=ec2_params['security_group_id'],
                    mutable=False
                )
            else:
                security_group = ec2.SecurityGroup(self, "SecurityGroup",
                    vpc=ec2_params['vpc']
                )
                security_group.add_ingress_rule(
                    peer=ec2.Peer.any_ipv4(),
                    connection=ec2.Port(
                        string_representation="sr",
                        protocol=ec2.Protocol("UDP"),
                        from_port=ec2_params['from_port'],
                        to_port=ec2_params['to_port']
                    )
                )
        return security_group

    def get_block_device(self, params):
        volume = ec2.BlockDeviceVolume.ebs(
            delete_on_termination=params['delete_on_termination'],
            volume_size=params['volume_size'],
            volume_type=ec2.EbsDeviceVolumeType(params['volume_type'])
        )
        block_device = ec2.BlockDevice(
            device_name=params['device_name'],
            volume=volume
        )
        return block_device

    def get_instance(self, ec2_params):
        if 'vpc' not in ec2_params:
            ec2_params['vpc'] = self.get_vpc(ec2_params)
        if 'security_group' not in ec2_params:
            ec2_params['security_group'] = self.get_security_group(ec2_params)
        block_device = self.get_block_device(ec2_params)
        ec2_instance = ec2.Instance(self, self.ec2_name,
            machine_image=ec2.MachineImage.generic_linux(
                ami_map={ec2_params['region']:ec2_params['ami_id']}
            ),
            vpc=ec2_params['vpc'],
            security_group=ec2_params['security_group'],
            instance_type=ec2.InstanceType(ec2_params['instance_type']),
            key_name=ec2_params['key_name'],
            block_devices=[block_device]
        )
        ec2_instance.user_data.add_commands(ec2_params['user_data'])
        self.add_tags(self.ec2_name, ec2_instance, ec2_params['tags'])
        return ec2_instance

    def get_alarm(self, params):
        description = params['description'].format(params['name'], self.account)
        metric = cloudwatch.Metric(
            metric_name=params['metric_name'],
            namespace=params['namespace'],
            dimensions={params['dimension']:params['name']}
        )
        alarm = cloudwatch.Alarm(self, "{}Alarm".format(params['name']),
            alarm_description=description,
            alarm_name=description,
            comparison_operator=cloudwatch.ComparisonOperator('GREATER_THAN_OR_EQUAL_TO_THRESHOLD'),
            metric=metric,
            evaluation_periods=params['evaluation_periods'],
            period=core.Duration.seconds(params['period']),
            statistic=params['statistic'],
            threshold=params['threshold'],
            treat_missing_data=cloudwatch.TreatMissingData('MISSING')
        )
        return alarm

    def get_dashboard(self, params):
        with open(params['dashboard_file']) as json_file:
            params['dashboard_widgets'] = json.load(json_file)
        graph_widgets = []
        for widget in params['dashboard_widgets']:
            metric = [cloudwatch.Metric(
                namespace=widget['properties']['metrics'][0][0],
                metric_name=widget['properties']['metrics'][0][1],
                dimensions={widget['properties']['metrics'][0][2]: params['name']}
            )]
            graph_widget = cloudwatch.GraphWidget(
                height=widget['height'],
                width=widget['width'],
                left=metric
            )
            graph_widget.position(widget['x'], widget['y'])
            graph_widgets.append(graph_widget)
        dashboard = cloudwatch.Dashboard(self, "{}Dashboard".format(params['name']),
            dashboard_name=params['name'],
            widgets=[graph_widgets]
        )
        return dashboard        