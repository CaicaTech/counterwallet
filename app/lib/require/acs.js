module.exports = (function() {
	var self = {};
	
	function getDeviceToken( params ){
		var deviceToken = null;
		function receivePush(e) {
			try{
				var message;
				if( OS_IOS ) message = e.data.aps.alert;
				else{
					message = JSON.parse(e.payload).android.alert;
				}
				globals.requires['util'].createDialog({
					message: message,
					buttonNames: [L('label_close')]
				}).show();
				
				globals.loadBalance(true);
			}
			catch(e){
				Ti.API.info('Push receive error.');
			}
		}
		function deviceTokenSuccess(e) {
			deviceToken = e.deviceToken;
			globals.requires['network'].connectPUTv2({
				'method': 'users/' + _requires['cache'].data.id + '/info/update',
				'post': {
					updates: JSON.stringify( [
						{ column: 'appver', value: Ti.App.version },
						{ column: 'device_token', value: deviceToken },
						{ column: 'language', value: L('language') }
					])
				},
				'callback': function( result ){
					Ti.API.info('Update done.');
					Ti.API.info(result);
				},
				'onError': function(error){
					alert(error);
				}
			});
		}
		function deviceTokenError(e) {
			Ti.API.info('Failed to register for push notifications! ' + e.error);
		}

		if( OS_IOS ){
			if (Ti.Platform.name == 'iPhone OS' && parseInt(Ti.Platform.version.split('.')[0]) >= 8) {
				Ti.App.iOS.addEventListener('usernotificationsettings', function registerForPush() {
					Ti.App.iOS.removeEventListener('usernotificationsettings', registerForPush); 
					Ti.Network.registerForPushNotifications({
			            success: deviceTokenSuccess,
			            error: deviceTokenError,
			            callback: receivePush
			        });
			    });
			    Ti.App.iOS.registerUserNotificationSettings({
				    types: [
				        Ti.App.iOS.USER_NOTIFICATION_TYPE_ALERT,
				        Ti.App.iOS.USER_NOTIFICATION_TYPE_SOUND,
				        Ti.App.iOS.USER_NOTIFICATION_TYPE_BADGE
				    ]
				});
			}
			else {
				Ti.Network.registerForPushNotifications({
					types: [
						Ti.Network.NOTIFICATION_TYPE_BADGE,
						Ti.Network.NOTIFICATION_TYPE_ALERT,
						Ti.Network.NOTIFICATION_TYPE_SOUND
					],
					success: deviceTokenSuccess,
					error: deviceTokenError,
					callback: receivePush
				});
			}
		}
		else{
			var CloudPush = require('ti.cloudpush');
			CloudPush.retrieveDeviceToken({
			    success: deviceTokenSuccess,
			    error: deviceTokenError
			});
			CloudPush.addEventListener('callback', function (e) {
				Ti.API.info(JSON.stringify(e));
				receivePush(e);
			});
		}
	}
	
	self.login = function( params ){
		getDeviceToken({ id: params.id });
	};
	
    return self;
}());