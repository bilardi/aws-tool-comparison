aws-lambda
##########

The `available commands <https://docs.aws.amazon.com/cli/latest/reference/lambda/index.html>`_ of aws-lambda are a lot,
and you can manage all that you need by those commands and bash scripts.

By shell
********

The command for deploying a lambda is

.. code-block:: bash

    export AWS_PROFILE=your-account
    aws lambda create-function --function-name $name --handler $handler --runtime $runtime --role $role --zip-file fileb://code.zip

Where

* **$handler** is the name of the method within your code that Lambda calls to execute your function
* **$runtime** is the identifier for the language that you use in your code and it has many `choices <https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html>`_
* **$role** is the Amazon Resource Name (ARN) of the execution role of the lambda function

You can invoke the lambda function by command line

.. code-block:: bash

    export AWS_PROFILE=your-account
    aws lambda invoke --function-name $name outfile --payload '{"key":"value"}'

And also you can delete it by command line

.. code-block:: bash

    export AWS_PROFILE=your-account
    aws lambda delete-function --function-name $name

By a bash script
****************

Below you can find an example of deployment of a `lambda function <https://github.com/bilardi/aws-saving>`_ by a bash custom script.

.. code-block:: bash

    cd cli/lambda
    git clone https://github.com/bilardi/aws-saving.git
    export AWS_PROFILE=your-account
    bash aws-lambda.sh deploy aws-saving/aws_saving

And for managing the other commands described above, you can use the same bash script

.. code-block:: bash

    cd cli/lambda
    bash aws-lambda.sh # print the commands list

Remember
********

When you need to

* change the permissions or other non-code attribute, it is better to delete and to redeploy the lambda function
* add the lambda function to a VPN, the deletion of that lambda function will be much slower because the system has to delete also the network objects
