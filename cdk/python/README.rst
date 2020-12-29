Python
######

The **AWS Construct Library packages** is also available like a `python package <https://docs.aws.amazon.com/cdk/latest/guide/work-with-cdk-python.html>`_

.. code-block:: bash

    pip search aws-cdk # for searching which module you want to load
    pip install aws-cdk.aws-lambda # for installing AWS CDK Lambda module

In this sample, there are more modules because it will be also used a CI / CD system:

* all modules are loaded and initialized on files named **app.<something>.py**
* each **app.py** file uses a file named **buildspec.yml** for deploying the CD system by AWS CodePipeline

By shell
********

AWS CDK Toolkit is useful for initialization of the application,

.. code-block:: bash

    cd cdk/python/
    bash build.sh

For testing the application, you can check almost the template is correct

.. code-block:: bash

    cd cdk/python/
    python3 -m unittest discover -v

For deploying a `Minetest server <https://github.com/bilardi/minetest>`_ and a `lambda function <https://github.com/bilardi/aws-saving>`_.

.. code-block:: bash

    cd cdk/python/
    export AWS_PROFILE=your-account
    export STAGE=basic
    cdk bootstrap
    cdk deploy ${STAGE}

For deploying a `Minetest server <https://github.com/bilardi/minetest>`_ and a `lambda function <https://github.com/bilardi/aws-saving>`_ and more.

.. code-block:: bash

    cd cdk/python/
    export AWS_PROFILE=your-account
    export STAGE=more
    cdk deploy ${STAGE}

For deploying a `Minetest server <https://github.com/bilardi/minetest>`_ and a `lambda function <https://github.com/bilardi/aws-saving>`_ and what else you can manage.

.. code-block:: bash

    cd cdk/python/
    export AWS_PROFILE=your-account
    export STAGE=plus
    cdk deploy ${STAGE}

For deploying a `Minetest server <https://github.com/bilardi/minetest>`_ and a `lambda function <https://github.com/bilardi/aws-saving>`_ by a `pipeline <https://github.com/bilardi/aws-simple-pipeline>`_

.. code-block:: bash

    cd cdk/python/
    export AWS_PROFILE=your-account
    export STAGE=pipeline
    cdk deploy ${STAGE}

For deleting,

.. code-block:: bash

    cd cdk/python/
    export AWS_PROFILE=your-account
    cdk destroy ${STAGE}

By a bash script
****************

An ad hoc script **maybe** it could be useful for a specific CI / CD system.
Generally, it is not necessary.

In this example, you have a simple introduction of CI / CD system by CodePipeline.

The logic of your CI / CD system is defined on **buildspec.yml** file

* the **AWS simple pipeline** package used, allows you to define your logic on **buildspec.yml** file
* you can use many files, like the sample that you can find in `aws-simple-pipeline <https://github.com/bilardi/aws-simple-pipeline/>`_, or nothing

You can also find

* the **build script**, named build.sh, it is used during the CodeBuild step
* the **deploy script**, named deploy.sh, it is used to differ which command run in each **stage**

These bash script files are prepared in your client before to test your **CI / CD system**: you have to be able to

* **build** all packages that you use before to run **cdk** or **unit test**
* **deploy** your AWS instances from your client before to test your **CI / CD system**

Remember
********

When you use AWS CDK,

* now there is not an official testing infrastructure, but you can test your application on your client by `AWS CDK test Synth <https://github.com/bilardi/aws-cdk-test-synth/>`_ package
* you can manage all by code, so also a CI / CD system, like `AWS simple pipeline <https://github.com/bilardi/aws-simple-pipeline/>`_ used in this sample
