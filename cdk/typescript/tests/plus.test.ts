import { expect as expectCDK, matchTemplate, MatchStyle } from "@aws-cdk/assert";
import * as cdk from "@aws-cdk/core";
import { Plus } from "../lib/index";
import * as hlp from "./helper";
import plusTemplate from "./plus.template.json";

test("Plus Stack", () => {
    const app = new cdk.App();
    delete hlp.moreEc2Params.vpcId;
    delete hlp.moreEc2Params.securityGroupId;
    const stack = new Plus(app, 
      "test",
      hlp.moreEc2Params,
      hlp.moreLambdaParams,
      hlp.snsParams,
      { env: hlp.env }
    );
    expectCDK(stack).to(matchTemplate(plusTemplate, MatchStyle.EXACT));
});
