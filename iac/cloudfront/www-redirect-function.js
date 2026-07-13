// CloudFront Function (viewer-request, cloudfront-js-2.0) on distribution
// EZ1G9UFZ84YTV. Redirects any www.dayelostra.co request to the canonical
// https apex in a single 301, preserving path and query string.
//
// Why: without this, www requests pass through to the S3 website endpoint,
// which routes by Host header into the www redirect bucket. That bucket's
// RedirectAllRequestsTo has no protocol (defaults to http), and CloudFront's
// DefaultRootObject rewrites "/" to "/index.html" before the redirect fires,
// so www.dayelostra.co/ used to answer "301 http://dayelostra.co/index.html":
// an insecure hop to a non-canonical URL. This function runs before the
// root-object rewrite, so the target stays clean.
function handler(event) {
  var request = event.request;
  var host = request.headers.host && request.headers.host.value;
  if (host === 'www.dayelostra.co') {
    var qs = '';
    var keys = Object.keys(request.querystring);
    if (keys.length > 0) {
      var parts = [];
      for (var i = 0; i < keys.length; i++) {
        var k = keys[i];
        var entry = request.querystring[k];
        if (entry.multiValue) {
          for (var j = 0; j < entry.multiValue.length; j++) {
            parts.push(k + '=' + entry.multiValue[j].value);
          }
        } else if (entry.value === '') {
          parts.push(k);
        } else {
          parts.push(k + '=' + entry.value);
        }
      }
      qs = '?' + parts.join('&');
    }
    return {
      statusCode: 301,
      statusDescription: 'Moved Permanently',
      headers: {
        location: { value: 'https://dayelostra.co' + request.uri + qs },
      },
    };
  }
  return request;
}
