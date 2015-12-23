function parseUri(sourceUri){
    var uriPartNames = ["source","protocol","authority","domain","port","path","directoryPath","fileName","query","anchor"];
    var uriParts = new RegExp("^(?:([^:/?#.]+):)?(?://)?(([^:/?#]*)(?::(\\d*))?)?((/(?:[^?#](?![^?#/]*\\.[^?#/.]+(?:[\\?#]|$)))*/?)?([^?#/]*))?(?:\\?([^#]*))?(?:#(.*))?").exec(sourceUri);
    var uri = {};
    
    for(var i = 0; i < 10; i++){
        uri[uriPartNames[i]] = (uriParts[i] ? uriParts[i] : "");
    }
    
    // Always end directoryPath with a trailing backslash if a path was present in the source URI
    // Note that a trailing backslash is NOT automatically inserted within or appended to the "path" key
    if(uri.directoryPath.length > 0){
        uri.directoryPath = uri.directoryPath.replace(/\/?$/, "/");
    }
    
    return uri;
}
	
var activity = Ti.Android.currentActivity;
var data = activity.getIntent().getData();
activity.finish();
if(data != null){
	var parser = parseUri(data);
	
	if(parser["protocol"] == "indiewallet" && parser["domain"] == "getaddress"){
	var returnApp = parser["query"].replace('success=','');
		Ti.Platform.openURL(returnApp+'://sendaddress?address='+Ti.App.Properties.getString("current_address"));
	}
}   		