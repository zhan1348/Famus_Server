var s3 = require('s3');

var client = s3.createClient({
 maxAsyncs3: 20,
 s3RetryCount: 3,
 s3RetryDelay: 1000,
 multipartUploadThreshold: 20971520,
 multipartUploadSize: 15728640,
 s3Options: {
  // accessKeyId: 'AKIAJGZPL26TKN42NLWA',
  accessKeyId: 'AKIAJXM3YWA3HNOBNXVQ',
  // secretAccessKey: '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',
  secretAccessKey: '+Vsc5hs8d/ez2IixA26Idwfet+JJiOw0+L3YrJQz',
 }
});

console.log(client);

var params = {
 localDir: './test',
 deleteRemoved: true,

 s3Params: {
  Bucket: 'famus',
  Prefix: 'test'
 }
};

var uploader = client.uploadDir(params);
uploader.on('error', function(err) {
 console.error("unable to sync:", err.stack);
});
uploader.on('progress', function() {
 console.log('uploader: ' + uploader);
 console.log("progress", uploader.progressAmount, uploader.progressTotal);
});
uploader.on('end', function() {
 console.log("done uploading");
});
