# CC Legalcode Errata Tool
# 
# Written in 2012 by Christopher Allan Webber, Jonathan Palecek,
#   Creative Commons
# 
# To the extent possible under law, the author(s) have dedicated all
# copyright and related and neighboring rights to this software to the
# public domain worldwide. This software is distributed without any
# warranty.
# 
# You should have received a copy of the CC0 Public Domain Dedication along
# with this software. If not, see
# <http://creativecommons.org/publicdomain/zero/1.0/>.

from setuptools import setup, find_packages

setup(
    name="cc.legalerrata",
    version="0.1-dev",
    namespace_packages=['cc',],
    packages=find_packages(exclude=['ez_setup', 'examples', 'tests']),
    zip_safe=False,
    include_package_data = True,

    # scripts and dependencies
    install_requires = [
        'PasteScript',
        'WebOb',
        ],

    entry_points = """\
      [paste.app_factory]
      licenses_legalserve = cc.legalerrata.serve_legalcode:licenses_app_factory
      publicdomain_legalserve = cc.legalerrata.serve_legalcode:publicdomain_app_factory
      """,

    # author metadata
    author = 'Jonathan Palecek',
    author_email = 'jonathan@creativecommons.org',
    description = '',
    # I don't think pypi accepts this yet :)
    #license = 'CC0',
    url = 'http://creativecommons.org',
    )
