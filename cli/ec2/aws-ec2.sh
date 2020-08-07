#!/bin/bash

# initialization
action=$1
necessaryParameter=$2
optionalFirstParameter=$3
sn=$4
ami=$5
type=$6
key=$7

# help
function help() {
    echo
    echo Usage: bash $0 action necessaryParameter optionalFirstParameter subnetId imageId instanceType keyName
    echo
    echo Where:
    echo action can be: deploy, status, tags, stop, change, start, terminate
    echo necessaryParameter can be: userData or instanceId
    echo optionalFirstParameter can be: securityGroupId or instanceType or volumeType
    echo
    echo Examples:
    echo "export AWS_PROFILE=your-account"
    echo "bash $0 deploy install.sh # creates a securityGroupId and gets the first subnetId"
    echo "bash $0 deploy install.sh sg-05ab5779a25ef0938 subnet-6d361b0b # creates the EC2 with default values"
    echo "bash $0 deploy install.sh sg-05ab5779a25ef0938 subnet-6d361b0b ami-030d7f4bcfae3b935 t2.micro minetest # they are the default values"
    echo
    echo "export INSTANCE_ID=your-instance-id"
    echo "bash $0 status \$INSTANCE_ID"
    echo "bash $0 tags \$INSTANCE_ID # add saving tags: for saving solution, see https://github.com/bilardi/aws-saving"
    echo "bash $0 stop \$INSTANCE_ID"
    echo "bash $0 change \$INSTANCE_ID t3.small # change instance type"
    echo "bash $0 change \$INSTANCE_ID io1 # gets the first volumeId and then change volume type"
    echo "bash $0 start \$INSTANCE_ID"
    echo "bash $0 terminate \$INSTANCE_ID # terminate instance"
    echo
    exit 1
}

function gvi() {
    vi=$(aws ec2 describe-instances --instance-ids "$1" | grep VolumeId | sed 's/.*"VolumeId": "\(.*\)".*/\1/' | head -n 1)
}

# check parameters
if [ -z $action ] || [ -z $necessaryParameter ]; then
    help
fi

# deploy instance
if [ $action == 'deploy' ]; then
    # default ami: a Debian buster image
    if [ -z $ami ]; then
        ami='ami-030d7f4bcfae3b935'
    fi

    # default type: the instance free tier
    if [ -z $type ]; then
        type='t2.micro'
    fi

    # default key: the key name of key pair
    if [ -z $key ]; then
        key='minetest'
    fi
    if [ $(aws ec2 describe-key-pairs --key-names "$key" | grep -c KeyPairId) -ne "1" ]; then
        aws ec2 create-key-pair --key-name $key > $key.pem
    fi

    # get the first subnet
    if [ -z $sn ]; then
        sn=$(aws ec2 describe-subnets | grep SubnetId | sed 's/.*"SubnetId": "\(.*\)",.*/\1/' | head -n 1)
    fi

    # # if not exists deploy Security Group
    # if [ $(aws ec2 describe-security-groups --group-ids "$optionalFirstParameter" | grep -c GroupId) -ne "1" ]; then
    #     aws ec2 create-security-group
    # fi

    # deploy EC2
    if [ -e $necessaryParameter ]; then
        ii=$(aws ec2 run-instances --image-id $ami --count 1 --instance-type $type --key-name $key --subnet-id $sn --security-group-ids $optionalFirstParameter --user-data file://$necessaryParameter | grep InstanceId | sed 's/.*"InstanceId": "\(.*\)".*/\1/' | head -n 1)
        echo
        echo The instance id of EC2 is $ii, you can use this id for managing your EC2 by this script: run the command below
        echo "export INSTANCE_ID=$ii"
        echo
    fi
fi

# status instance
if [ $action == 'status' ]; then
    aws ec2 describe-instance-status --instance-id $necessaryParameter 
fi

# add saving tags: for saving solution, see https://github.com/bilardi/aws-saving
if [ $action == 'tags' ]; then
    vi=$necessaryParameter
    gvi $necessaryParameter
    aws ec2 create-tags --resources $necessaryParameter $vi --tags '[{"Key": "Saving", "Value": "Enabled"},{"Key": "Delete", "Value": "0 18 . . ."}]'
fi

# stop instance
if [ $action == 'stop' ]; then
    aws ec2 stop-instances --instance-ids $necessaryParameter 
fi

# change instance
if [ $action == 'change' ]; then
    vts=("standard" "io1" "gp2" "sc1" "st1")
    if [[ " ${vts[@]} " =~ " ${optionalFirstParameter} " ]]; then
        vi=$necessaryParameter
        if [ $(aws ec2 describe-volumes --volume-ids "$necessaryParameter" 2> /dev/null | grep -c SnapshotId) -ne "1" ]; then
            gvi $necessaryParameter
        fi
        aws ec2 modify-volume --volume-id $vi --volume-type $optionalFirstParameter
    else
        aws ec2 modify-instance-attribute --instance-id $necessaryParameter --instance-type $optionalFirstParameter
    fi
fi

# start instance
if [ $action == 'start' ]; then
    aws ec2 start-instances --instance-ids $necessaryParameter 
fi

# terminate instance
if [ $action == 'terminate' ]; then
    aws ec2 terminate-instances --instance-ids $necessaryParameter 
fi
