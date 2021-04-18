#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "@aws-cdk/core";
import * as lambda from "@aws-cdk/aws-lambda";
import { Basic, More, Plus } from "../lib/index";
import { PipelineStack } from "aws-simple-pipeline";

const app = new cdk.App();

// environment for ec2.Vpc.from_lookup method
const env = {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION
};

// token
const githubToken = cdk.SecretValue.secretsManager(
    "/aws-simple-pipeline/secrets/github/token",
    { jsonField: "github-token" },
);

// tags
const tags: {[key: string]: string} = {
    Saving: "Enabled",
    Delete: "0 18 . . .",
};

// ec2 - basic
let ec2Params: {[key: string]: any} = {
    amiMap:{ "eu-west-1":"ami-02e64d6c81725f843" },
    vpcId:"vpc-a98d49cf",
    securityGroupId:"sg-04eb1b7f031f3b20b",
    instanceType:"t2.micro",
    keyName:"minetest",
    instanceName:"minetest",
    userData:"wget -O - https://raw.githubusercontent.com/bilardi/minetest/master/install.sh | bash",
    tags:tags
};

// lambda - basic
const lambdaActions = [
    "cloudformation:*",
    "ec2:*",
    "lambda:*",
    "logs:*",
    "iam:*",
    "rds:*",
    "s3:*",
];
let lambdaParams: {[key: string]: any} = {
    namePrefix:"saving-",
    path:"aws-saving",
    handler:"aws_saving/saving.main",
    memorySize:512,
    runtime:lambda.Runtime.PYTHON_3_8,
    timeout:300,
    actions:lambdaActions,
    tags:tags
};

// stack
new Basic(app,
    "basic",
    ec2Params,
    lambdaParams,
    { env: env }
);

// ec2 - more
ec2Params = Object.assign(ec2Params, {
    fromPort:3000,
    toPort:3000,
    ebsOptimized:false,
    disableApiTermination:false,
    deviceName:"/dev/xvda",
    volumeSize:8,
    volumeType:"GP2",
    deleteOnTermination:true,
    description:"CPUUtilization of {} on AWS {}",
    metricName:"CPUUtilization",
    namespace:"AWS/EC2",
    dimension:"InstanceName",
    evaluationPeriods:2,
    period:300,
    statistic:"Average",
    threshold:100,
    dashboardFile:"ec2_dashboard.json"
});

// lambda - more
lambdaParams = Object.assign(lambdaParams, {
    description:"Errors of {} on AWS {}",
    metricName:"Errors",
    namespace:"AWS/Lambda",
    dimension:"FunctionName",
    evaluationPeriods:2,
    period:60,
    statistic:"Average",
    threshold:1,
    dashboardFile:"lambda_dashboard.json"
});

// stack
new More(app,
    "more",
    ec2Params,
    lambdaParams,
    { env: env }
);

// sns
const snsParams: {[key: string]: string} = {
    topicName:"alarms-sns",
    displayName:"My alarms",
    endpoint:"my@email.net"
};

// stack
new Plus(app,
    "plus",
    ec2Params,
    lambdaParams,
    snsParams,
    { env: env }
);

// pipeline
const notifyEmails = [ "your@email.net" ];
const policies = [
    "AWSLambda_FullAccess",
    "AWSCloudFormationFullAccess",
    "CloudWatchLogsFullAccess",
    "CloudWatchEventsFullAccess",
    "AmazonSNSReadOnlyAccess",
    "AmazonS3FullAccess",
    "IAMFullAccess",
];
const stage = app.node.tryGetContext("stage")
new PipelineStack(app,
    "pipeline",
    stage,
    "bilardi",
    "aws-tool-comparison",
    "master",
    githubToken,
    notifyEmails,
    policies,
    "cdk/typescript/buildspec.yml",
    true
);

// tags
for (const tag of Object.keys(tags)) {
    cdk.Tags.of(app).add(tag, tags[tag]);
}

app.synth();
