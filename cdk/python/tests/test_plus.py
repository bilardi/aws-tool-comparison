import tests.helper as hlp
from sample.plus import Plus
from aws_cdk_test_synth.test_synth import TestSynth

class TestPlus(TestSynth):

    def __init__(self, *args, **kwargs):
        TestSynth.__init__(self, 'tests/plus.yaml', *args, **kwargs)

    def synth(self, app):
        Plus(app, 
            id="test",
            ec2_params=hlp.more_ec2_params,
            lambda_params=hlp.more_lambda_params,
            sns_params=hlp.sns_params,
            env=hlp.env
        )
