aws-cloudformation
##################

The `available commands <https://docs.aws.amazon.com/cli/latest/reference/cloudformation/index.html>`_ of aws-cloudformation are a lot,
and you can manage all your stacks only these commands.

By shell
********

AWS CloudFormation service needs a template (and optionally parameters) for deploying a stack. A stack is a collection of resources that they are described in the template.
The command for deploying a stack

.. code-block:: bash

    export AWS_PROFILE=your-account
    export STACK_NAME=your-stack-name
    export PREFIX_STACK_FILENAME=your-filename
    aws cloudformation create-stack --stack-name $STACK_NAME --template-body file://./templates/$PREFIX_STACK_FILENAME.yaml --parameters file://./config/$PREFIX_STACK_FILENAME.json --capabilities CAPABILITY_NAMED_IAM

When the stack will be created, you can get all information of the stack outputs that they are described in the `template <https://github.com/bilardi/aws-tool-comparison/blob/master/cli/cloudformation/templates/sns-plus.yaml>`_ Outputs section. By the command below you can get the stack outputs

.. code-block:: bash

    aws cloudformation describe-stacks --stack-name $STACK_NAME

For updating the stack after changes on parameters or templates files,

.. code-block:: bash

    aws cloudformation update-stack --stack-name $STACK_NAME --template-body file://./templates/$PREFIX_STACK_FILENAME.yaml --parameters file://./config/$PREFIX_STACK_FILENAME.json --capabilities CAPABILITY_NAMED_IAM

for deleting the stack,

.. code-block:: bash

    aws cloudformation delete-stack --stack-name $STACK_NAME

Below you can find a simple sample of deployment of a `Minetest server <https://github.com/bilardi/minetest>`_ by aws-cloudformation.

.. code-block:: bash

    cd cli/cloudformation
    export AWS_PROFILE=your-account
    export EC2_STACK_NAME=minetest-server
    export EC2_PREFIX_STACK_FILENAME=ec2
    aws cloudformation create-stack --stack-name $EC2_STACK_NAME --template-body file://./templates/$EC2_PREFIX_STACK_FILENAME.yaml --parameters file://./config/$EC2_PREFIX_STACK_FILENAME.json --capabilities CAPABILITY_NAMED_IAM

Below you can find an example of deployment of a `Minetest server <https://github.com/bilardi/minetest>`_ by aws-cloudformation and what else you can manage.

.. code-block:: bash

    cd cli/cloudformation
    export AWS_PROFILE=your-account
    export EC2_STACK_NAME=minetest-server-more
    export EC2_PREFIX_STACK_FILENAME=ec2-more
    aws cloudformation create-stack --stack-name $EC2_STACK_NAME --template-body file://./templates/$EC2_PREFIX_STACK_FILENAME.yaml --parameters file://./config/$EC2_PREFIX_STACK_FILENAME.json --capabilities CAPABILITY_NAMED_IAM

By a bash script
****************

An ad hoc script is **only necessary** if you need to manage

* more parameters and only a few are dynamic variables like the name of other stacks
* an exception as for deleting a stack with a S3 bucket not empty or a dashboard configuration by external json file, as the sample that you can find in `github.com/aws-samples <https://github.com/aws-samples/cloudwatch-dashboards-cloudformation-sample/>`_

Below you can find an example of deployment of a `Minetest server <https://github.com/bilardi/minetest>`_ and a `lambda function <https://github.com/bilardi/aws-saving>`_ by a bash custom script.

.. code-block:: bash

    cd cli/cloudformation
    export AWS_PROFILE=your-account
    bash aws-cloudformation.sh deploy plus

And for managing the other commands described above, you can use the same bash script

.. code-block:: bash

    cd cli/cloudformation
    bash aws-cloudformation.sh # print the commands list

**Please, pay attention**: in the config files, there are some identifiers that you need to change before running the bash script!

Remember
********

When you deploy your objects into the cloudformation stacks,

* you can take advantage of `outputs section keys <https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/outputs-section-structure.html>`_ of others stacks with `Fn::ImportValue <https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-importvalue.html>`_
* you can avoid to hardcoding a password directly in the property or in the parameter configuration file by `AWS::SecretsManager <https://docs.aws.amazon.com/secretsmanager/latest/userguide/integrating_cloudformation.html>`_
