require('dotenv').config();
var sw = {
    "swagger": "2.0",
    "info": {
        "version": "1.0.0",
        "title": "My Api",
        "description": "This is swagger api",
        "contact": {
        "name": "XYZ TEAM",
        "email": "sachinvermaa1234@gmail.com"
        }
    },
    "securityDefinitions": {
        "Bearer": {
            "type": "apiKey",
            "name": "Authorization",
            "in": "header"
        }      
    },
    "host": process.env.SWAGGER_HOST,
    "basePath": "/",
    "schemes": [
        "http","https"
    ],
    "paths": {}
}

swaggerPaths = config => {
    apiConfig(config, (p)=>{
        let res = sw.paths[p.api];
        if(!res){ res = {}; }
        res[p.method] = {
            summary: p.summary,
            tags:[p.tags],
            produces: ["application/json"],
            responses: {}
        }

        if(p.tags.toLowerCase() != "auth"){
            res[p.method]["security"] = [{
                "Bearer": []
            }]
        }
        if(p.parameters){res[p.method].parameters = p.parameters;}
        if(p.items){res[p.method].items = p.items}
        
        sw.paths[p.api] = res;

    })
}

apiConfig = (config,callback) => {
    let params = {"api":"","method":"post","summary":"","tags":"","parameters": []};
    if(typeof(config) === 'object'){
        for(c in config){
            if(Array.isArray(config[c])){
                config[c].forEach(prm=>{
                    if(typeof(prm) === 'object'){
                        params.parameters.push(prm);
                    }else if(!Array.isArray(prm)){
                        let obj = { name: prm,type:"string",in:"formData"};
                        params.parameters.push(obj);
                    }
                })
            }else{
                let caseSmall = ["method"];
                params[c] = config[c];
                if(caseSmall.includes(c)){
                    params[c] = params[c].toLowerCase();
                }
            }
        }
    }
    callback(params);
}

module.exports = {
    sw: sw,
    swagger: swaggerPaths
}