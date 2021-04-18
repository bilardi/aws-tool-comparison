aws-cdk
=======

The `AWS Cloud Development Kit <https://docs.aws.amazon.com/cdk/latest/guide/>`_ (AWS CDK) lets you define your cloud infrastructure as code in one of five supported programming languages:
an AWS CDK app is an application written in TypeScript, JavaScript, Python, Java, or C# that uses the AWS CDK to define AWS infrastructure.

For each language it is possible to install the **AWS Construct Library packages** and **AWS CDK Toolkit** is available like a `npm package <https://docs.aws.amazon.com/cdk/latest/guide/work-with.html>`_

.. code-block:: bash

    npm install -g aws-cdk # for installing AWS CDK
    cdk --help # for printing its commands

The `available commands <https://docs.aws.amazon.com/cdk/latest/guide/cli.html>`_ of AWS CDK Toolkit are a lot, and you can manage all that you need by your favourite language.

By shell
########

AWS CDK Toolkit and AWS Construct Library manage initialization, building, testing, deploying and more of what you need.
Each language has different needs: good examples are `Constructs <https://docs.aws.amazon.com/cdk/latest/guide/constructs.html>`_ guide, the `Hello World <https://docs.aws.amazon.com/cdk/latest/guide/hello_world.html>`_ application and `CDK Workshop <https://cdkworkshop.com/>`_.

AWS CDK Toolkit has common cross languages commands: for initialization of the application,

.. code-block:: bash

    export LANGUAGE=typescript #, javascript, python, java, or csharp
    cdk init app --language $LANGUAGE

For listing the application stacks,

.. code-block:: bash

    cdk ls

For deploying the application,

.. code-block:: bash

    cdk deploy

For checking the difference between changes and deployed,

.. code-block:: bash

    cdk diff

For deleting,

.. code-block:: bash

    cdk destroy

There are also commands for building the templates and testing the application, but they can also be managed by AWS Construct Library in agreement with the choosen language:

* in the CDK Workshop, there is a `testing section <https://cdkworkshop.com/20-typescript/70-advanced-topics/100-construct-testing.html>`_ for TypeScript language
* in this documentation, you can find an example from initialization to destroy, with also a testing section, for Python language

A method for building the template and testing the application by only the AWS tools is to use AWS CDK Toolkit and `AWS SAM CLI <https://docs.aws.amazon.com/cdk/latest/guide/sam.html>`_:

.. code-block:: bash

    cdk synth --no-staging > template.yaml
    export LAMBDA_NAME=$(grep MyFunction template.yaml)
    sam local invoke $LAMBDA_NAME --no-event

By a bash script
################

An ad hoc script **maybe** it could be useful for a specific CI / CD system.
Generally, it is not necessary.

Remember
########

When you use AWS CDK,

* you can test your application on your client by the commands **sam local** or with the choosen language
* you can manage all by code, so you can avoid to hardcoding a password directly in the property or in the parameter configuration file by `AWS::SecretsManager <https://docs.aws.amazon.com/secretsmanager/latest/userguide/integrating_cloudformation.html>`_ and you can also manage a `CI / CD system <https://aws.amazon.com/blogs/developer/cdk-pipelines-continuous-delivery-for-aws-cdk-applications/>`_
