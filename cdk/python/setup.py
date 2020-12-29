import setuptools
import sample

setuptools.setup(
    name="sample",
    version=sample.__version__,
    author=sample.__author__,
    author_email="alessandra.bilardi@gmail.com",
    description="Some sample servives for deploying AWS stacks",
    long_description=open('README.rst').read(),
    long_description_content_type="text/x-rst",
    url="https://aws-tool-comparison.readthedocs.io/",
    packages=setuptools.find_packages(),
    install_requires=[
        "aws-cdk.core==1.80.0",
    ],
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
    ],
    python_requires='>=3.6',
    project_urls={
        "Source":"https://github.com/bilardi/aws-tool-comparison",
        "Bug Reports":"https://github.com/bilardi/aws-tool-comparison/issues",
        "Funding":"https://donate.pypi.org",
    },

)
