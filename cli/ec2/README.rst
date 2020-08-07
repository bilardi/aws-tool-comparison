aws-ec2
#######

The `available commands <https://docs.aws.amazon.com/cli/latest/reference/ec2/index.html>`_ of aws-ec2 are a lot,
and you can manage all that you need by those commands and bash scripts.

By shell
********

The command for deploying an EC2 is

.. code-block:: bash

    export AWS_PROFILE=your-account
    aws ec2 run-instances --image-id $ami --count 1 --instance-type $type --subnet-id $sn --security-group-ids $sg # --user-data file://$file --key-name $key

The script return the instanceId of EC2 that you can use in the commands below

.. code-block:: bash

    export AWS_PROFILE=your-account
    export INSTANCE_ID=your-instance-id

for getting EC2 status,

.. code-block:: bash

    aws ec2 describe-instance-status --instance-id INSTANCE_ID 

for stopping EC2,

.. code-block:: bash

    aws ec2 stop-instances --instance-ids INSTANCE_ID 

for changing its instance type,

.. code-block:: bash

    aws ec2 modify-instance-attribute --instance-id INSTANCE_ID --attribute instanceType --instance-type t3.small
    # all instance T3 types are: t3.nano | t3.micro | t3.small | t3.medium | t3.large | t3.xlarge | t3.2xlarge

for changing its volume type,

.. code-block:: bash

    aws ec2 modify-volume --volume-id INSTANCE_ID ---volume-type io1
    # all volume types are: standard | io1 | gp2 | sc1 | st1

for starting EC2,

.. code-block:: bash

    aws ec2 start-instances --instance-ids INSTANCE_ID 

for deleting EC2,

.. code-block:: bash

    aws ec2 terminate-instances --instance-ids INSTANCE_ID 

By a bash script
****************

Below you can find an example of deployment of a `Minetest server <https://github.com/bilardi/minetest>`_ by a bash custom script.

.. code-block:: bash

    cd cli/ec2
    curl -O https://raw.githubusercontent.com/bilardi/minetest/master/install.sh
    export AWS_PROFILE=your-account
    bash aws-ec2.sh deploy install.sh

And for managing the other commands described above, you can use the same bash script

.. code-block:: bash

    cd cli/ec2
    bash aws-ec2.sh # print the commands list

Remember
********

When you need to change

* the instance type or to terminate instance, before you have to stop the instance
* the volume type, it is not necessary to stop the instance, but if you stop it, the process will be more fast
