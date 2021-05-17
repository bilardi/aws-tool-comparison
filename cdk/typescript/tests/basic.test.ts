//import { expect as expectCDK, matchTemplate, MatchStyle } from "@aws-cdk/assert";
import { expect as expectCDK } from "@aws-cdk/assert";
import * as cdk from "@aws-cdk/core";
import { Basic } from "../lib/index";
import * as hlp from "./helper";
import { RemoveIdentifiers } from "aws-cdk-remove-identifiers";
import basicTemplate from "./basic.template.json";

test("Basic Stack", () => {
    const app = new cdk.App();
    const stack = new Basic(app, 
      "test",
      hlp.basicEc2Params,
      hlp.basicLambdaParams,
      { env: hlp.env }
    );
    //expectCDK(stack).to(matchTemplate(basicTemplate, MatchStyle.EXACT));
    expect(new RemoveIdentifiers(expectCDK(stack).value)).toMatchObject(new RemoveIdentifiers(basicTemplate));
});
