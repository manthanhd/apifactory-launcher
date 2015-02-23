var token = process.env.DO_TOKEN;

function DigitalOceanAccess(token) {
  this.request = require('request');
  this.token = token;
  this.baseUrl = "https://api.digitalocean.com/v2";
  this.findAllDroplets = findAllDropletsFunction;
  this.createNewDropletFromImage = createNewDropletFromImageFunction;

  function findAllDropletsFunction(successCallback, errorCallback) {
    var options = {
      url: this.baseUrl + "/droplets",
      headers: {
        "Authorization" : "Bearer " + this.token
      }
    };

    this.request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
           successCallback(body);
        } else {
          errorCallback(error, response, body);
        }
    });
  }

  function createNewDropletFromImageFunction(name, region, size, image, successCallback, errorCallback) {
    var dropletObject = {
      name: name,
      region: region,
      size: size,
      image: image
    };

    var options = {
      url: this.baseUrl + "/droplets",
      method: "post",
      json: true,
      body: dropletObject,
      headers: {
        "Authorization" : "Bearer " + this.token
      }
    };

    this.request(options, function(error, response, body) {
      if(!error && response.statusCode == 200) {
        successCallback(body);
      } else {
        errorCallback(error, response, body);
      }
    });
  }
}

var digitalOcean = new DigitalOceanAccess(token);
digitalOcean.findAllDroplets(function(data) {
  console.log(data);
}, function(error, response, data) {
  console.log(data);
});

var image = "base_snapshot";
var name = "myco.manthanhd.com";
var region = "lon1";
var size = "512mb";
digitalOcean.createNewDropletFromImage(name, region, size, image, function(data) {
  console.log("SUCCESS!");
  console.log(data);
}, function(error, response, data) {
  // console.log(error);
  // console.log(response);
  console.log(data);
});
