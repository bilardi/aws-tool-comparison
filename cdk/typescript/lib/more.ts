/**
 * The class for managing more environment
 * 
 * The class requires some properties described in the constructor comment.
 * The class extendes the class named Basic.
 * 
 * The class deploys all AWS resources for more environment
 * 
 *   AWS::EC2::Instance with your details
 *   AWS::Lambda::Function with your policies
 *   AWS::Cloudwatch::Alarm for EC2 and Lambda
 *   AWS::Cloudwatch::Dashboard for EC2 and Lamnbda
 * 
 * **license**: MIT,
 * **support**: https://github.com/bilardi/aws-tool-comparison/issues
 */
import * as cdk from "@aws-cdk/core";
import * as ec2 from "@aws-cdk/aws-ec2";
import * as cloudwatch from "@aws-cdk/aws-cloudwatch";
import { Basic } from "./basic";
import ec2DashboardWidgets from "./ec2.dashboard.widgets.json";
import lambdaDashboardWidgets from "./lambda.dashboard.widgets.json";

export class More extends Basic {
  ec2Alarm:cloudwatch.Alarm;
  lambdaAlarm:cloudwatch.Alarm;

  /**
   * All properties are mandatory. See the unit tests for an example.
   * 
   * @param id the suffix name of resource created
   * @param ec2Params the dictionary of the EC2 custom parameters
   * @param lambdaParams the dictionary of the Lambda custom parameters
   */
  constructor(scope: cdk.Construct, id: string, ec2Params: {[key: string]: any}, lambdaParams: {[key: string]: any}, props?: cdk.StackProps) {
    super(scope, id, ec2Params, lambdaParams, props);

    // ec2
    ec2Params.name = this.ec2Name;
    ec2Params.dashboardWidgets = ec2DashboardWidgets;
    this.ec2Alarm = this.getAlarm(ec2Params);
    this.getDashboard(ec2Params);

    // lambda
    lambdaParams.name = this.lambdaName;
    lambdaParams.dashboardWidgets = lambdaDashboardWidgets;
    this.lambdaAlarm = this.getAlarm(lambdaParams);
    this.getDashboard(lambdaParams);
  }

  format(str: string, ...args: string[]): string {
    return str.replace(/{(\d+)}/g, (match, index) => args[index] || "");
  }

  getVpc(ec2Params: {[key: string]: any}): ec2.IVpc {
    let vpc = undefined;
    if ("vpc" in ec2Params) {
        vpc = ec2Params.vpc;
    } else {
      if ("vpcId" in ec2Params && ec2Params.vpcId) {
        vpc = ec2.Vpc.fromLookup(this, "vpc", { vpcId: ec2Params.vpcId });
      } else {
        vpc = ec2.Vpc.fromLookup(this, "vpc", { isDefault: true });
      }
    }
    return vpc;
  }

  getSecurityGroup(ec2Params: {[key: string]: any}): ec2.ISecurityGroup {
    let securityGroup = undefined;
    if ("securityGroup" in ec2Params) {
      securityGroup = ec2Params.securityGroup;
    } else {
      if ("securityGroupId" in ec2Params && ec2Params.securityGroupId) {
        securityGroup = ec2.SecurityGroup.fromSecurityGroupId(this, "SecurityGroup",
          ec2Params.securityGroupId,
          { mutable: false }
        );
      } else {
        securityGroup = new ec2.SecurityGroup(this, "SecurityGroup",
          { vpc: ec2Params.vpc }
        );
        securityGroup.addIngressRule(
          ec2.Peer.anyIpv4(),
          new ec2.Port({
            stringRepresentation: "sr",
            protocol: ec2.Protocol.UDP,
            fromPort: ec2Params.fromPort,
            toPort: ec2Params.toPort
          })
        );
      }
    }
    return securityGroup;
  }

  getBlockDevice(ec2Params: {[key: string]: any}): ec2.BlockDevice[] {
    const volume = ec2.BlockDeviceVolume.ebs(
      ec2Params.volumeSize,
      {
        deleteOnTermination: ec2Params.deleteOnTermination,
        volumeType: ec2Params.volumeType
      }
    );
    const blockDevices: ec2.BlockDevice[] = [
      {
        deviceName: ec2Params.name,
        volume: volume
      }
    ];
    return blockDevices;
  }

  getInstance(ec2Params: {[key: string]: any}): ec2.Instance {
    if (!("vpc" in ec2Params)) {
      ec2Params.vpc = this.getVpc(ec2Params);
    }
    if (!("securityGroup" in ec2Params)) {
      ec2Params.securityGroup = this.getSecurityGroup(ec2Params);
    }
    // const blockDevices = this.getBlockDevice(ec2Params);
    const ec2Instance = new ec2.Instance(this, this.ec2Name, {
      vpc: ec2Params.vpc,
      instanceType: new ec2.InstanceType(ec2Params.instanceType),
      machineImage: ec2.MachineImage.genericLinux(ec2Params.amiMap),
      securityGroup: ec2Params.securityGroup,
      keyName: ec2Params.keyName,
      // blockDevices: blockDevices
    });
    ec2Instance.addUserData(ec2Params.userData);
    this.addTags(this.ec2Name, ec2Instance, ec2Params.tags);
    return ec2Instance;
  }

  getAlarm(params: {[key: string]: any}): cloudwatch.Alarm {
    const description = this.format(params.description, params.name, this.account);
    const dimensions: {[key: string]: string} = {};
    dimensions[params.dimension] = params.name;
    const metric = new cloudwatch.Metric({
      metricName:params.metricName,
      namespace:params.namespace,
      dimensions:dimensions,
    });
    return new cloudwatch.Alarm(this, this.format("{0}Alarm", params.name), {
      alarmDescription:description,
      alarmName:description,
      comparisonOperator:cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
      metric:metric,
      evaluationPeriods:params.evaluationPeriods,
      period:cdk.Duration.seconds(params.period),
      statistic:params.statistic,
      threshold:params.threshold,
      treatMissingData:cloudwatch.TreatMissingData.MISSING
    });
  }

  getDashboard(params: {[key: string]: any}): cloudwatch.Dashboard {
    const graphWidgets = [];
    for (const widget of params.dashboardWidgets) {
      const dimensions: {[key: string]: string} = {};
      dimensions[widget["properties"]["metrics"][0][2]] = params.name;
      const metric = [new cloudwatch.Metric({
        namespace:widget["properties"]["metrics"][0][0],
        metricName:widget["properties"]["metrics"][0][1],
        dimensions:dimensions
      })];
      const graphWidget = new cloudwatch.GraphWidget({
        height:widget["height"],
        width:widget["width"],
        left:metric
      });
      graphWidget.position(widget["x"], widget["y"]);
      graphWidgets.push(graphWidget);
    }
    return new cloudwatch.Dashboard(this, this.format("{0}Dashboard", params.name), {
      dashboardName:params.name,
      widgets:[graphWidgets]
    });
  }
}
