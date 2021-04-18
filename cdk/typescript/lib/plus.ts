/**
 * The class for managing plus environment
 * 
 * The class requires some properties described in the constructor comment.
 * The class extendes the class named More.
 * 
 * The class deploys all AWS resources for plus environment
 * 
 *   AWS::EC2::Instance with your details
 *   AWS::Lambda::Function with your policies
 *   AWS::Cloudwatch::Alarm for EC2 and Lambda
 *   AWS::Cloudwatch::Dashboard for EC2 and Lamnbda
 *   AWS::SNS::Topic for EC2 and Lambda alarms
 * 
 * **license**: MIT,
 * **support**: https://github.com/bilardi/aws-tool-comparison/issues
 */
import * as cdk from "@aws-cdk/core";
import * as sns from "@aws-cdk/aws-sns";
import * as subscriptions from "@aws-cdk/aws-sns-subscriptions";
import * as actions from "@aws-cdk/aws-cloudwatch-actions";
import { More } from "./more";

export class Plus extends More {
  /**
   * All properties are mandatory. See the unit tests for an example.
   * 
   * @param id the suffix name of resource created
   * @param ec2Params the dictionary of the EC2 custom parameters
   * @param lambdaParams the dictionary of the Lambda custom parameters
   * @param snsParams the dictionary of the SNS custom parameters
   */
  constructor(scope: cdk.Construct, id: string, ec2Params: {[key: string]: any}, lambdaParams: {[key: string]: any}, snsParams: {[key: string]: string}, props?: cdk.StackProps) {
    super(scope, id, ec2Params, lambdaParams, props);

    // sns
    const topic = new sns.Topic(this, "Topic", {
      topicName:snsParams.topicName,
      displayName:snsParams.displayName
    });
    topic.addSubscription(new subscriptions.EmailSubscription(snsParams.endpoint));

    // ec2
    this.ec2Alarm.addAlarmAction(new actions.SnsAction(topic));
    this.ec2Alarm.addOkAction(new actions.SnsAction(topic));

    // lambda
    this.lambdaAlarm.addAlarmAction(new actions.SnsAction(topic));
    this.lambdaAlarm.addOkAction(new actions.SnsAction(topic));
  }
}
