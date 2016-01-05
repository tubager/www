var util = {
	getUuid: function(){
		return (new Date()).toJSON().replace(/-/g,"").replace(/:/g,"").replace(".","") + Math.ceil(Math.random()*100);
	},
	profile: {},
	//server: "http://120.25.68.228:8080/"
	server: "http://localhost:8080/"
};