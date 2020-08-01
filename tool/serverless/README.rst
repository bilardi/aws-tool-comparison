Serverless framework
####################

The `Serverless framework <https://www.serverless.com/framework/docs/providers/aws/guide/intro/>`_ helps you develop and deploy your AWS Lambda functions,
along with the AWS infrastructure resources they require.. yes, this is the first sentence of the introduction of Serverless framework in the official site,
and it shows very well strength and weakness:
this framework works around to AWS lambda functions, and what it does not manage, is configured as a resource in the cloudformation format (with small exceptions),
until you create a plugin to manage it more easily.

The `available custom properties <https://www.serverless.com/framework/docs/providers/aws/guide/serverless.yml/>`_ of Serverless framework are a lot,
and you can manage all that you need by yaml and json files and the conditions system.

The Serverless plugin registry is available on `GitHub <https://github.com/serverless/plugins>`_ or by shell with the command below

.. code-block:: bash

    npm install -g serverless # for installing Serverless framework
    serverless plugin list # for listing its plugins

The `available commands <https://www.serverless.com/framework/docs/providers/aws/cli-reference/>`_ of Serverless framework are not many,
but sufficient to manage a stack starting from the configuration files.

By shell
********

The `Serverless framework documentation <https://www.serverless.com/framework/docs/providers/aws/>`_ is rich and clean.
And it is simple to use Serverless framework: if you do not use plugins, you can use only a few commands.

For deploying your stack,

.. code-block:: bash

    cd serverless-path/
    export AWS_PROFILE=your-account
    serverless deploy --stage name-of-your-environment

For deleting your stack,

.. code-block:: bash

    cd serverless-path/
    export AWS_PROFILE=your-account
    serverless remove --stage name-of-your-environment

Below you can find a simple sample of deployment of a `lambda function <https://github.com/bilardi/aws-saving>`_ by serverless.yaml file.

After downloading the code for the lambda, or updating it, and installing the requirements and serverless plugin,

.. code-block:: bash

    cd tool/serverless/
    git clone https://github.com/bilardi/aws-saving
    cd aws-saving/
    pip3 install -r requirements.txt -t .
    npm install serverless-python-requirements 

You can deploy the lambda by Serverless framework,

.. code-block:: bash

    cd tool/serverless/
    export AWS_PROFILE=your-account
    cp *yaml aws-saving/; cd aws-saving/
    serverless deploy --stage only-lambda

Below you can find an example of deployment of a `lambda function <https://github.com/bilardi/aws-saving>`_ and an EC2 with the installation for `Minetest server <https://github.com/bilardi/minetest>`_ by serverless.yaml file and other configuration files.

You have to edit the serverless.yaml file for changing subnet and security group before deploying the EC2.

.. code-block:: bash

    cd tool/serverless/
    export AWS_PROFILE=your-account
    cp *yaml aws-saving/; cd aws-saving/
    serverless deploy --stage ec2-basic

There is another stage where you can see the security group creation: **ec2-more**, with this configuration, you have to edit serverless.yaml file for changing vpc id and subnet before deploying the EC2.

.. code-block:: bash

    cd tool/serverless/
    export AWS_PROFILE=your-account
    cp *yaml aws-saving/; cd aws-saving/
    serverless deploy --stage ec2-more

By a bash script
****************

An ad hoc script is **only necessary** if you need to manage

* more applications in the same repo and you want one stack for each application, so you could cycle their deployment
* where you deploy the stack, the instance needs special precautions

Remember
********

When you deploy your objects by Serverless,

* you can take advantage of `outputs section keys <https://www.serverless.com/plugins/serverless-stack-output>`_ of others stacks
* you can avoid to hardcoding a password directly in the property or in the parameter configuration file by the combo `AWS::SecretsManager <https://docs.aws.amazon.com/secretsmanager/latest/userguide/integrating_cloudformation.html>`_ and `AWS::SSM <https://www.serverless.com/framework/docs/providers/aws/guide/variables/#reference-variables-using-aws-secrets-manager>`_
