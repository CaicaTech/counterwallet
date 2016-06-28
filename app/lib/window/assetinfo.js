exports.run = function( params ){
	var _windows = globals.windows;
	var _requires = globals.requires;
	
	var win = _requires['layer'].createWindow();
	
	
	var main_view = Ti.UI.createScrollView({ backgroundColor:'#ececec', width: Ti.UI.FILL, height: Ti.UI.FILL });
	win.origin.add(main_view);
	
	var top_bar = Ti.UI.createView({ backgroundColor:'#e54353', width: Ti.UI.FILL, height: 55 });
	top_bar.top = 0;
	win.origin.add(top_bar);
	
	var back_home = _requires['util'].makeLabel({
		text:L('label_tab_home'),
		color:"white",
		font:{ fontSize:15, fontWeight:'normal'},
		textAlign: 'right',
		top: 25, left:10
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
		text:L('label_asset_info'),
		color:"white",
		font:{ fontSize:20, fontWeight:'normal'},
		textAlign: 'center',
		top: 25, center: 0
	});
	top_bar.add(  settings_title_center );
	
	
	var view = _requires['util'].group(null, 'vertical');
	view.top = 50;
	main_view.add(view);
		
	var loading = _requires['util'].showLoading(main_view, { width: Ti.UI.FILL, height: Ti.UI.FILL, message: L('loading_assetinfo')});
	_requires['network'].connect({
		'method': 'get_asset_info',
		'post': {
			asset: params.asset
		},
		'callback': function( result ){
			var readonly = !(_requires['cache'].data.address === result.issuer);
			function createInfo(json){
				function createFieldBox(fontSize){
					var box = _requires['util'].group({
						title: _requires['util'].makeLabel({
							text: '',
							left: 10,
							font:{ fontSize:10 },
							color: '#a6a8ab'
						}),
						field: _requires['util'].makeTextField({
							value: '',
							width: Ti.UI.FILL,
							height: 35,
							left: 15,
							border: 'hidden',
							font:{ fontSize:fontSize },
							keyboardType: Ti.UI.KEYBOARD_TYPE_DECIMAL_PAD,
						})
					}, 'vertical');
					box.width = '100%';
					box.backgroundColor = 'white';
					view.add(box);
					
					return box;
				}
				
				function createBox(){
					var box = _requires['util'].group({
						'title': _requires['util'].makeLabel({
							text: '',
							left: 10,
							font:{ fontSize: 15 },
							color: '#a6a8ab'
						})
					});
					box.top = 0;
					box.width = '100%';
					box.height = 35;
					box.backgroundColor = 'white';
					view.add(box);
					
					return box;
				}
				
				if( json != null && json.image != null ){
					if( !json.image.match(/^https?:\/\//) ) json.image = 'https://' + json.image;
					var image = Ti.UI.createImageView({
						image: json.image,
						width: 50, height: 50,
						top: 10
					});
					view.add(image);
					result.description = json.description;
				}
				
				var box_asset = createFieldBox(16);
				box_asset.title.text = L('label_info_tokenname');
				box_asset.field.value = result.asset;
				box_asset.field.editable = false;
				box_asset.top = 10;
				
				var box_owner = createFieldBox(14);
				box_owner.title.text = L('label_info_ownedby');
				box_owner.field.value = result.issuer;
				box_owner.field.editable = false;
				box_owner.top = 10;
				
				var box_description = createFieldBox(16);
				box_description.title.text = L('label_info_description');
				box_description.field.value = result.description;
				box_description.top = 10;
				box_description.field.editable = false;
				
				if( json != null ){
					if( json.website != null ){
						var box_website = createFieldBox(16);
						box_website.title.text = L('label_info_web');
						box_website.field.value = json.website;
						box_website.field.editable = false;
						box_website.top = 10;
					}
				}
				
				var box_supply = createFieldBox(16);
				box_supply.title.text = L('label_info_toalissued');
				box_supply.field.value = result.supply;
				box_supply.field.editable = false;
				box_supply.top = 10;
				
				var box_divisible = createBox();
				box_divisible.title.text = L('label_info_divisible');
				box_divisible.top = 10;
				var is_divisible = _requires['util'].createSlider({
					'init': result.divisible,
				});
				is_divisible.origin.right = 10;
				box_divisible.add(is_divisible.origin);
				is_divisible.editable = false;
				
				var box_locked = createBox();
				box_locked.title.text = L('label_lock');
				box_locked.top = 10;
				var is_locked = _requires['util'].createSlider({
					'init': result.locked,
				});
				is_locked.origin.right = 10;
				box_locked.add(is_locked.origin);
				is_locked.editable = false;
				
				var button_holders = Ti.UI.createButton({
		    	    backgroundColor : '#e54353',
		      	 	title : L('label_holders'),
		        	color:'white',
		        	top : 10,
		       		width : '90%',	
		        	height : 32,
		        	font:{fontFamily:'Helvetica Neue', fontSize:15, fontWeight:'normal'},
		       		borderRadius:5
		  		});
		  		button_holders.addEventListener('click', function() {
			   		 _windows['assetholders'].run( { 'asset': params.asset } );
				});
		  		view.add(button_holders);
				loading.removeSelf();
			}
			if( /.*\.json/.test(result.description) ){
				_requires['network'].getjson({
					uri: result.description,
					callback: function(json){ createInfo(json); },
					onError: function(){ createInfo(); }
				});
			}
			else createInfo();
		},
		'onError': function(error){
			alert(L('text_assetinfo_error'));
		}
	});
	if(OS_IOS) Ti.API.home_tab.open(win.origin,{ animated:true });
	if(OS_ANDROID) win.origin.open({ animated:true });
	
	return win.origin;
};