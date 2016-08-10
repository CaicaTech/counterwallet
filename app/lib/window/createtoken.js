exports.run = function( params ){
	var _windows = globals.windows;
	var _requires = globals.requires;
	
	var win = _requires['layer'].createWindow();
	var main_view = Ti.UI.createScrollView({ backgroundColor:'#ececec', width: Ti.UI.FILL, height: Ti.UI.FILL });
	win.origin.add(main_view);
	
	var top_bar = Ti.UI.createView({ backgroundColor:'#e54353', width: Ti.UI.FILL, height: 55 });
	top_bar.top = 0;
	win.origin.add(top_bar);
	
	var xcp_balance = globals.balances[1].balance;
	
	var back_home = _requires['util'].makeLabel({
		text:"tokens",
		color:"white",
		font:{fontFamily:'Helvetica Neue', fontSize:14, fontWeight:'normal'},
		textAlign: 'right',
		top: 30, left:10
	});
	top_bar.add( back_home );
	
	back_home.addEventListener('click', function(){
		win.close();
	});
	var back_home_responsive = Ti.UI.createView({ backgroundColor:'transparent', width: '30%', height: '70%', top : 5, left: 0 });
		top_bar.add( back_home_responsive );
	
		back_home_responsive.addEventListener('touchstart', function(){
			win.close();
		});
		back_home_responsive.addEventListener('click', function(){
			win.close();
		});
	
	var settings_title_center = _requires['util'].makeLabel({
		text:"create token",
		color:"white",
		font:{fontFamily:'Helvetica Neue', fontSize:20, fontWeight:'normal'},
		textAlign: 'center',
		top: 25, center: 0
	});
	top_bar.add(  settings_title_center );
	
	var view = _requires['util'].group(null, 'vertical');
	view.top = 50;
	main_view.add(view);
	
	function createDescBox(text){
		var box = _requires['util'].group();
		box.width = '95%';
		box.top = 3;
		box.left = 5;
		box.height = Ti.UI.SIZE;
		
		var label = _requires['util'].makeLabel({
			text: text,
			color: '#999999',
			font:{ fontSize: 10 },
			textAlign: 'left',
			left: 0
		});
		box.add(label);
		
		return box;
	}
	
	function createBox( params ){
		var box = _requires['util'].group(params.add);
		
		box.height = params.height || 50;
		box.width = '100%';
		box.backgroundColor = 'white';
		
		return box;
	}
	
	var sl_numeric = _requires['util'].createSlider({
		init: false,
		on: function(){
			if( OS_IOS ) box_token.field.fireEvent('change');
			box_token.field.setValue('A1' + ('000000' + Math.floor(Math.random() * 10000000) ).substr(-7) + ('000000' + Math.floor(Math.random() * 10000000) ).substr(-7) + ('0000' + Math.floor(Math.random() * 100000) ).substr(-5));
		},
		off: function(){
			if( OS_IOS ) box_token.field.fireEvent('change');
			box_token.field.setValue('');
		}
	});
	sl_numeric.origin.top = sl_numeric.origin.right = 0;
	
	var numeric = _requires['util'].group({
		'origin': sl_numeric.origin,
		'desc': _requires['util'].makeLabel({
			text: L('label_numeric'),
			top: 1,
			font:{ fontSize: 10 },
			color: '#a6a8ab'
		})
	}, 'vertical');
	numeric.right = 10;
	numeric.bottom = 2;
	
	var box_token = createBox({ height: 50, add: {
		'field': _requires['util'].makeTextField({
			hintText: L('label_ex_tokenname'),
			width: '70%', height: 35,
			left: 15,
			border: 'hidden'
		}),
		'fee': _requires['util'].makeLabel({
			text: L('label_fee') + ' 0.5XCP',
			left: 20, bottom: 2,
			font:{ fontSize: 10 },
			color: '#a6a8ab'
		}),
		'numeric': numeric
	} });
	box_token.top = 10;
	box_token.field.addEventListener('change', function(e){
		if( OS_IOS ) box_token.field.value = e.value = box_token.field.value.toUpperCase();
		if( e.value.charAt(0) === 'A' ){
			box_token.fee.text = '';
		}
		else{
			box_token.fee.text = L('label_fee') + ' 0.5XCP';
		}
	});
	
	var box_quantity = createBox({ height: 45, add: {
		'field': _requires['util'].makeTextField({
			hintText: L('label_ex_quantity_issue'),
			width: Ti.UI.FILL, height: 35,
			left: 15,
			border: 'hidden',
			keyboardType: Ti.UI.KEYBOARD_TYPE_DECIMAL_PAD,
		})
	} });
	box_quantity.top = 10;
	
	var box_description = createBox({ height: 45, add: {
		'field': _requires['util'].makeTextField({
			hintText: L('label_ex_description'),
			width: Ti.UI.FILL, height: 35,
			left: 15,
			border: 'hidden'
		})
	} });
	box_description.top = 10;
	
	var box_website = createBox({ height: 45, add: {
		'field': _requires['util'].makeTextField({
			hintText: L('label_ex_website'),
			width: Ti.UI.FILL, height: 35,
			left: 15,
			border: 'hidden'
		})
	} });
	box_website.top = 10;
	
	var box_divisible = createBox({ height: 50, add: {
		'label': _requires['util'].makeLabel({
			text: L('text_makedivisible'),
			font:{ fontSize: 14 },
			left: 15
		})
	} });
	box_divisible.top = 10;
	
	var sl_divisible = _requires['util'].createSlider({
		init: true,
		on: function(){ },
		off: function(){ }
	});
	sl_divisible.origin.right = 10;
	box_divisible.add(sl_divisible.origin);
	
	var box_image = createBox({ height: 50, add: {
		'label': _requires['util'].makeLabel({
			text: L('text_imageupload'),
			font:{ fontSize: 14 },
			left: 15
		})
	} });
	box_image.top = 10;
	
	var blobImage = null, showImage = null;
	var sl_image = _requires['util'].createSlider({
		init: false,
		on: function(){
			Ti.Media.openPhotoGallery({
			    success: function(event) {
			    	box_image.label.text = '';
			    	
			    	blobImage = event.media.imageAsThumbnail(48);
			        showImage = _requires['util'].makeImage({
					    image: blobImage,
					    left: 15
					});
					box_image.add(showImage);
			    },
			    error: function(error) {
			        sl_image.off();
			    },
			    cancel: function() {
			        sl_image.off();
			    },
			    allowEditing: true,
			    mediaTypes:[Ti.Media.MEDIA_TYPE_PHOTO],
			});
		},
		off: function(){
			assetImage = null;
			box_image.remove(showImage);
			box_image.label.text = L('text_imageupload');
		}
	});
	sl_image.origin.right = 10;
	box_image.add(sl_image.origin);
	
	var send_button = Ti.UI.createButton({
        backgroundColor : "#e54353",
        title : L('label_create'),
        color:'white',
        width : "110",
        height : "40",
        font:{fontFamily:'Helvetica Neue', fontSize:15, fontWeight:'normal'},
        borderRadius:5  
    });
	send_button.addEventListener('click', function(){
		var result = null;
		_requires['inputverify'].set( new Array(
			{ name: L('label_quantity_issue'), type: 'number', target: box_quantity.field, over: 0, shouldvalue: true }
		));
		if( !sl_numeric.is ) _requires['inputverify'].unshift({ name: L('label_tokenname'), type: 'plain', target: box_token.field, over: 0 });
		
		if( (result = _requires['inputverify'].check()) == true ){
			var token = box_token.field.value.toUpperCase();
		
			var loading = _requires['util'].showLoading(win.origin, { width: Ti.UI.FILL, height: Ti.UI.FILL, message: L('loading_issue')});
			_requires['network'].connectGETv2({
  				'method': 'fees/recommended',
   				'callback': function( fee_array ){
   					_requires['network'].connectPOSTv2({
						'method': 'files/enhancedtokeninfo/' + token,
						'post': {
							image: blobImage,
							description: box_description.field.value,
							website: box_website.field.value
						},
						'callback': function( result ){
							_requires['network'].connectPOSTv2({
								'method': 'transactions/issuance',
								'post': {
									source: _requires['cache'].data.address,
									token: token,
									description: result.uri,
									quantity: box_quantity.field.value,
									divisible: sl_divisible.is,
									fee_per_kb: fee_array[_requires['cache'].data.current_fee],
								},
								'callback': function( result ){
									var fee_XCP = '';
									if( token.charAt(0) !== 'A' ) fee_XCP = '0.5XCP';
									
									loading.removeSelf();
									var feeInBTC = (result.fee / 100000000).toFixed(8);
									var feeInCurrency = globals.requires['tiker'].to('BTC', feeInBTC, globals.requires['cache'].data.currncy);
									var dialog = _requires['util'].createDialog({
										title: L('label_confirm'),
										message: L('text_confirmIssuance').format( {'token': token, 'quantity': box_quantity.field.value} )+'\n\n'+L('label_fee') + ' ' + fee_XCP + ' + ' + feeInBTC + 'BTC (' + feeInCurrency + ')' + '\n' + globals.fee_text[_requires['cache'].data.current_fee],
										buttonNames: [L('label_cancel'), L('label_ok')]
									});
									dialog.addEventListener('click', function(e){
										if( e.index != e.source.cancel ){
											if( token.charAt(0) != 'A' && xcp_balance < 0.5 ){
												var dialog = _requires['util'].createDialog({
													message: L('label_get_xcp'),
													buttonNames: [L('label_close'),L('label_buy_xcp')]
												});
												dialog.addEventListener('click', function(e){
													if( e.index != e.source.cancel ){
														globals.tabGroup.setActiveTab(globals.tabGroup.tabs[1]);
														win.close();
													}
												});
												dialog.show();
											}
											else{
												_requires['auth'].check({ title: L('text_createToken'), callback: function(e){
													if( e.success ){
														loading = _requires['util'].showLoading(win.origin, { width: Ti.UI.FILL, height: Ti.UI.FILL, message: L('loading_issue')});
														_requires['bitcore'].sign(result.unsigned_tx, {
															'address': _requires['cache'].data.address,
															'callback': function(signed_tx){
																_requires['network'].connectPOSTv2({
																	'method' : 'transactions/broadcast',
																	'post': {
																		tx: signed_tx
																	},
																	'callback': function( r ){
																		_requires['util'].createDialog({
																			message: L('text_issuance_done').format({'asset': token}),
																			buttonNames: [L('label_close')]
																		}).show();
																	},
																	'onError': function(error){
																		alert(error);
																	},
																	'always': function(){
																		loading.removeSelf();
																	}
																});
															},
															'fail': function(){
																alert(L('text_error_serierize'));
																loading.removeSelf();
															}
														});									
													}
												}});
											}
										}
									});
									dialog.show();
								},
								'onError': function(error){
									alert(error);
									if( loading != null ) loading.removeSelf();
								}
							});
						},
						'onError': function(error){
							alert(error);
							if( loading != null ) loading.removeSelf();
						}
					});
				},
				'onError' : function(error) {
					alert(error);
					loading.removeSelf();
				}
			});
		}
		else{
			var dialog = _requires['util'].createDialog({
				message: result.message,
				buttonNames: [L('label_close')]
			});
			dialog.addEventListener('click', function(e){
				result.target.focus();
			});
			dialog.show();
		}
	});
	send_button.top = 10;
	
	var bottom_space = _requires['util'].group();
	bottom_space.width = Ti.UI.FILL;
	bottom_space.height = 20;
	
	view.add(_requires['util'].group({
		'box_token': box_token,
		'box_token_desc': createDescBox(L('label_create_token_desc')),
		'box_quantity': box_quantity,
		'box_quantity_desc': createDescBox(L('label_create_quantity_desc')),
		'box_description': box_description,
		'box_description_desc': createDescBox(L('label_create_description_desc')),
		'box_website': box_website,
		'box_website_desc': createDescBox(L('label_create_website_desc')),
		'box_image': box_image,
		'box_image_desc': createDescBox(L('label_create_image_desc')),
		'box_divisible': box_divisible,
		'box_divisible_desc': createDescBox(L('label_create_divisible_desc')),
		'send_button': send_button,
		'bottom_space': bottom_space
	}, 'vertical'));
	
	if(OS_IOS) Ti.API.home_tab.open(win.origin,{ animated:true });
	if(OS_ANDROID) win.origin.open({ animated:true });
	
	if( xcp_balance < 0.5 ){
		var dialog = _requires['util'].createDialog({
			message: L('label_get_xcp'),
			buttonNames: [L('label_close'),L('label_buy_xcp')]
		});
		dialog.addEventListener('click', function(e){
			if( e.index != e.source.cancel ){
				globals.windows['shapeshift'].run();
				win.close();
			}
		});
		dialog.show();
	}
	
	return win.origin;
};