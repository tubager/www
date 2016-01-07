var util = {
	getUuid: function(){
		return (new Date()).toJSON().replace(/-/g,"").replace(/:/g,"").replace(".","") + Math.ceil(Math.random()*100);
	},
	profile: {
		userName: "",
		nickName: "",
		email: "",
		gender: "M",
		address: "",
		lastWord: "",
		img: "img/img_5236.jpg",
		token: null
	},
	isLoggedIn: function(){
		if(!util.profile.token){
			return false;
		}
		if(util.profile.token == null || util.profile.token == ""){
			return false;
		}
		return true;
	},
	server: "http://120.25.68.228:8080/"
	//server: "http://localhost:8080/"
};