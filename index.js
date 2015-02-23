var token = process.env.DO_TOKEN;

function DigitalOceanAccess(token) {
  this.request = require('request');
  this.token = token;
  this.baseUrl = "https://api.digitalocean.com/v2";
  this.findAllDroplets = findAllDropletsFunction;
  this.createNewDropletFromImage = createNewDropletFromImageFunction;
  this.findAllImages = findAllImagesFunction;
  this.findAllPrivateImages = findAllPrivateImagesFunction;
  this.findDropletById = findDropletByIdFunction;
    this.createDomain = createDomainFunction;

  function findAllDropletsFunction(successCallback, errorCallback) {
    var options = {
      url: this.baseUrl + "/droplets",
        json: true,
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

    function findAllImagesFunction(successCallback, errorCallback) {
        var options = {
            url: this.baseUrl + "/images",
            json: true,
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

    function createDomainFunction(name, ipAddress, successCallback, errorCallback) {
        var domainCreationObject = {
            name: name,
            ip_address: ipAddress
        };

        var options = {
            url: this.baseUrl + "/domains",
            method: "post",
            body: domainCreationObject,
            json: true,
            headers: {
                "Authorization" : "Bearer " + this.token
            }
        };

        this.request(options, function (error, response, body) {
            if (!error && response.statusCode == 201) {
                successCallback(body);
            } else {
                errorCallback(error, response, body);
            }
        });
    }

    function findAllPrivateImagesFunction(successCallback, errorCallback) {
        var options = {
            url: this.baseUrl + "/images?private=true",
            json: true,
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

    function findDropletByIdFunction(dropletId, successCallback, errorCallback) {
        var options = {
            url: this.baseUrl + "/droplets/" + dropletId,
            json: true,
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
      image: image,
      user_data: "#!/bin/bash\napt-get update -y && apt-get install -y nodejs npm mongodb-server git build-essential\nln -s /usr/bin/nodejs /usr/bin/node\nrm -rf /root/flow2-api-manager\ncd /root\ngit clone https://github.com/manthanhd/flow2-api-manager\ncd /root/flow2-api-manager\ngit checkout -b feature/spike_material_ui\ngit pull origin feature/spike_material_ui\necho \"root:" + process.env.DEFAULT_PASS + "\" | chpasswd\necho \"@reboot root cd /root/flow2-api-manager && git pull origin feature/spike_material_ui && npm install -g npm && HOME=/root npm install && PORT=80 nohup npm start > runtime.log &\" >> /etc/crontab\nHOME=/root npm install -g npm\nHOME=/root npm install\nPORT=80 nohup npm start > runtime.log &"
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
      if(!error && response.statusCode == 202) {
        successCallback(body);
      } else {
        errorCallback(error, response, body);
      }
    });
  }
}

var digitalOcean = new DigitalOceanAccess(token);

//digitalOcean.findAllPrivateImages(function(data) {
//    console.log(data);
//});


//digitalOcean.findAllDroplets(function(data) {
//  console.log(data);
//}, function(error, response, data) {
//  console.log(data);
//});

//var image = 10757461;
var image = "ubuntu-14-04-x64";
var name = "mycoolco.manthanhd.com";
var region = "lon1";
var size = "512mb";
digitalOcean.createNewDropletFromImage(name, region, size, image, function(data) {
  console.log("Droplet created.");
    //example: 4240501
    var id = data.droplet.id;
    setTimeout(function() {
        digitalOcean.findDropletById(id, function(data) {
            var ip = data.droplet.networks.v4[0].ip_address;
            if(!ip || ip == "") {
                console.log("Failed to get a valid IP address for droplet id " + id);
                return;
            }

            var name = data.droplet.name;
            console.log("Creating domain for droplet name: " + name + ", ID:" + id + ", IP:" + ip);
            digitalOcean.createDomain(name, ip, function(data) {
                console.log("Domain successfully created! Head over to " + name + " to access apifactory.");
            }, function(error, response, data) {
                console.log("Failed to create a domain.");
                console.log(JSON.stringify(data, null, 4));
            });
        }, function(error, response, data) {
            console.log("Failed to find droplet by ID " + data.droplet.id);
            console.log(JSON.stringify(data, null, 4));
        });
    }, 5000);
}, function(error, response, data) {
    console.log("Droplet creation failed.");
    console.log(JSON.stringify(data, null, 4));
});


//
//digitalOcean.findDropletById(4240501, function(data) {
//    var id = data.droplet.id;
//    var ip = data.droplet.networks.v4[0].ip_address;
//    var name = data.droplet.name;
//    console.log("Droplet name is " + name + " and ID is " + id + " and IP address is " + ip);
//    digitalOcean.createDomain(name, ip, function(data) {
//        console.log("DOMAIN created!");
//        console.log(JSON.stringify(data, null, 4));
//    }, function(error, response, data) {
//        console.log(data);
//    });
//});