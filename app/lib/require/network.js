module.exports = (function() {
	var self = {};
	
	function onerror(params, e){
		Ti.API.error('Error: '+e.error+':'+e.code);
		if( params.onError ) params.onError('Error: '+e.error);
	};
	
	function onworm(params, json){
		Ti.API.warn( json.errorMessage );
		if( params.onError ) params.onError( json.errorMessage );
	};
	
	function reorg(params){
		Ti.API.warn('Reorg occured...');
		if( params.onReorg ) params.onReorg();
	};
	
	self.connect = function( params ){
		var xhr = Ti.Network.createHTTPClient();
		xhr.open('POST', Alloy.CFG.api_uri + 'wallet/v1/' + params.method);
		xhr.onload = function(){
			if( params.binary ) params.callback( this.responseData );
			else{
				var json = JSON.parse( this.responseText );
				if( json.status ) params.callback( json.result );
				else{
					if( json.errorMessage === 'reorg' ){
						globals.reorg_occured();
						reorg( params );
					}
					else onworm(params, json);
				}
				if( params.always != null ) params.always();
			}
		},
		xhr.onerror = function(e){
			onerror(params, e);
			if( params.always != null ) params.always();
		};
		xhr.send( params.post );
	};
	self.connectDELETE = function( params ){
		var xhr = Ti.Network.createHTTPClient();
		xhr.open('DELETE', Alloy.CFG.api_uri + 'wallet/v1/' + params.method);
		xhr.onload = function(){
			var results = '';
			try{
				results = JSON.parse( this.responseText );
			}
			catch(e){}
			params.callback( results );
			if( params.always != null ) params.always();
		},
		xhr.onerror = function(e){
			onerror(params, e);
			if( params.always != null ) params.always();
		};
		xhr.send();
	};
	self.connectPUT = function( params ){
		var xhr = Ti.Network.createHTTPClient();
		xhr.open('PUT', Alloy.CFG.api_uri + 'wallet/v1/' + params.method);
		xhr.onload = function(){
			var results = '';
			try{
				results = JSON.parse( this.responseText );
			}
			catch(e){}
			params.callback( results );
			if( params.always != null ) params.always();
		},
		xhr.onerror = function(e){
			onerror(params, e);
			if( params.always != null ) params.always();
		};
		xhr.send( params.post );
	};
	self.connectPOSTv2 = function( params ){
  		var xhr = Ti.Network.createHTTPClient();
  		xhr.open('POST', Alloy.CFG.api_uri + '/v2/' + params.method);
  		xhr.setRequestHeader("Content-Type", "application/json");
		xhr.setRequestHeader('charset','utf-8');
  		xhr.onload = function(){
   		 var results = '';
    		try{
    			results = JSON.parse( this.responseText );
    		}
    		catch(e){}
    		params.callback( results );
    		if( params.always != null ) params.always();
  		},
  		xhr.onerror = function(e){
   		 onerror(params, e);
    		if( params.always != null ) params.always();
  			};
  			xhr.send( JSON.stringify(params.post) );
	};
	self.connectPOST = function( params ){
		var xhr = Ti.Network.createHTTPClient();
		xhr.open('POST', Alloy.CFG.api_uri + 'wallet/v1/' + params.method);
		xhr.onload = function(){
			var results = '';
			try{
				results = JSON.parse( this.responseText );
			}
			catch(e){}
			params.callback( results );
			if( params.always != null ) params.always();
		},
		xhr.onerror = function(e){
			onerror(params, e);
			if( params.always != null ) params.always();
		};
		xhr.send( params.post );
	};
	self.connectGET = function( params ){
		var xhr = Ti.Network.createHTTPClient();
		xhr.open('GET', Alloy.CFG.api_uri + 'wallet/v1/' + params.method);
		xhr.onload = function(){
			var results = '';
			try{
				results = JSON.parse( this.responseText );
			}
			catch(e){}
			params.callback( results );
			if( params.always != null ) params.always();
		},
		xhr.onerror = function(e){
			onerror(params, e);
			if( params.always != null ) params.always();
		};
		xhr.send();
	};
	
	self.connectGETv2 = function( params ){
		var xhr = Ti.Network.createHTTPClient();
		xhr.open('GET', Alloy.CFG.api_uri + '/v2/' + params.method);
  		xhr.setRequestHeader("Content-Type", "application/json");
		xhr.setRequestHeader('charset','utf-8');
		xhr.onload = function(){
			var results = '';
			try{
				results = JSON.parse( this.responseText );
			}
			catch(e){}
			params.callback( results );
			if( params.always != null ) params.always();
		},
		xhr.onerror = function(e){
			onerror(params, e);
			if( params.always != null ) params.always();
		};
		xhr.send();
	};
	
	self.getjson = function( params ){
		var xhr = Ti.Network.createHTTPClient();
		
		if( !params.uri.match(/^https?:\/\//) ) params.uri = 'https://' + params.uri;
		
		xhr.open('GET', params.uri);
		xhr.onload = function(){
			var json_data = '';
			try{
				json_data = JSON.parse( this.responseText );
			}
			catch(e){}
			params.callback( json_data );
			if( params.always != null ) params.always();
		},
		xhr.onerror = function(e){
			onerror(params, e);
			if( params.always != null ) params.always();
		};
		xhr.send();
	};
	
	return self;
}());