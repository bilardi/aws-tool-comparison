#!/usr/bin/env node
import * as cdk from "@aws-cdk/core";
import * as ec2 from "@aws-cdk/aws-ec2";
import * as lambda from "@aws-cdk/aws-lambda";

// environment for ec2.Vpc.from_lookup method
export const env = {
    account: "1234567890",
    region: "eu-west-1"
};

// token
export const githubToken = cdk.SecretValue.secretsManager(
    "/aws-simple-pipeline/secrets/github/token",
    { jsonField: "github-token" },
);

// tags
const tags: {[key: string]: string} = {
    Saving: "Enabled",
    Delete: "0 18 . . .",
};

// ec2
export const basicEc2Params: {[key: string]: any} = {
    amiMap:{ "eu-west-1":"ami-02e64d6c81725f843" },
    vpcId:"vpc-a98d49cf",
    securityGroupId:"sg-04eb1b7f031f3b20b",
    instanceType:"t2.micro",
    keyName:"minetest",
    instanceName:"minetest",
    userData:"wget -O - https://raw.githubusercontent.com/bilardi/minetest/master/install.sh | bash",
    tags:tags
};
export const moreEc2Params = Object.assign(basicEc2Params, {
    fromPort:3000,
    toPort:3000,
    ebsOptimized:false,
    disableApiTermination:false,
    deviceName:"/dev/xvda",
    volumeSize:8,
    volumeType:ec2.EbsDeviceVolumeType.GP2,
    deleteOnTermination:true,
    description:"CPUUtilization of {0} on AWS {1}",
    metricName:"CPUUtilization",
    namespace:"AWS/EC2",
    dimension:"InstanceName",
    evaluationPeriods:2,
    period:300,
    statistic:"Average",
    threshold:100,
    dashboardFile:"ec2_dashboard.json"
});

// lambda
const lambdaActions = [
    "cloudformation:*",
    "ec2:*",
    "lambda:*",
    "logs:*",
    "iam:*",
    "rds:*",
    "s3:*",
];
export const basicLambdaParams: {[key: string]: any} = {
    namePrefix:"saving-",
    path:"aws-saving",
    handler:"aws_saving/saving.main",
    memorySize:512,
    runtime:lambda.Runtime.PYTHON_3_8,
    timeout:300,
    actions:lambdaActions,
    tags:tags
};
export const moreLambdaParams = Object.assign(basicLambdaParams, {
    description:"Errors of {0} on AWS {1}",
    metricName:"Errors",
    namespace:"AWS/Lambda",
    dimension:"FunctionName",
    evaluationPeriods:2,
    period:60,
    statistic:"Average",
    threshold:1,
    dashboardFile:"lambda_dashboard.json"
});

// sns
export const snsParams: {[key: string]: string} = {
    topicName:"alarms-sns",
    displayName:"My alarms",
    endpoint:"my@email.net"
};
