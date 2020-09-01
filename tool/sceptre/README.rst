Sceptre
#######

`Sceptre <https://sceptre.cloudreach.com/latest/index.html>`_ is a tool to drive CloudFormation. Sceptre manages the creation, update and deletion of stacks while providing meta commands which allow users to retrieve information about their stacks..
yes, this is the first sentence of the introduction of Sceptre in the official site,
and yes, it is a all-around tool that you can use to manage your stacks by cli or python script.

The `available commands <https://sceptre.cloudreach.com/latest/docs/cli.html#command-reference>`_ of Sceptre are a lot,
and you can manage all that you need by yaml files and, if you want, some python scripts.

Sceptre is available like a `python package or a docker image <https://sceptre.cloudreach.com/latest/docs/install.html>`_,

.. code-block:: bash

    pip install sceptre # for installing Sceptre
    sceptre --help # for printing its commands

If you want to install Sceptre and also its plugins for the examples below,

.. code-block:: bash

    cd tool/sceptre
    make install

If you want to install only the Sceptre plugins for the examples below,

.. code-block:: bash

    cd tool/sceptre
    make compile

By shell
********

Sceptre deploys one stack for each configuration file and one configuration file uses one template file. The relation between configuration file and template file could be many to one or one to one.

The command for validating one configuration file and template file related,

.. code-block:: bash

    export AWS_PROFILE=your-account
    sceptre validate path/configuration-file

Instead, the command for deploying that stack of that configuration file,

.. code-block:: bash

    sceptre launch path/configuration-file

When the stack will be created, you can get all information of the stack outputs that they are described in the `template <https://github.com/bilardi/aws-tool-comparison/blob/master/tool/sceptre/templates/plus/sns.yaml>`_ Outputs section. By the command below you can get the stack outputs

.. code-block:: bash

    sceptre list outputs path/configuration-file

For updating the stack after changes on parameters or templates files,

.. code-block:: bash

    sceptre launch path/configuration-file

for deleting the stack,

.. code-block:: bash

    sceptre delete path/configuration-file

Below you can find a simple sample (*) of deployment of a `Minetest server <https://github.com/bilardi/minetest>`_ and a `lambda function <https://github.com/bilardi/aws-saving>`_.

.. code-block:: bash

    cd tool/sceptre
    export AWS_PROFILE=your-account
    sceptre validate basic/ec2 # an example for validating one configuration file
    sceptre validate basic # an example for validating all configuration files of the environment named basic
    sceptre launch basic # for deploying stacks
    sceptre delete basic # for deleting stacks

Below you can find an example (*) of deployment of a `Minetest server <https://github.com/bilardi/minetest>`_, a `lambda function <https://github.com/bilardi/aws-saving>`_ and more.

.. code-block:: bash

    cd tool/sceptre
    export AWS_PROFILE=your-account
    sceptre launch more
    
Below you can find an example (*) of deployment of a `Minetest server <https://github.com/bilardi/minetest>`_, a `lambda function <https://github.com/bilardi/aws-saving>`_ and what else you can manage.

.. code-block:: bash

    cd tool/sceptre
    export AWS_PROFILE=your-account
    sceptre launch plus

(*) **Please, pay attention**: in the config.yaml files, there are some identifiers that you need to change before running Sceptre!

By a bash script
****************

An ad hoc script **maybe** it could be useful for a specific CI / CD system.
Generally, it is not necessary.

Remember
********

Sceptre provides two power components:

* `hooks <https://sceptre.cloudreach.com/latest/docs/hooks.html>`_, for running your scripts at a particular hook point
* `resolvers <https://sceptre.cloudreach.com/latest/docs/resolvers.html>`_, for recovering stack outputs or parameters from AWS::SSM, and so on, for your configuration files

So you can avoid to hardcoding a password directly in the property or in the parameter configuration file by

* `AWS::SecretsManager <https://docs.aws.amazon.com/secretsmanager/latest/userguide/integrating_cloudformation.html>`_
* `Custom resolver <https://sceptre.cloudreach.com/latest/docs/resolvers.html#custom-resolvers>`_ with AWS::SecretsManager or AWS::SSM

Another fantastic feature is that Sceptre can use a python script like a template, for example using the python package `troposphere <https://troposphere.readthedocs.io/en/latest/>`_:

* Sceptre company has shared an `example in Sceptre version 1.* <https://github.com/cloudreach/sceptre-zip-code-s3>`_ where, in the configuration file, on the **template_path** parameter, they use directly a `python script <https://github.com/cloudreach/sceptre-zip-code-s3/blob/master/config/example/serverless/lambda-role.yaml>`_
* Sceptre version 1.* has more difference with latest version, so you can find the same `example in Sceptre version 2.* here <https://github.com/bilardi/sceptre-zip-code-s3>`_
