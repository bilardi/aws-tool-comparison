import { expect as expectCDK, matchTemplate, MatchStyle } from "@aws-cdk/assert";
import * as cdk from "@aws-cdk/core";
import { More } from "../lib/index";
import * as hlp from "./helper";
import moreTemplate from "./more.template.json";

test("More Stack", () => {
    const app = new cdk.App();
    delete hlp.moreEc2Params.vpcId;
    delete hlp.moreEc2Params.securityGroupId;
    const stack = new More(app, 
      "test",
      hlp.moreEc2Params,
      hlp.moreLambdaParams,
      { env: hlp.env }
    );
    expectCDK(stack).to(matchTemplate(moreTemplate, MatchStyle.EXACT));
});
