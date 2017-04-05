/**
 * Tar.js - Tarfile support for the browser.
 * @author Enki
 * @desc Loads a tarfile as an arraybuffer and create's object URL's for each of the files within.
 */
(function (name, context, definition) {
  if (typeof module != 'undefined' && module.exports) module.exports = definition();
  else if (typeof define == 'function' && define.amd) define(name, definition);
  else context[name] = definition();
}('Tar', this, function () {
  var tarfiles = [];
  return function(filename,complete) {
    if (tarfiles[filename]) return complete&&complete(tarfiles[filename]),tarfiles[filename];
    if (!filename.match(/\.tar|\.bin/i)) return complete&&complete(undefined);
    var req = new XMLHttpRequest();
    req.responseType = 'arraybuffer';
    req.open('GET', filename, true);
    req.onload = function() {
      var u8 = new Uint8Array(req.response), format=[[0,100],[124,136]], pos=0;
      while (pos < u8.byteLength) {
        var asc = String.fromCharCode.apply(null,u8.slice(pos,pos+136)), header=format.map(function(f){return asc.slice(f[0],f[1]).replace(/\0/g,''); });
        if (header[0]=="") break;
        tarfiles[header[0]] = URL.createObjectURL(new Blob([u8.slice(pos+512,pos+512+parseInt(header[1],8))], {type:'application/octet-stream'}))+'#'+header[0];
        pos += 512 + Math.ceil(parseInt(header[1],8)/512)*512;
      }
      complete&&complete(tarfiles);
    };
    req.send(null);
  }; 
}));
