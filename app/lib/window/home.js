var theWindow = Ti.UI.createWindow({
	backgroundColor : '#FFFFFF',
	orientationModes : [Ti.UI.PORTRAIT],
	navBarHidden : true,
	titleControl : false,
	tabBarHidden : true,
});

if (OS_ANDROID) theWindow.windowSoftInputMode = Ti.UI.Android.SOFT_INPUT_ADJUST_PAN;
if (OS_IOS)
	theWindow.statusBarStyle = Ti.UI.iPhone.StatusBar.LIGHT_CONTENT;
	function numberWithCommas(x) {
		
		var res = x.toString().split(".");
		var firstString = res[0];
		
		var endString  = "";
		var foundEnd = false;
		for (var i = 0; i < res.length; i++) {
			var val = res[i];
			if(i > 0){
				foundEnd = true;
				endString = endString + val.toString();	
			}
			
		}
		if(foundEnd == true){
		 	return firstString.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + '.' + endString.toString();	
		}
		else{
			return firstString.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
		}
   
}
exports.run = function() {
	var _windows = globals.windows;
	var _requires = globals.requires;
	
	globals.main_window = theWindow;
	
	
	
	if( _requires['cache'].data.passphrase === Alloy.Globals.demopassphrase ) globals.DEMO = true;
	
	_requires['bitcore'].init(_requires['cache'].data.passphrase);
	_requires['network'].connect({
		'method' : 'dbupdate',
		'post' : {
			id : _requires['cache'].data.id,
			updates : 'check'
		},
		'callback' : function(result) {}
	});
			
	var defaultAddress = globals.requires['bitcore'].createHDAddress(0);
	
	if( Ti.App.Properties.getString("current_address") !== null){
		_requires['cache'].data.address = Ti.App.Properties.getString("current_address");
	}
	
	function getWallets( isbalanceupdate ) {
		var loading = _requires['util'].showLoading(theWindow, {
			width : Ti.UI.FILL,
			height : Ti.UI.FILL
		});
		_requires['network'].connectGET({
			'method' : 'users/' + _requires['cache'].data.id + '/tags',
			'callback' : function(results) {
				if (results != null) walletsArray = results;

				var counter = 0;
				for (var key in walletsArray) {
					var anObject = walletsArray[key];
					if( anObject.address == _requires['cache'].data.address ){
						globals.requires['bitcore'].changeHD(counter);
						if(typeof anObject.tag !== 'undefined'){
							home_title_center.text = anObject.tag;
							walletButton.wallet_button.text = anObject.tag;
						}
						break;
					}
					counter++;
				}
				for (var key in walletsArray) {
					var anObject = walletsArray[key];
					if(typeof anObject.tag !== 'undefined'){
				   		 Ti.App.Properties.setString(anObject.address,anObject.tag);
				   	}
					
				}
				globals.address_num = walletsArray.length;
				addWallets();
				setImageQR();
				if( isbalanceupdate ) globals.loadBalance(true);
			},
			'onError' : function(error) {
				if( isbalanceupdate ) globals.loadBalance(true);
			},
			'always' : function() {
				if( loading != null ) loading.removeSelf();
			}
		});
	}
	getWallets(true);
	var currenciesArray = [];
	var walletsArray = [];
	var display_height = _requires['util'].getDisplayHeight();
	var win = {};
	win.origin = theWindow;

	var view = Ti.UI.createView({
		backgroundColor : '#FFFFFF',
		width : '100%',
		height : Ti.UI.FILL
	});
	
	var middle_view = Ti.UI.createView({
		backgroundColor : '#FFFFFF',
		width : '100%',
		height : Ti.UI.FILL
	});

	var top_bar = Ti.UI.createView({
		backgroundColor : '#e54353',
		width : Ti.UI.FILL,
		height : 60
	});
	top_bar.top = 0;
	
	function addWallets() {
		wallet_view.height = 50 + (walletsArray.length * 90);
		if(wallet_view.height > display_height - 141){
			wallet_view.height = display_height - 141;
		}
		addWallet.bottom = 5;
			
		var counter = 0;
		wallets.setRowDesign(walletsArray, function(row, val) {
			var an_address = val.address;
			var walletName = Ti.UI.createLabel({
				text :getTagForAddress(an_address),
				font : {
					fontFamily : 'HelveticaNeue-Light',
					fontSize : 20,
					fontWeight : 'normal'
				},
				color : 'black',
				width : 'auto',
				height : 'auto',
				top : 10,
				left : 10
			});
			row.add(walletName);
			walletAddressLab = Ti.UI.createLabel({
				text : an_address,
				font : {
					fontFamily : 'HelveticaNeue-Light',
					fontSize : 10,
					fontWeight : 'normal'
				},
				color : 'black',
				width : 'auto',
				height : 'auto',
				top : 40,
				left : 10
			});
			row.add(walletAddressLab);
			var select_button = Ti.UI.createButton({
				id:counter,
				backgroundColor : "transparent",
					width : '100%',
					height : 40
			});
			select_button.right = 20;
			row.add(select_button);
			
			select_button.addEventListener('click', function(e) {
				var valObject = walletsArray[e.source.id];
				if( _requires['cache'].data.address !== valObject.address ){
					walletButton.wallet_button.text = getTagForAddress(valObject.address);
					home_title_center.text = getTagForAddress(valObject.address);
					_requires['cache'].data.address = valObject.address;
					Ti.App.Properties.setString("current_address", valObject.address);
					globals.requires['bitcore'].changeHD(e.source.id);
					
					wallet_address.text = valObject.address;
					loadHistory(true);
					globals.loadBalance(true);
					setImageQR();
				}
				walletViewOpen = false;
				wallet_view.animate(closeWalletAnimation);
				wallet_arrow.animate(rightArrowAnimation);
			});
			
			var rename_button = Ti.UI.createButton({
				id:counter,
				backgroundColor : "gray",
				title : L('title_rename'),
				color : 'white',
				width : 60,
				height : 25,
				textAlign : Ti.UI.TEXT_ALIGNMENT_CENTER,
				font : {
					fontFamily : 'HelveticaNeue',
					fontSize : 10,
					fontWeight : 'light'
				},
			});
			rename_button.left = 10;
			rename_button.bottom = 5;
			row.add(rename_button);
			
			rename_button.addEventListener('click', function(e) {
				var valObject = walletsArray[e.source.id];
				var dialog = _requires['util'].createInputDialog({
					title : L('label_rename'),
					message : L('text_wallet_rename'),
					value : '',
					buttonNames : [L('label_close'), L('label_ok')]
				});
				
				dialog.origin.addEventListener('click', function(e) {
					var inputText = (OS_ANDROID) ? dialog.androidField.getValue() : e.text;
					if (e.index != e.source.cancel) {
						if (inputText.length > 0) {
							
							var loading = _requires['util'].showLoading(theWindow, {
								width : Ti.UI.FILL,
								height : Ti.UI.FILL
							});

							_requires['network'].connectPUT({
								'method' : 'tags/'+ valObject.id,
								'post' : {
									user_id : _requires['cache'].data.id,
									address : valObject.address,
									tag : inputText
								},
								'callback' : function(result) {
									getWallets(false);
									if(wallet_address.text == valObject.address){
										walletButton.wallet_button.text = inputText;
										home_title_center.text = inputText;
									}
									Ti.App.Properties.setString(valObject.address, inputText);
								},
								'onError' : function(error) {
									Ti.API.log('error tags' + error);
								},
								'always' : function() {
									if( loading != null ) loading.removeSelf();
								}
							});

						}
					}
				});
				dialog.origin.show();
			});
			
			var hide_button = Ti.UI.createButton({
				id:counter,
				backgroundColor : "gray",
				title : L('label_hide'),
				color : 'white',
				width : 60,
				height : 25,
				textAlign : Ti.UI.TEXT_ALIGNMENT_CENTER,
				font : {
					fontFamily : 'HelveticaNeue',
					fontSize : 10,
					fontWeight : 'light'
				},
			});
			hide_button.left = 80;
			hide_button.bottom = 5;
			
			if(val.address !== defaultAddress && counter == globals.address_num - 1){
				row.add(hide_button);
			}
			
			hide_button.addEventListener('click', function(e) {
				var valObject = walletsArray[e.source.id];
				var dialog = _requires['util'].createDialog({
					title : L('label_hide'),
					message : L('label_hide_text'),
					buttonNames : [L('label_close'), L('label_ok')]
				});
				dialog.addEventListener('click', function(e) {
					if (e.index != e.source.cancel) {
							var loading = _requires['util'].showLoading(theWindow, {
								width : Ti.UI.FILL,
								height : Ti.UI.FILL
							});

							_requires['network'].connectDELETE({
								'method' : 'tags/'+ valObject.id,
								'post' : {},
								'callback' : function(result) {
									_requires['network'].connectPOST({
										'method' : 'edit_preferences',
										'post' : {
											id : _requires['cache'].data.id,
											num_addresses_used : walletsArray.length - 1
										},
										'callback' : function() {
											if(valObject.address === wallet_address.text){
												var defaultAdd = globals.requires['bitcore'].changeHD(0);
												walletButton.wallet_button.text = getTagForAddress(defaultAdd);
												home_title_center.text = getTagForAddress(defaultAdd);
												Ti.App.Properties.setString("current_address", defaultAdd);
												wallet_address.text = defaultAdd;
												globals.loadBalance(true);
												setImageQR();
											}
											getWallets(false);
										},
										'onError' : function(error) {
											// Failed or Cancel
											globals.requires['bitcore'].changeHD(num_hd_address - 1);
										},
										'always' : function() {
											if( loading != null ) loading.removeSelf();
										}
									});
								},
								'onError' : function(error) {
									// Failed or Cancel
									Ti.API.log('error remove' + error);
								},
								'always' : function() {
									if( loading != null ) loading.removeSelf();
								}
							});
					}
				});
				dialog.show();
			});
			counter++;

			return row;

		});

	}

	var rightArrowTransformation = Ti.UI.create2DMatrix();

    rightArrowTransformation = rightArrowTransformation.rotate(0); // this does not work
    var rightArrowAnimation = Ti.UI.createAnimation({
      transform : rightArrowTransformation,
      duration: 200
 	});
 	
 	var downArrowTransformation = Ti.UI.create2DMatrix();
    downArrowTransformation = downArrowTransformation.rotate(90); // this does not work
    var downArrowAnimation = Ti.UI.createAnimation({
    	transform : downArrowTransformation,
    	duration: 200
 	});
	
	function addCurrencies() {
		var tikers = globals.tiker;
		currenciesArray = [];
		currencies.setRowDesign(tikers, function(row, val) {//why is key visible here?
			if (key !== 'XCP') {
				currenciesArray.push(key);
				var label = Ti.UI.createLabel({
					text : key,
					font : {
						fontFamily : 'HelveticaNeue-Light',
						fontSize : 20,
						fontWeight : 'normal'
					},
					color : 'black',
					width : 'auto',
					height : 'auto',
					left : 10
				});
				row.add(label);
				return row;
			}
		});
	};

	var slide_in;
	var slide_out;
	if (OS_ANDROID) {
		slide_in = Ti.UI.createAnimation({
			top : display_height - 400,
			duration : 200
		});
		slide_out = Ti.UI.createAnimation({
			top : display_height,
			duration : 200
		});
	} else {
		slide_in = Ti.UI.createAnimation({
			bottom : 0,
			duration : 200
		});
		slide_out = Ti.UI.createAnimation({
			bottom : -390,
			duration : 200
		});
	}

	var close = _requires['util'].makeLabel({
		text : 'close',
		color : 'white',
		font : {
			fontFamily : 'Helvetica Neue',
			fontSize : 15,
			fontWeight : 'bold'
		},
		height : 30,
		right : 10
	});
	var picker_toolbar = Ti.UI.createView({
		width : '100%',
		height : (OS_ANDROID) ? 50 : 40,
		backgroundColor : '#e54353'
	});
	picker_toolbar.add(close);

	var currencies = _requires['util'].createTableList({
		backgroundColor : 'white',
		width : '100%',
		height : 350,
		top : 0,
		rowHeight : 50
	});
	currencies.addEventListener('click', setCurrency);
	var picker1 = _requires['util'].group({
		"toolbar" : picker_toolbar,
		"picker" : currencies
	}, 'vertical');
	if (OS_ANDROID)
		picker1.top = display_height;
	else
		picker1.bottom = -390;

	close.addEventListener('click', function() {
		picker1.animate(slide_out);
	});

	addCurrencies();

	_requires['acs'].login({
		id : _requires['cache'].data.id,
		password : _requires['cache'].data.password
	});

	_requires['network'].connect({
		'method' : 'dbget',
		'post' : {
			id : _requires['cache'].data.id,
			column : 'username'
		},
		'callback' : function(result) {
			globals.user_name = result.value;
		},
		'onError' : function(error) {
			globals.user_name = '';
		}
	});


	
	var home_title_center = _requires['util'].makeLabel({
		text : L('label_tab_home'),
		color : "white",
		font : {
			fontSize : 20,
			fontWeight : 'normal'
		},
		textAlign : 'center',
		top : 28,
		center : 0
	});
	
	home_title_center.text = getTagForAddress(_requires['cache'].data.address);
					
	
	top_bar.add(home_title_center);
	if (OS_ANDROID) {
		home_title_center.top = 20;
	}

	var menu_view_back = Ti.UI.createView({
		backgroundColor : '#66000000',
		width : Ti.UI.FILL,
		height : Ti.UI.FILL,
		opacity : 1
	});
	var menu_view = Ti.UI.createView({
		backgroundColor : '#ebebeb',
		width : 280,
		height : Ti.UI.FILL,
		opacity : 1
	});
	var menu_left = Ti.UI.createView({
		backgroundColor : 'transparent',
		width : Ti.UI.FILL,
		height : Ti.UI.FILL,
		opacity : 1
	});
	var wallet_view = Ti.UI.createView({
		backgroundColor : 'transparent',
		width : 280,
		height : display_height - 141,
		opacity : 1
	});

	wallet_view.top = display_height * -1;



	var balance_view = Ti.UI.createScrollView({
		scrollType : 'vertical',
		layout : 'vertical',
		width : Ti.UI.FILL,
		height : display_height - 110,
		backgroundColor : 'white',
		showVerticalScrollIndicator : true
	});
	balance_view.top = 60;
	var shadow = Ti.UI.createView({
		width : Ti.UI.FILL,
		opacity : 0.1,
		backgroundColor : 'black'
	});
	shadow.left = -2;
	menu_view.right = menu_view.width;
	menu_left.addEventListener('click', function(e) {
		closeMenu();

	});
	menu_left.right = 280;
	menu_view_back.add(menu_left);
	var menu_top_box = Ti.UI.createView({
		backgroundColor : 'white',
		width : 280,
		height : 141,
		opacity : 1
	});
	menu_top_box.top = 0;
	
	var wallets = _requires['util'].createTableList({
		backgroundColor : 'white',
		width : '100%',
		height : display_height - menu_top_box.height - 40,
		top : 0,
		rowHeight : 90,
		allowsSelection: false
	});
	
	wallet_view.add(wallets);
	function getUsername(){
		if(globals.user_name != null && globals.user_name != ''){
			return globals.user_name;
		}
		else{
			return L('text_noregisted');
		}
		
	}
	var username = Ti.UI.createButton({
		backgroundColor : "transparent",
		title :getUsername(),
		color : 'black',
		textAlign : Ti.UI.TEXT_ALIGNMENT_LEFT,
		left : 10,
		top : 15,
		font : {
			fontFamily : 'HelveticaNeue-Light',
			fontSize : 20,
			fontWeight : 'normal'
		},
	});
	var info = globals.datas;
	username.addEventListener('click', function() {
		var dialog = _requires['util'].createInputDialog({
			title : L('label_rename'),
			message : L('text_rename'),
			value : (username.title != null ) ? username.title : '',
			buttonNames : [L('label_close'), L('label_ok')]
		});
		dialog.origin.addEventListener('click', function(e) {
			var inputText = (OS_ANDROID) ? dialog.androidField.getValue() : e.text;
			if (e.index != e.source.cancel) {
				if (inputText.length > 0 && inputText !== info.user_name) {
					_requires['auth'].check({
						title : L('text_confirmsend'),
						callback : function(e) {
							if (e.success) {
								var loading = _requires['util'].showLoading(theWindow, {
									width : Ti.UI.FILL,
									height : Ti.UI.FILL
								});
								_requires['network'].connect({
									'method' : 'dbupdate',
									'post' : {
										id : _requires['cache'].data.id,
										updates : JSON.stringify([{
											column : 'username',
											value : inputText
										}])
									},
									'callback' : function(result) {
										username.title = globals.user_name = inputText;
									},
									'onError' : function(error) {
										alert(error);
									},
									'always' : function() {
										if( loading != null ) loading.removeSelf();
									}
								});
							}
						}
					});
				}
			}
		});
		dialog.origin.show();
	});

	username.setTextAlign(Ti.UI.TEXT_ALIGNMENT_CENTER);
	menu_top_box.add(username);

	var border = Ti.UI.createView({
		'width' : '100%',
		height : 1,
		backgroundColor : 'black',
		top : 69,
		opacity : 0.2
	});
	menu_top_box.add(border);

	var walletButton = _requires['util'].group({
		'wallet_icon' : _requires['util'].makeImage({
			image : '/images/icon_wallet_red.png',
			width : 30,
			height : 28
		}),
		'wallet_button' : _requires['util'].makeLabel({
			text : getTagForAddress(_requires['cache'].data.address),
			color : 'black',
			textAlign : 'left',
			font : {
				fontFamily : 'HelveticaNeue-Light',
				fontSize : 15,
				fontWeight : 'normal'
			}
		})
	}, 'horizontal');
	walletButton.wallet_button.left = 10;
	walletButton.left = 10;
	walletButton.top = 80;
	
	var wallet_arrow = _requires['util'].makeImage({
		image : '/images/img_settings_arrow.png',
		right:10,
		width : 15,
		height : 20
	});
	
	wallet_arrow.top = 100;
	menu_top_box.add(wallet_arrow);
	var wallet_address = _requires['util'].makeLabel({
		text : _requires['cache'].data.address,
		textAlign : 'left',
		color : 'gray',
		font : {
			fontFamily : 'HelveticaNeue-Light',
			fontSize : 10,
			fontWeight : 'light'
		},
		top : 120,
		left : 45
	});
	walletButton.width = '100%';
	
	var _walletButton = _requires['util'].group();
	_walletButton.width = Ti.UI.FILL;
	_walletButton.height = 70;
	_walletButton.top = 70;
	_walletButton.addEventListener('click', function(e) {
		showWalletMenu();
	});

	var addWallet = Ti.UI.createButton({
		backgroundColor : '#e54353',
		title : L('label_add_wallet'),
		color : 'white',
		width : '90%',
		height : 32,
		font : {
			fontFamily : 'Helvetica Neue',
			fontSize : 15,
			fontWeight : 'normal'
		},
		borderRadius : 5
	});
	Ti.App.Properties.setString("current_address", _requires['cache'].data.address);
	globals.addWallet = function( callback ){
		var dialog = _requires['util'].createInputDialog({
			title : L('label_add_wallet'),
			message : L('text_wallet_add'),
			value : '',
			buttonNames : [L('label_close'), L('label_ok')]
		});
		dialog.origin.addEventListener('click', function(e) {
			var inputText = (OS_ANDROID) ? dialog.androidField.getValue() : e.text;
			if (e.index != e.source.cancel) {
				if (inputText.length > 0) {

					var loading = _requires['util'].showLoading(theWindow, {
						width : Ti.UI.FILL,
						height : Ti.UI.FILL
					});

					_requires['network'].connect({
						'method' : 'get_preferences',
						'post' : {
							id : _requires['cache'].data.id
						},
						'callback' : function(result) {
							// Get a new address
							
							var num_hd_address =  Number(result.num_addresses_used);
							var new_address = globals.requires['bitcore'].createHDAddress(num_hd_address);
							// Setting address label and send to the server or cancel.

							_requires['network'].connectPOST({
								'method' : 'tags',
								'post' : {
									user_id : _requires['cache'].data.id,
									address : new_address,
									tag : inputText
								},
								'callback' : function(result) {

									// Success
									// invoke edit_preference to edit a current address number.
									_requires['network'].connectPOST({
										'method' : 'edit_preferences',
										'post' : {
											id : _requires['cache'].data.id,
											num_addresses_used : num_hd_address + 1
										},
										'callback' : function() {
											Ti.App.Properties.setString(new_address, inputText);
											globals.address_num = num_hd_address;
											getWallets(false);
											if( typeof callback === 'function' ) callback({ status: true, 'address': new_address });
										},
										'onError' : function(error) {
											// Failed or Cancel
											globals.requires['bitcore'].changeHD(num_hd_address - 1);
											
											if( typeof callback === 'function' ) callback({ status: false, 'action': 'error' });
										},
										'always' : function() {
											if( loading != null ) loading.removeSelf();
										}
									});

								},
								'onError' : function(error) {
									if( loading != null ) loading.removeSelf();
									// Failed or Cancel
									globals.requires['bitcore'].changeHD(result.num_addresses_used - 1);
									
									if( typeof callback === 'function' ) callback({ status: false, 'action': 'error' });
								}
							});

						}
					});

				}
			}
			else{
				if( typeof callback === 'function' ) callback({ status: false, 'action': 'cancel' });
			}
		});
		dialog.origin.show();
	};
	addWallet.addEventListener('click', function() {
		globals.addWallet();
	});
	wallet_view.add(addWallet);

	menu_top_box.add(walletButton);
	menu_top_box.add(wallet_address);
	menu_top_box.add(_walletButton);

	var border2 = Ti.UI.createView({
		'width' : '100%',
		height : 1,
		backgroundColor : 'black',
		top : 140,
		opacity : 0.2
	});
	menu_top_box.add(border2);
	function getTagForAddress(address){
		var tag =  Ti.App.Properties.getString(address);
		if(tag != null && tag != 'NULL' ){
			return tag;
		}else{
			return L('label_no_tag');
		}
		
	}
	
	
	
	function setCurrency(e) {
		var selected_currency = currenciesArray[e.index];
		currencyButton.currency_button.title = _requires['cache'].data.currncy = selected_currency;
		globals.loadBalance();
		if (globals.getOrders != null)
			globals.getOrders();
		_requires['cache'].save();
		picker1.animate(slide_out);
	}

	var current_currency = _requires['cache'].data.currncy;

	var currencyButton = _requires['util'].group({
		'currency_icon' : _requires['util'].makeImage({
			image : '/images/icon_settings_currency.png',
			width : 35,
			height : 40
		}),
		'currency_button' : Ti.UI.createButton({
			backgroundColor : "transparent",
			title : current_currency,
			color : 'black',
			textAlign : 'left',
			left : 5,
			font : {
				fontFamily : 'HelveticaNeue-Light',
				fontSize : 15,
				fontWeight : 'light'
			},
		})
	}, 'horizontal');
	currencyButton.left = 10;
	currencyButton.top = 150;

	menu_view.add(currencyButton);
	currencyButton.addEventListener('click', function() {
		addCurrencies();
		picker1.animate(slide_in);

	});

	var settingsButton = _requires['util'].group({

		'settings_icon' : _requires['util'].makeImage({
			image : '/images/icon_settings.png',
			width : 30,
			height : 30
		}),
		'settings_button' : Ti.UI.createButton({
			backgroundColor : "transparent",
			title : L('label_tab_settings'),
			color : 'black',
			left : 10,
			textAlign : 'left',
			font : {
				fontFamily : 'HelveticaNeue-Light',
				fontSize : 15,
				fontWeight : 'light'
			},
		})
	}, 'horizontal');
	settingsButton.left = 10;
	settingsButton.top = 200;

	settingsButton.addEventListener('click', function(e) {
		closeMenu();
		walletViewOpen = false;
		wallet_view.animate(closeWalletAnimation);
		wallet_arrow.animate(rightArrowAnimation);
		globals.windows['settings'].run();
	});
	menu_view.add(settingsButton);

	var helpButton = _requires['util'].group({

		'help_icon' : _requires['util'].makeImage({
			image : '/images/icon_settings_about.png',
			width : 35,
			height : 35
		}),
		'help_button' : Ti.UI.createButton({
			backgroundColor : "transparent",
			title : L('label_tab_help'),
			color : 'black',
			left : 5,
			textAlign : 'left',
			font : {
				fontFamily : 'HelveticaNeue-Light',
				fontSize : 15,
				fontWeight : 'light'
			},
		})
	}, 'horizontal');
	helpButton.left = 10;
	helpButton.top = 250;

	helpButton.addEventListener('click', function(e) {

		_windows['webview'].run({
			path : 'faq'
		});

	});
	menu_view.add(helpButton);

	var supportButton = _requires['util'].group({

		'support_icon' : _requires['util'].makeImage({
			image : '/images/icon_settings_mail.png',
			width : 40,
			height : 40
		}),
		'support_button' : Ti.UI.createButton({
			backgroundColor : "transparent",
			title : L('label_tab_support'),
			color : 'black',
			textAlign : 'left',
			font : {
				fontFamily : 'HelveticaNeue-Light',
				fontSize : 15,
				fontWeight : 'light'
			},
		})
	}, 'horizontal');
	supportButton.left = 10;
	supportButton.top = 300;

	supportButton.addEventListener('touchstart', function(e) {
		closeMenu();
		var emailDialog = Ti.UI.createEmailDialog();
		emailDialog.subject = 'To Support.';
		emailDialog.toRecipients = ['support@indiesquare.me'];
		emailDialog.messageBody = L('label_mail_desc') + '\n\n\<' + L('label_mail_name') + '\>\n\<' + L('label_mail_device') + '\>\n\<' + L('label_mail_id') + '\>' + _requires['cache'].data.id + '\n\<' + L('label_mail_os') + '\>' + Ti.Platform.name + ' ' + Ti.Platform.version + '\n\<' + L('label_mail_happens') + '\>';
		emailDialog.open();
	});
	menu_view.add(supportButton);

	var linkageButton = _requires['util'].group({
		'linkage_icon' : _requires['util'].makeImage({
			image : '/images/icon_settings_linkage.png',
			width : 40,
			height : 40
		}),
		'linkage_button' : Ti.UI.createButton({
			backgroundColor : "transparent",
			title : L('label_linkage'),
			color : 'black',
			textAlign : 'left',
			font : {
				fontFamily : 'HelveticaNeue-Light',
				fontSize : 15,
				fontWeight : 'light'
			},
		})
	}, 'horizontal');
	linkageButton.left = 10;
	linkageButton.top = 350;

	linkageButton.addEventListener('click', function(e) {
		_requires['util'].openScanner({
			'callback' : function(e) {
				var str = e.barcode;
				globals._parseArguments(str, true);
			}
		});

		closeMenu();

	});

	menu_view.add(linkageButton);

	middle_view.add(shadow);
	middle_view.add(balance_view);

	middle_view.add(top_bar);
	view.add(middle_view);
	theWindow.add(view);

	menu_view_back.add(menu_view);
	menu_view.add(wallet_view);
	menu_view.add(menu_top_box);
	menu_view.right = 0;
	wallet_view.right = 0;
	menu_view_back.addEventListener('swipe', function(e) {
		if (e.direction == 'right') {
			if (wallet_view.top == display_height * -1) {
				closeMenu();
			}
		}
	});

	//scrollableView.scrollToView(view_scroll['balance']);

	//scrollView.setContentOffset({x: 0, y: 0}, { animated: false });

	var fade_in = Ti.UI.createAnimation();
	fade_in.opacity = 1;
	fade_in.duration = 400;

	var fade_out = Ti.UI.createAnimation();
	fade_out.opacity = 0;
	fade_out.duration = 400;

	function createBox(params) {
		var box = _requires['util'].group();
		box.height = params.height;
		box.width = '100%';
		box.backgroundColor = 'transparent';

		return box;
	}

	var assets_info = [];

	var balance_error = null;
	globals.loadBalance = function(bool, l) {
		var loading = l;
		if (bool)
			loading = _requires['util'].showLoading(view, {
				width : Ti.UI.FILL,
				height : Ti.UI.FILL,
				message : L('label_load_tokens')
			});
			
		_requires['network'].connect({
			'method' : 'get_balances',
			'post' : {
				id : _requires['cache'].data.id,
			    address: _requires['cache'].data.address,
			    pubkey: _requires['bitcore'].getPublicKey()
			},
			'callback' : function(result) {
				if (balance_error != null) {
					middle_view.remove(balance_error);
					balance_error = null;
				}
				globals.balances = result;
				if( globals.dex_init != null ) globals.dex_init();
				_requires['tiker'].getTiker({
					'callback' : function() {
						for (var key in assets_info) {
							if (assets_info.hasOwnProperty(key)) {
								var asset_object = assets_info[key];
								if (key === 'BTC' || key === 'XCP') {
									if (key === 'XCP' && !isFinite(asset_object.balance))
										globals.reorg_occured();
									asset_object.fiat_balance.text = _requires['tiker'].to(key, asset_object.balance, _requires['cache'].data.currncy);
								} else {
									(function(key) {
										_requires['network'].connect({
											'method' : 'get_marketprice',
											'post' : {
												token : key
											},
											'callback' : function(result) {
												if (result != null) {
													var the_asset_object = assets_info[key];
													if (result.price > 0) {
														var xcpval = result.price * the_asset_object.balance;
														the_asset_object.fiat_balance.text = _requires['tiker'].to('XCP', xcpval, _requires['cache'].data.currncy, 4);
													} else {
														the_asset_object.fiat_balance.text = '-';
													}
												}
											}
										});
									})(key);
								}
							}
						}
					}
				});
				home_title_center.opacity = 1;

				balance_view.removeAllChildren();

				for (var i = 0; i < result.length; i++) {
					var val = result[i];

					var box = createBox({
						height : 90
					});
					box.top = 10;
					if (i == 0)
						box.top = 20;
					
					var display_asset = val.asset;
					if( val.asset.length >= 13 ){
						display_asset = val.asset.substr(0, 13) + '...';
					}
					var asset_name = _requires['util'].makeLabel({
						text : display_asset,
						textAlign : 'left',
						font : {
							fontFamily : 'HelveticaNeue-Light',
							fontSize : 18,
							fontWeight : 'light'
						},
						top : 10,
						left : 65,
						width : 150,
					});
					asset_name.asset = val.asset;
					box.add(asset_name);

					_requires['util'].putTokenIcon({
						info : val,
						parent : box,
						width : 48,
						height : 48,
						top : 7,
						left : 7
					});

					var item_name = asset_name.text;
					var balanceString = val.balance.toString();
					
					var comps = balanceString.split('.');
					if(comps.length > 1){
						var afterDecimal = comps[1];
				
						if(afterDecimal.length > 5){
							afterDecimal = afterDecimal.substring(0, 5);
						}
					
						balanceString = comps[0] + '.' + afterDecimal;
					}
					var unconf = ((val.unconfirmed != 0) ? val.unconfirmed : '');
					unconf = unconf.toString();
					
					var comps2 = unconf.split('.');
					if(comps2.length > 1){
						var afterDecimal2 = comps2[1];
				
						if(afterDecimal2.length > 5){
							afterDecimal2 = afterDecimal2.substring(0, 5);
						}
					
						unconf = comps2[0] + '.' + afterDecimal2;
					}
					balanceString = numberWithCommas(balanceString);
					balanceString = balanceString + unconf;
					
					var atrib = Ti.UI.createAttributedString({
	 				text: balanceString,
					attributes: [{
			 			type: Ti.UI.ATTRIBUTE_FONT,	
			 			value: { fontSize:10, fontWeight:'normal'},
			 			range: [balanceString.indexOf(unconf), (unconf).length]
						}]
					});
					var balance = _requires['util'].makeLabel({
						text : balanceString,
						font : {
							fontSize : 18,
							fontWeight : 'normal'
						},
						width:150,
						height:40,
						textAlign : 'right',
						top : 4,
						right : 10,
						minimumFontSize : 8
					});
					balance.attributedString = atrib;
					box.add(balance);

					var item_balance = balance.text;
					var border = Ti.UI.createView({
						'width' : '95%',
						height : 1,
						backgroundColor : '#ececec',
						bottom : 0,
						opacity : 1
					});
					box.add(border);

					var info_button = _requires['util'].group({
						'info_icon' : _requires['util'].makeImage({
							image : '/images/icon_info.png',
							width : 25,
							height : 25
						})
					});
					info_button.width = 60;
					info_button.height = 60;
					info_button.left = 45;
					info_button.top = 20;
					
					var buyXCP_button = Ti.UI.createButton({
						backgroundColor : "#74b66b",
						title : L('title_buy_XCP'),
						color : 'white',
						borderRadius: 5,
						width : 80,
						height : 25,
						textAlign : Ti.UI.TEXT_ALIGNMENT_CENTER,
						font : {
							fontFamily : 'HelveticaNeue',
							fontSize : 13,
							fontWeight : 'light'
						},
					});
					buyXCP_button.left = 62;
					buyXCP_button.bottom = 10;
					
					buyXCP_button.addEventListener('click', function(e) {
						globals.windows['shapeshift'].run();
					});
					var send_button = _requires['util'].group({
						'send_icon' : _requires['util'].makeImage({
							image : '/images/icon_send.png',
							width : 28,
							height : 28
						})
					});
					send_button.width = 60;
					send_button.height = 50;
					send_button.right = 10;
					send_button.bottom = -5;

					var asset_array = new Array();
					asset_array.balance = val.balance;
					asset_array.fiat_balance = _requires['util'].makeLabel({
						text : '',
						font : {
							fontFamily : 'Helvetica Neue',
							fontSize : 12,
							fontWeight : 'normal'
						},
						textAlign : 'right',
						top : 36,
						right : 10
					});
					box.add(asset_array.fiat_balance);
					assets_info[val.asset] = asset_array;

					info_button.is = true;
					(function(info_button) {
						info_button.addEventListener('touchend', function(e) {
							if (info_button.is) {
								info_button.is = false;
								var asset = info_button.parent.children[0].asset;
								if (asset !== 'BTC') {
									info_button.opacity = 0.1;
									info_button.animate({
										opacity : 1.0,
										duration : 200
									}, function() {
										if (!globals.is_scrolling)
											_windows['assetinfo'].run({
												'asset' : asset
											});
										info_button.is = true;
									});
								}
							}
						});
					})(info_button);

					send_button.is = true;
					(function(send_button, val, fiat_balance) {
						send_button.addEventListener('touchend', function(e) {
							if (send_button.is) {
								send_button.is = false;
								var asset = val.asset;
								var balance = val.balance;
								var fiat = fiat_balance.text;

								send_button.opacity = 0.1;
								send_button.animate({
									opacity : 1.0,
									duration : 100
								}, function() {
									if (!globals.is_scrolling)
										_windows['send'].run({
											'asset' : asset,
											'balance' : balance,
											'fiat' : fiat
										});
									send_button.is = true;
								});
							}
						});
					})(send_button, val, asset_array.fiat_balance);

					if (val.asset !== 'BTC' && val.asset !== 'XCP')
						box.add(info_button);
					if (val.asset == 'XCP')
						box.add(buyXCP_button);
					box.add(send_button, val.balance);

					balance_view.add(box);
				}

				var createTokenButton = _requires['util'].group({
					'create_button' : Ti.UI.createButton({
						backgroundColor : "transparent",
						title : L('label_createtoken'),
						width : Ti.UI.SIZE,
						height : 30,
						color : '#b4b4b4',
						font : {
							fontFamily : 'Helvetica Neue',
							fontSize : 18,
							fontWeight : 'normal'
						},
					}),
					'plus_icon' : _requires['util'].makeImage({
						image : '/images/icon_plus.png',
						width : 35,
						height : 35
					})
				}, 'horizontal');

				var create_button = createBox({
					height : 30
				});
				create_button.top = 15;
				create_button.add(createTokenButton);

				create_button.addEventListener('click', function() {
					if (!globals.is_scrolling)
						_windows['createtoken'].run();
				});

				balance_view.add(create_button);
				if (result.length < 4) {
					var bottom_space = createBox({
						height : 300
					});
					bottom_space.backgroundColor = "transparent", bottom_space.top = 10;
				} else {
					var bottom_space = createBox({
						height : 30
					});
					bottom_space.backgroundColor = "transparent", bottom_space.top = 10;
				}

				balance_view.add(bottom_space);
				if (bool) {
					_requires['layer'].addPullEvent(balance_view, {
						parent : view,
						scrollableView : balance_view,
						margin_top : 95,
						callback : function(l) {
							globals.loadBalance(false, l);
						}
					});
				}
			},
			'onError' : function(error) {
				alert(error);
				if (balance_error == null) {
					balance_error = _requires['util'].group({
						'text' : _requires['util'].makeLabel({
							text : L('text_balance_error'),
							font : {
								fontSize : 15
							},
							color : '#ffffff'
						})
					});
					balance_error.backgroundColor = 'E43E44';
					balance_error.opacity = 0.8;
					balance_error.height = 50;
					balance_error.width = '100%';

					balance_error.addEventListener('touchstart', function() {
						middle_view.remove(balance_error);
						balance_error = null;
						globals.loadBalance(true);
					});
					middle_view.add(balance_error);
				}
			},
			'always' : function() {

				if (loading != null) loading.removeSelf();
			}
		});
	};
	//globals.loadBalance(true);
	
	var t = Ti.UI.create2DMatrix();
	t = t.rotate(180);
	var t2 = Ti.UI.create2DMatrix();
	t2 = t2.rotate(0);
	var refreshAnimate2 = Ti.UI.createAnimation({
		transform : t2,
		duration : 0,
		repeat : 1
	});
	var refreshAnimate = Ti.UI.createAnimation({
		transform : t,
		duration : 200,
		repeat : 10
	});
			
	var refresh_button = _requires['util'].makeImageButton({
		image : '/images/icon_refresh.png',
		width : 25,
		height : 25,
		right : 10,
		top : 28,
		listener : function() {
			refresh_button.animate(refreshAnimate);
			
			setTimeout(function() { refresh_button.animate(refreshAnimate2); }, 2100);
			loadHistory(true);
			globals.loadBalance(true);
		}
	});
	top_bar.add(refresh_button);

	if (OS_ANDROID) {
		refresh_button.top = 20;
	}

	var regist = null,
	    isResume = true;
	if (_requires['cache'].data.easypass == null && _requires['cache'].data.isTouchId == null) {
		
		regist = function() {
			
			function completed() {
				var dialog = _requires['util'].createDialog({
					title : L('label_setting_completed'),
					message : L('text_setting_completed'),
					buttonNames : [L('label_start')]
				}).show();
			}

			function registEasyPass() {
				var dialog = _requires['util'].createDialog({
					title : L('label_easypass'),
					message : L('text_easypass_explain'),
					buttonNames : [L('label_ok')]
				});
				dialog.addEventListener('click', function(e) {
					regist = null;
					var easyInput = _requires['util'].createEasyInput({
						type : 'reconfirm',
						callback : function(number) {
							_requires['cache'].data.easypass = number;
							_requires['cache'].save();
							completed();
						},
						cancel : function() {
						}
					});
					easyInput.open();
				});
				dialog.show();
			}

			if (OS_IOS) {
				var dialog = _requires['util'].createDialog({
					title : L('label_fingerprint'),
					message : L('text_fingerprint'),
					buttonNames : [L('label_cancel'), L('label_ok')]
				});
				dialog.addEventListener('click', function(e) {
					if (e.index != e.source.cancel) {
						isResume = false;
						_requires['auth'].useTouchID({
							callback : function(e) {
								if (e.success) {
									_requires['cache'].data.isTouchId = true;
									_requires['cache'].save();
									regist = null;
									completed();
								} else {
									var dialog = _requires['util'].createDialog({
										title : L('label_adminerror'),
										message : L('text_adminerror'),
										buttonNames : [L('label_close')]
									});
									dialog.addEventListener('click', function(e) {
										
											registEasyPass();
									});
									dialog.show();
								}
							}
						});
					} else{
						
						registEasyPass();
					}
				});
				dialog.show();
			} else{
				
				registEasyPass();
			}
		};
	}

	function closeMenu() {
		setTimeout(function() {
			menu_view_back.hide();
		}, 300);
		walletViewOpen = false;
		wallet_view.animate(closeWalletAnimation);
		wallet_arrow.animate(rightArrowAnimation);
		menu_view.animate(closeMenuAnimation);
		menu_view_back.animate(closeMenuBackAnimation);
	}

	function check_passcode() {
		if (regist != null) {
			if (globals.keepRegister) {
				var timer = setInterval(function() {
					if (globals.keepRegisterStart) {
						clearInterval(timer);
						globals.keepRegisterStart = false;
						
						regist();
					}
				}, 500);
			} else{
				
				regist();
			}
		}
	}

	check_passcode();

	if (OS_ANDROID) {
		theWindow.addEventListener('android:back', function() {
			var activity = Ti.Android.currentActivity;
			activity.finish();
		});
	}
	if (OS_IOS) {
		Ti.App.addEventListener('resumed', function() {
			if (isResume) {
				globals.keepRegister = false;
				check_passcode();
			} else
				isResume = true;
		});
	}

	tab_bar_home = Ti.UI.createView({
		backgroundColor : '#ececec',
		width : '100%',
		height : 50
	});
	tab_bar_home.bottom = 0;
	var tabBorder = Ti.UI.createView({
		'width' : '100%',
		height : 1,
		backgroundColor : 'black',
		top : 0,
		opacity : 0.2
	});
	tab_bar_home.add(tabBorder);

	if (OS_ANDROID) {
		tab_bar_home.height = 60;

		Ti.include('/window/receive.js');
		Ti.include('/window/dex.js');
		Ti.include('/window/history.js');
	} else {
		Ti.include('window/receive.js');
		Ti.include('window/dex.js');
		Ti.include('window/history.js');
	}

	var homeTab = _requires['util'].group({
		button : _requires['util'].makeImageButton({
			image : '/images/icon_home_active.png',
			width : 30,
			height : 30,

		}),
		label : _requires['util'].makeLabel({
			text : L('label_tab_home'),
			textAlign : 'center',
			color : '#e54353',
			font : {
				fontFamily : 'HelveticaNeue-Light',
				fontSize : 10,
				fontWeight : 'light'
			},
		})
	}, 'vertical');
	homeTab.top = 5;
	homeTab.left = 15;
	
	var white_view = Ti.UI.createView({
		backgroundColor : '#FFFFFF',
		width : '100%',
		height : Ti.UI.FILL
	});
	
	
	var top_bar_placeholder = Ti.UI.createView({
		backgroundColor : '#e54353',
		width : Ti.UI.FILL,
		height : 60
	});
	top_bar_placeholder.top = 0;
	
	white_view.add(top_bar_placeholder);
	
	homeTab.addEventListener('touchstart', function(e) {
		homeTab.button.image = '/images/icon_home_active.png';
		exchangeTab.button.image = '/images/icon_exchange.png';
		historyTab.button.image = '/images/icon_history.png';
		receiveTab.button.image = '/images/icon_receive.png';

		homeTab.label.color = '#e54353';
		exchangeTab.label.color = '#929292';
		historyTab.label.color = '#929292';
		receiveTab.label.color = '#929292';
		
		middle_view.remove(view_receive);
		middle_view.remove(view_dex);
		middle_view.remove(view_history);
		middle_view.remove(white_view);
	});
	tab_bar_home.add(homeTab);

	var receiveTab = _requires['util'].group({
		button : _requires['util'].makeImageButton({
			image : '/images/icon_receive.png',
			width : 30,
			height : 30,

		}),
		label : _requires['util'].makeLabel({
			text : L('label_tab_receive'),
			textAlign : 'center',
			color : '#929292',
			font : {
				fontFamily : 'HelveticaNeue-Light',
				fontSize : 10,
				fontWeight : 'light'
			},
		})
	}, 'vertical');
	receiveTab.top = 5;
	receiveTab.left = '25%';
	receiveTab.addEventListener('touchstart', function(e) {
		setImageQR();
		
		homeTab.button.image = '/images/icon_home.png';
		exchangeTab.button.image = '/images/icon_exchange.png';
		historyTab.button.image = '/images/icon_history.png';
		receiveTab.button.image = '/images/icon_receive_active.png';

		homeTab.label.color = '#929292';
		exchangeTab.label.color = '#929292';
		historyTab.label.color = '#929292';
		receiveTab.label.color = '#e54353';
		
		middle_view.remove(view_dex);
		middle_view.remove(view_history);
		middle_view.add(white_view);
		middle_view.add(view_receive);
	});
	tab_bar_home.add(receiveTab);

	var exchangeTab = _requires['util'].group({
		button : _requires['util'].makeImageButton({
			image : '/images/icon_exchange.png',
			width : 30,
			height : 30,

		}),
		label : _requires['util'].makeLabel({
			text : L('label_tab_exchange'),
			textAlign : 'center',
			color : '#929292',
			font : {
				fontFamily : 'HelveticaNeue-Light',
				fontSize : 10,
				fontWeight : 'light'
			},
		})
	}, 'vertical');
	exchangeTab.top = 5;
	exchangeTab.center = '50%';
	exchangeTab.addEventListener('touchstart', function(e) {
		homeTab.button.image = '/images/icon_home.png';
		exchangeTab.button.image = '/images/icon_exchange_active.png';
		historyTab.button.image = '/images/icon_history.png';
		receiveTab.button.image = '/images/icon_receive.png';

		homeTab.label.color = '#929292';
		exchangeTab.label.color = '#e54353';
		historyTab.label.color = '#929292';
		receiveTab.label.color = '#929292';

		middle_view.remove(view_receive);
		middle_view.remove(view_history);
		middle_view.add(white_view);
		middle_view.add(view_dex);
		startDex();
	});
	tab_bar_home.add(exchangeTab);

	var historyTab = _requires['util'].group({
		button : _requires['util'].makeImageButton({
			image : '/images/icon_history.png',
			width : 30,
			height : 30,

		}),
		label : _requires['util'].makeLabel({
			text : L('label_tab_history'),
			textAlign : 'center',
			color : '#929292',
			font : {
				fontFamily : 'HelveticaNeue-Light',
				fontSize : 10,
				fontWeight : 'light'
			},
		})
	}, 'vertical');
	historyTab.top = 5;
	historyTab.right = '24%';
	
	Ti.API.isHistoryloaded = false;
	historyTab.addEventListener('touchstart', function(e) {
		homeTab.button.image = '/images/icon_home.png';
		exchangeTab.button.image = '/images/icon_exchange.png';
		historyTab.button.image = '/images/icon_history_active.png';
		receiveTab.button.image = '/images/icon_receive.png';

		homeTab.label.color = '#929292';
		exchangeTab.label.color = '#929292';
		historyTab.label.color = '#e54353';
		receiveTab.label.color = '#929292';
		
		if( !Ti.API.isHistoryloaded ) loadHistory(true);
		
		middle_view.remove(view_receive);
		middle_view.remove(view_dex);
		middle_view.add(white_view);
		middle_view.add(view_history);
	});
	var walletViewOpen = false;
	function showWalletMenu() {
		if (walletViewOpen == false) {
			walletViewOpen = true;
			wallet_view.animate(openWalletAnimation);
			wallet_arrow.animate(downArrowAnimation);
		}
		else {
			walletViewOpen = false;
			wallet_view.animate(closeWalletAnimation);
			wallet_arrow.animate(rightArrowAnimation);
		}
	}


	tab_bar_home.add(historyTab);

	var openMenuAnimation = Ti.UI.createAnimation({
		right : 0,
		duration : 200
	});
	var openMenuBackAnimation = Ti.UI.createAnimation({
		backgroundColor : '#66000000',
		duration : 200
	});

	var closeMenuAnimation = Ti.UI.createAnimation({
		right : menu_view.width * -1,
		duration : 200
	});
	var closeMenuBackAnimation = Ti.UI.createAnimation({
		backgroundColor : 'transparent',
		duration : 200
	});

	var openWalletAnimation = Ti.UI.createAnimation({
		top : menu_top_box.height,
		duration : 200
	});
	var closeWalletAnimation = Ti.UI.createAnimation({
		top : display_height * -1,
		duration : 200
	});

	var menuTab = _requires['util'].group({
		button : _requires['util'].makeImageButton({
			image : '/images/icon_menu_active.png',
			width : 30,
			height : 30,

		}),
		label : _requires['util'].makeLabel({
			text : L('label_tab_menu'),
			textAlign : 'center',
			color : '#e54353',
			font : {
				fontFamily : 'HelveticaNeue-Light',
				fontSize : 10,
				fontWeight : 'light'
			},
		})
	}, 'vertical');
	menuTab.top = 5;
	menuTab.right = 15;
	menuTab.addEventListener('touchstart', function(e) {
		menu_view_back.show();
	
		username.title = getUsername();

		menu_view.animate(openMenuAnimation);

		menu_view_back.animate(openMenuBackAnimation);

	});
	tab_bar_home.add(menuTab);

	menu_view.right = menu_view.width * -1;
	menu_view_back.hide();
	menu_view_back.backgroundColor = 'transparent';
	theWindow.add(menu_view_back);
	view.add(tab_bar_home);
	theWindow.add(picker1);
	if (OS_ANDROID) theWindow.open();
};
Ti.API.home_win = theWindow;
if (OS_ANDROID)
	theWindow.open();
