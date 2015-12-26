var util = {
	getUuid: function(){
		return (new Date()).toJSON().replace(/-/g,"").replace(/:/g,"").replace(".","") + Math.ceil(Math.random()*100);
	}
};