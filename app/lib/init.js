// Initiallize
globals = Alloy.Globals;
globals.is_scrolling = false;
globals.Accelerometer = 0;
globals.reorg_views = {};
globals.windows = new Array();
globals.requires = new Array();

/*
On iOS, all relative paths are currently interpreted as relative to the Resources directory,
not to the current context. This is a known issue that will be addressed in a future release.
http://docs.appcelerator.com/titanium/3.0/#!/api/Ti.Filesystem
*/
/*
var w = Ti.Filesystem.getFile('window').getDirectoryListing();
for( var i = 0; i < w.length; i++ ){
	var file = w[i].substr(0, w[i].indexOf('.'));
	globals.windows[file] = require('window/' + file);
}

var r = Ti.Filesystem.getFile('require').getDirectoryListing();
for( var i = 0; i < r.length; i++ ){
	var file = r[i].substr(0, r[i].indexOf('.'));
	globals.requires[file] = require('require/' + file);
}
*/

Ti.API.fin = "no";
var w = new Array(
	'assetholders.js',
	'assetinfo.js',
	'createtoken.js',
	'login.js',
	'home.js',
	'settings.js',
	'send.js',
	'shapeshift.js',
	'webview.js'
);

for( var i = 0; i < w.length; i++ ){
	var file = w[i].substr(0, w[i].indexOf('.'));
	globals.windows[file] = require('window/' + file);
}
var r = new Array(
	'acs.js',
	'auth.js',
	'bitcore.js',
	'cache.js',
	'inputverify.js',
	'layer.js',
	'network.js',
	'tiker.js',
	'util.js',
	'webview.js'
);
for( var i = 0; i < r.length; i++ ){
	var file = r[i].substr(0, r[i].indexOf('.'));
	globals.requires[file] = require('require/' + file);
}

String.prototype.format = function(arg){
    var rep_fn = null;
    if( typeof arg == 'object' ) rep_fn = function(m, k) { return arg[k]; }; else { var args = arguments; rep_fn = function(m, k) { return args[ parseInt(k) ]; }; }
    return this.replace( /\{(\w+)\}/g, rep_fn );
};

Number.prototype.toFixed2 = function(digit){
	if( digit == null ) digit = 8;
	return this.toFixed(digit).replace(/0+$/, '').replace(/\.$/, '');
};

var image_url =  'https://counterpartychain.io/content/images/icons/-.png';
globals.coindaddy_default = null;
try{
	var default_image = Ti.UI.createImageView({image: image_url});
	globals.coindaddy_default = Ti.Utils.base64encode(default_image.toBlob()).toString();
}
catch(e){
	globals.coindaddy_default = '';
}

Math._getDecimalLength = function(value) {
    var list = (value.toString()).split('.'), result = 0;
    if (list[1] !== undefined && list[1].length > 0) result = list[1].length;
    return result;
};

Math.multiply = function(value1, value2) {
    var intValue1 = parseInt( (value1.toString()).replace('.', ''), 10);
    var intValue2 = parseInt( (value2.toString()).replace('.', ''), 10);
    var decimalLength = Math._getDecimalLength(value1) + Math._getDecimalLength(value2); 
    return (intValue1 * intValue2) / Math.pow(10, decimalLength);
};

Math.divide = function(value1, value2) {
    var intValue1 = parseInt( (value1.toString()).replace('.', ''), 10);
    var intValue2 = parseInt( (value2.toString()).replace('.', ''), 10);
    var len1 = Math._getDecimalLength(value1);
    var len2 = Math._getDecimalLength(value2); 
    
    if( len1 > len2 ) intValue2 *= Math.pow(10, len1 - len2);
	else if( len1 < len2 ) intValue1 *= Math.pow(10, len2 - len1);
    
    if( len1 > 0 && len2 > 0 ) decimalLength = 0;
    else decimalLength = len1 + len2;
    if( len1 == 0 || len2 == 0 ) decimalLength = 0;
    
    return (intValue1 / intValue2) * Math.pow(10, decimalLength);
};

Math.subtract = function(value1, value2) {
    var max = Math.max(Math._getDecimalLength(value1), Math._getDecimalLength(value2)), k = Math.pow(10, max);
    return (Math.multiply(value1, k) - Math.multiply(value2, k)) / k;
};

function reorg_finish(){
	if( globals.isReorg ){
		globals.isReorg = false;
		globals.reorg_views['home'].removeSelf();
	}
};

var service = null;
globals.backgroundfetch = function (e) {
	globals.requires['network'].connect({
		'method': 'check_reorg',
		'post': {},
		'callback': function( result ){
			if( !result.isReorg ){
				reorg_finish();
				if( OS_IOS ){
					Ti.App.iOS.removeEventListener( 'backgroundfetch', globals.backgroundfetch );
					var notification = Ti.App.iOS.scheduleLocalNotification({
					    alertBody: L('text_finish_reorg'),
					    date: new Date(new Date().getTime())
					}); 
				}
				else if( service != null ){
					service.stop();
					service = null;
					
					var intent = Ti.Android.createIntent({
					    action: Ti.Android.ACTION_MAIN,
					    className: 'inc.lireneosoft.counterparty.IndiesquareWalletActivity',
					    packageName: 'inc.lireneosoft.counterparty'
					});
					intent.flags |= Ti.Android.FLAG_ACTIVITY_RESET_TASK_IF_NEEDED | Ti.Android.FLAG_ACTIVITY_SINGLE_TOP;
					intent.addCategory(Ti.Android.CATEGORY_LAUNCHER);
					
					var notification = Ti.Android.createNotification({
					    contentTitle: 'IndieSquare Wallet',
					    contentText : L('text_finish_reorg'),
					    tickerText: L('text_finish_reorg'),
					    contentIntent: Ti.Android.createPendingIntent({ 'intent': intent }),
					    defaults:  Ti.Android.DEFAULT_ALL,
			            flags: Ti.Android.FLAG_SHOW_LIGHTS,
					    icon: Ti.App.Android.R.drawable.appicon,
					    number: 1,
					    when: new Date()
					});
					Ti.Android.NotificationManager.notify(1, notification);
				}
			}
			else if( OS_IOS && e != null ) Ti.App.iOS.endBackgroundHandler(e.handlerId);
		}
	});
};
globals.reorg_occured = function(){
	if( !globals.isReorg ){
		globals.isReorg = true;
		
		if( OS_IOS ){
			globals.reorg_views['home'] = globals.requires['util'].setReorg(Ti.API.home_win);
			globals.reorg_views['history'] = globals.requires['util'].setReorg(Ti.API.history_win);
			globals.reorg_views['dex'] = globals.requires['util'].setReorg(Ti.API.exchange_win);
			globals.reorg_views['shapeshift'] = globals.requires['util'].setReorg(Ti.API.ss_win);
			Ti.App.iOS.setMinimumBackgroundFetchInterval( Ti.App.iOS.BACKGROUNDFETCHINTERVAL_MIN );
			Ti.App.iOS.addEventListener( 'backgroundfetch', globals.backgroundfetch );
		}
		else{
			globals.reorg_views['home'] = globals.requires['util'].setReorg(globals.main_window);
			var intent = Ti.Android.createServiceIntent( { url: 'background/fetch.js' } );
			intent.putExtra('interval', 15000);
			service = Ti.Android.createService(intent);
			service.start();
		}
	}
};

globals._parseCip2 = function( url ){
	if( !url.match(/^counterparty:/) ) return null;
	var scheme = url.replace(/^counterparty:/, '').split('?');
	
	var data = { 'address': scheme[0] };
	if( scheme.length > 1 ){
		scheme[1].split('&').forEach(function( val ){
			var v = val.split('=');
			try{
				data[v[0]] = decodeURIComponent(v[1]);
			}
			catch(e){ Ti.API.info(e.error); }
		});
	}
	return data;
};
function urlToObject(url)	{
	var	returnObj	=	{};
	url	=	url.replace('URLSCHEME://?',	'');
	var	params	=	url.split('&');
	params.forEach(function(param)	{
																
		var	keyAndValue	=	param.split('=');
		returnObj[keyAndValue[0]]	=	decodeURI(keyAndValue[1]);
	});
	return	obj;
}

globals._parseArguments = function( url, is_fromQR ) {
	if( url == null ){
		if( OS_IOS ) url = Ti.App.getArguments()['url'];
		else{
			function parseUri(sourceUri){
			    var uriPartNames = ["source","protocol","authority","domain","port","path","directoryPath","fileName","query","anchor"];
			    var uriParts = new RegExp("^(?:([^:/?#.]+):)?(?://)?(([^:/?#]*)(?::(\\d*))?)?((/(?:[^?#](?![^?#/]*\\.[^?#/.]+(?:[\\?#]|$)))*/?)?([^?#/]*))?(?:\\?([^#]*))?(?:#(.*))?").exec(sourceUri);
			    var uri = {};
			    for(var i = 0; i < 10; i++) uri[uriPartNames[i]] = (uriParts[i] ? uriParts[i] : "");
			    if(uri.directoryPath.length > 0) uri.directoryPath = uri.directoryPath.replace(/\/?$/, "/");
			    return uri;
			}
				
			var activity = Ti.Android.currentActivity;
			var data = activity.getIntent().getData();
			if( data != null ){
				activity.finish();
				var parser = parseUri(data);
				if( parser["protocol"] === "indiewallet" && parser["domain"] === "getaddress" ){
					var returnApp = parser["query"].replace('success=','');
					Ti.Platform.openURL(returnApp+'://sendaddress?address='+Ti.App.Properties.getString("current_address"));
				}
			}
			else{
				var launchIntent = Ti.App.Android.launchIntent;
			    if( launchIntent != null ){ 
			   		if( launchIntent.hasExtra('source') ){
			   			url = 'indiewallet://' + launchIntent.getStringExtra('source');
			   		}
			   	}
			}
		}
	}
	
	var _requires = globals.requires;
	if( url && (is_fromQR || globals.lastUrl !== url) ) {
		globals.lastUrl = url;
		if( url.match(/^indiewallet:\/\/x-callback-url/) ){
			var scheme = url.replace(/^indiewallet:\/\/x-callback-url\//, '').split('?');
			var func = scheme[0];
			var params = new Array();
			
			var p = scheme[1].split('&');
			for(var i = 0; i < p.length; i++){
				var a = p[i].split('=');
				params[a[0]] = decodeURIComponent(a[1]);
			}	
			if( func === 'getaddress' ){
				if( 'x-success' in params ){
					Ti.Platform.openURL(params['x-success'] + 'address=' + _requires['cache'].data.address);
				}
			}
		}
		else if( url.match(/^indiewallet:\/\//) ){
			var loading;
			if( OS_IOS ){
				if( Ti.API.home_win != null ){ loading = _requires['util'].showLoading(Ti.API.home_win, { width: Ti.UI.FILL, height: Ti.UI.FILL, message: L('label_please_wait')});}
			}
			else{
				if( globals.main_window != null ){ loading = _requires['util'].showLoading(globals.main_window, { width: Ti.UI.FILL, height: Ti.UI.FILL, message: L('label_please_wait')});}
			}
	    	var scheme = url.replace(/^indiewallet:\/\//, '').split('?');
	    	
	    	var func = scheme[0];
	    	var params = JSON.parse(decodeURIComponent(scheme[1].split('=')[1]));
	    	
	    	Ti.include('require/pubnub.js');
			
			var pubnub = PUBNUB({
			    publish_key       : Alloy.CFG.pubnub_pub,
			    subscribe_key     : Alloy.CFG.pubnub_sub,
			    ssl               : true,
			    native_tcp_socket : true,
			    origin            : 'pubsub.pubnub.com'
			});
			if( func === 'screen_to' ){
				if( params.screen === 'send' ){
					var s = setInterval(function(){
						if( globals.balances != null && globals.tiker != null ){
				            clearInterval(s);
				            
				            function gotoScreen( data ){
				            	if( loading != null ) loading.removeSelf();
				            	var asset = (data.accept_token != null)? data.accept_token: data.asset;
				            	
				            	var send_token = null;
								for( var i = 0; i < globals.balances.length; i++ ){
									if( globals.balances[i].asset === asset ){
										send_token = globals.balances[i];
										break;
									}
								}
								if( send_token != null ){
									var data = {
										'asset': send_token.asset,
										'balance': send_token.balance,
										'fiat': globals.requires['tiker'].to(send_token.asset, send_token.balance, globals.requires['cache'].data.currncy),
										'address': (data.destination != null)? data.destination: data.address,
										'amount': params.amount,
										'channel': params.channel,
										'currency': data.currency
									};
									
									globals.windows['send'].run(data);
									globals.publich = function(data){
										pubnub.publish({
										    channel : params.channel,
										    message : JSON.stringify(data),
											callback: function(m){
												Ti.API.info(JSON.stringify(m));
											}
										});
									};
								}
								else{
									globals.requires['util'].createDialog({
										message: L('label_errortokenfound').format({token: asset}),
										buttonNames: [L('label_close')]
									}).show();
								}
				            }
				            
				            if( params.id != null ){
				            	_requires['network'].connect({
									'method': 'get_vendings',
									'post': {
										vending_id: params.id
									},
									'callback': function( result ){
										gotoScreen( result.vendings[0] );
									},
									'onError': function(error){
										if( loading != null ) loading.removeSelf();
										
										globals.requires['util'].createDialog({
											message: L('text_readerror'),
											buttonNames: [L('label_close')]
										}).show();
									}
								});
							}
							else{
								gotoScreen( params );
							}
				        }
					}, 100);
				}
			}
			else{
				if( loading != null ) loading.removeSelf();
				function authorization(){
			    	globals.requires['auth'].check({ title: L('text_authentication'), callback: function(e){
						if( e.success ){
							function publish( data ){
								if( data != null ){
									pubnub.publish({
									    channel : params.channel,
									    message : JSON.stringify(data),
										callback: function(m){
											if( params.vending_wait_id != null ){
												_requires['network'].connect({
													'method': 'edit_vendingwait',
													'post': {
														id: params.vending_wait_id,
														status: 2
													},
													'callback': function( result ){
														Ti.API.info('success');
													},
													'onError': function(error){
														Ti.API.info('failed');
													}
												});
											}
										}
									});
								}
								if( !is_fromQR && params.scheme != null ){
									if( params.scheme === 'http' ){
										if( OS_ANDROID ){
											var activity = Ti.Android.currentActivity;
											activity.finish();
										}
									}
									else Ti.Platform.openURL(params.scheme+'://');
								}
							}
							if( func === 'signin' ){
								var data = {
									'id': globals.requires['cache'].data.id,
									'cs': params.cs
								};
								publish( data );
							}
							else if( func === 'new_address' ){
								globals.addWallet(function(params){
									if( params.status ){
										var data = {
											'id': globals.requires['cache'].data.id,
											'cs': params.cs,
											'address': params.address
										};
									}
									else{
										var data = {
											'id': globals.requires['cache'].data.id,
											'cs': params.cs,
											'address': params.action
										};
									}
									publish( data );
								});
							}
							else if( func === 'sign' ){
								pubnub.subscribe({
								    channel  : params.channel + 'receive',
								    callback : function(unsignd_hex) {
								    	globals.requires['bitcore'].sign(unsignd_hex, {
  											'callback': function(signed_tx){
  												var data = {
  													'signed_tx': signed_tx
  												};
  												publish( data );
  											},
  											'fail': function(){
  												globals.requires['util'].createDialog({
  													message: L('text_signerror'),
  													buttonNames: [L('label_close')]
  												}).show();
  											}
  										});
								    }
								});
								pubnub.publish({
								    channel : params.channel,
								    message : JSON.stringify({
								    	'connect': true
								    }),
									callback: function(m){}
								});
							}
						}
					}});
				}
				var s = setInterval(function(){
					//if( globals.open ){
			        clearInterval(s);
			        authorization();
			        //}
				}, 100);
			}
	    	
		}
    }
};