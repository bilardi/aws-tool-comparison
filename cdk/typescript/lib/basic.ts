/**
 * The class for managing basic environment
 * 
 * The class requires some properties described in the constructor comment.
 * 
 * The class deploys all AWS resources for basic environment
 * 
 *   AWS::EC2::Instance with your details
 *   AWS::Lambda::Function with your policies
 * 
 * **license**: MIT,
 * **support**: https://github.com/bilardi/aws-tool-comparison/issues
 */
import * as cdk from "@aws-cdk/core";
import * as ec2 from "@aws-cdk/aws-ec2";
import * as iam from "@aws-cdk/aws-iam";
import * as lambda from "@aws-cdk/aws-lambda";

export class Basic extends cdk.Stack {
  ec2Name:string;
  lambdaName:string;

  /**
   * All properties are mandatory. See the unit tests for an example.
   * 
   * @param id the suffix name of resource created
   * @param ec2Params the dictionary of the EC2 custom parameters
   * @param lambdaParams the dictionary of the Lambda custom parameters
   */
  constructor(scope: cdk.Construct, id: string, ec2Params: {[key: string]: any}, lambdaParams: {[key: string]: any}, props?: cdk.StackProps) {
    super(scope, id, props);

    // ec2
    this.ec2Name = ec2Params.instanceName + "-" + id;
    this.getInstance(ec2Params);

    // lambda
    this.lambdaName = lambdaParams.namePrefix + id;
    lambdaParams.lambdaRole = this.getRole(lambdaParams);
    this.getLambda(lambdaParams);
  }

  getVpc(ec2Params: {[key: string]: any}): ec2.IVpc {
    return ec2.Vpc.fromLookup(this, "vpc", { vpcId: ec2Params.vpcId });
  }

  getSecurityGroup(ec2Params: {[key: string]: any}): ec2.ISecurityGroup {
    return ec2.SecurityGroup.fromSecurityGroupId(this, "SecurityGroup",
      ec2Params.securityGroupId,
      { mutable: false }
    );
  }

  addTags(name: string, instance: cdk.IConstruct, tags: {[key: string]: string}): void {
    cdk.Tags.of(instance).add("Name", name);
    for (const tag of Object.keys(tags)) {
      cdk.Tags.of(instance).add(tag, tags[tag]);
    }
  }

  getInstance(ec2Params: {[key: string]: any}): ec2.Instance {
    if (! ec2Params.vpc) {
      ec2Params.vpc = this.getVpc(ec2Params);
    }
    if (! ec2Params.securityGroup) {
      ec2Params.securityGroup = this.getSecurityGroup(ec2Params);
    }
    const ec2Instance = new ec2.Instance(this, this.ec2Name, {
      vpc:ec2Params.vpc,
      instanceType:new ec2.InstanceType(ec2Params.instanceType),
      machineImage: ec2.MachineImage.genericLinux(ec2Params.amiMap),
      securityGroup:ec2Params.securityGroup
    });
    ec2Instance.addUserData(ec2Params.userData);
    this.addTags(this.ec2Name, ec2Instance, ec2Params.tags);
    return ec2Instance;
  }

  getRole(lambdaParams: {[key: string]: any}): iam.Role {
    const policy = new iam.PolicyStatement();
    for (const action of lambdaParams.actions) {
      policy.addActions(action);
    }
    policy.addAllResources();
    const role = new iam.Role(this, "role", { assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com") });
    role.addToPolicy(policy);
    return role;
  }

  getLambda(lambdaParams: {[key: string]: any}): lambda.Function {
    const lambdaFunction = new lambda.Function(this, this.lambdaName, {
      handler:lambdaParams.handler,
      role:lambdaParams.role,
      memorySize:lambdaParams.memorySize,
      runtime:lambdaParams.runtime,
      timeout:cdk.Duration.seconds(lambdaParams.timeout),
      code:new lambda.AssetCode(lambdaParams.path)
    });
    this.addTags(this.lambdaName, lambdaFunction, lambdaParams.tags);
    return lambdaFunction;
  }
}
