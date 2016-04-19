require('init');
require('icons');
var cache = globals.requires['cache'];
if( cache.load() ){
	Ti.API.requires = globals.requires;
	
	var network = globals.requires['network'];
	var b = require('crypt/bcrypt');
	bcrypt = new b();
	
	globals._parseArguments();
	Ti.App.addEventListener('resumed', function(e) {
		Ti.API.info('resumed');
		if( OS_IOS ) Ti.UI.iPhone.setAppBadge(0);
		if( globals.isReorg ) globals.backgroundfetch();
		var url = null;
		if( OS_ANDROID && e.args != null ){
			url = 'indiewallet://' + e.args.url;
			globals.lastUrl = null;
		}
		globals._parseArguments(url);
	});
	if( OS_ANDROID ){
		Ti.Android.currentActivity.addEventListener('app:resume', function(e) {
	        Ti.App.fireEvent('resumed', { args: { url: e.data } });
	    });
	}
	
	Ti.API.fiat_values = [];
	globals.createTab = function(){
		var tabGroup = Ti.UI.createTabGroup({
		     navBarHidden: true
		});
		tabGroup.addEventListener('android:back',function(e) {
		    var curWin = Ti.UI.currentWindow;
		   	if(curWin != null){
		   	 	if(curWin != Ti.API.home_win){
		   	 		curWin.close();
		   	 	}
		   	}
		});
		var home_tab = Ti.UI.createTab({
		    window: Ti.API.home_win,
		    title:L('label_tab_home'),
		});
		
		tabGroup.addTab(home_tab);
		tabGroup.closeAllTab = function(){
			tabGroup.removeTab(home_tab);
			tabGroup.close();
		};
		tabGroup.open();
		globals.tabGroup = tabGroup;
		
		Ti.API.home_tab = home_tab;
		//globals.open = true;
	};
	
	if( cache.data.id != null ){
		if( OS_IOS ) globals.createTab();
		globals.windows['home'].run();
	}
	else globals.windows['login'].run();
}
else{
	alert(L('text_access_deny'));
}