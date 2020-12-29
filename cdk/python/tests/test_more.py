import tests.helper as hlp
from sample.more import More
from aws_cdk_test_synth.test_synth import TestSynth

class TestMore(TestSynth):

    def __init__(self, *args, **kwargs):
        TestSynth.__init__(self, 'tests/more.yaml', *args, **kwargs)

    def synth(self, app):
        More(app,
            id="test",
            ec2_params=hlp.more_ec2_params,
            lambda_params=hlp.more_lambda_params,
            env=hlp.env
        )
