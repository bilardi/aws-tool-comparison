import tests.helper as hlp
from sample.basic import Basic
from aws_cdk_test_synth.test_synth import TestSynth

class TestBasic(TestSynth):

    def __init__(self, *args, **kwargs):
        TestSynth.__init__(self, 'tests/basic.yaml', *args, **kwargs)

    def synth(self, app):
        Basic(app, 
            id="test",
            ec2_params=hlp.basic_ec2_params,
            lambda_params=hlp.basic_lambda_params,
            env=hlp.env
        )
