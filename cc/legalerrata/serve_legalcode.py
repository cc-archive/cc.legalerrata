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

import os
import pkg_resources
import re

from webob import Request, Response
from webob.exc import HTTPNotFound


LICENSES_MAPPING = [
    (re.compile("^/(.*)sampling\+/1.0/(.*)/legalcode$"),
     "\\1samplingplus_1.0_\\2.html"),
    (re.compile("^/(.*)sampling\+/1.0/legalcode$"),
     "\\1samplingplus_1.0.html"),
    (re.compile("^/(.*)/([0-9]\.[0-9])/(.*)/legalcode\.([A-Za-z-]+)$"),
     "\\1_\\2_\\3_\\4.html"),
    (re.compile("^/(.*)/([0-9]\.[0-9])/legalcode\.([a-z][a-z])$"),
     "\\1_\\2_\\3.html"),
    (re.compile("^/(.*)/([0-9]\.[0-9])/(.*)/legalcode$"),
     "\\1_\\2_\\3.html"),
    (re.compile("^/(.*)/([0-9]\.[0-9])/legalcode$"),
     "\\1_\\2.html"),
    (re.compile("^/(.*)/([0-9]\.[0-9])/legalcode\.txt$"),
     "\\1_\\2.txt")]

PUBLICDOMAIN_MAPPING = [
    (re.compile("^/(.*)/([0-9]\.[0-9])/legalcode$"),
     "/\\1_\\2.html"),
    (re.compile("^/(.*)/([0-9]\.[0-9])/legalcode\.txt$"),
     "/\\1_\\2.txt")]


def match_path_to_mapping(path, mapping):
    for path_re, path_sub in mapping:
        if path_re.match(path):
            return path_re.sub(path_sub, path)

def legalcode_fullpath(path):
    return pkg_resources.resource_filename(
        'cc.legalerrata', '/checkouts/legalcode/' + path.lstrip('/'))


NOT_FOUND_RESPONSE = HTTPNotFound("Couldn't find that license!")


class LegalcodeServer(object):
    """
    Simple WSGI app that serves legalcode
    """
    def __init__(self, mapping=LICENSES_MAPPING):
        self.mapping = mapping

    def __call__(self, environ, start_response):
        request = Request(environ)
        file_path = match_path_to_mapping(request.path_info, self.mapping)
        if not file_path:
            return NOT_FOUND_RESPONSE(environ, start_response)

        legalcode_path = legalcode_fullpath(file_path)
        if not os.path.exists(legalcode_path):
            return NOT_FOUND_RESPONSE(environ, start_response)
            
        response = Response(
            file(legalcode_path, 'r').read(),
            charset='UTF-8')
        if legalcode_path.endswith('.txt'):
            response.content_type = "text/plain; charset=UTF-8"

        return response(environ, start_response)


def licenses_app_factory(config, **kw):
    return LegalcodeServer(LICENSES_MAPPING)


def publicdomain_app_factory(config, **kw):
    return LegalcodeServer(PUBLICDOMAIN_MAPPING)
