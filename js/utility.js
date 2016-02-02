var util = {
	getUuid: function(){
		var d = new Date();
		return (new Date(d.getTime() - d.getTimezoneOffset()*60*1000)).toJSON().replace(/-/g,"").replace(/:/g,"").replace(".","") + Math.ceil(Math.random()*100);
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
	defaultProfile: {
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
	server: "http://app.tubager.com/"
	//server: "http://120.25.68.228:8080/"
	//server: "http://localhost:8080/"
};