
	
    var _requires = globals.requires;
     
    var view_receive = Ti.UI.createView({ backgroundColor:'#FFFFFF', width: Ti.UI.FILL, height: Ti.UI.FILL });
	var view_box = Ti.UI.createView({ backgroundColor:'transparent', width: Ti.UI.FILL, height: Ti.UI.FILL });
	               
                  
	var top_bar_receive = Ti.UI.createView({ backgroundColor:'#e54353', width: Ti.UI.FILL, height: 60 });
	top_bar_receive.top = 0;
	function removeAllChildren(viewObject){
    //copy array of child object references because view's "children" property is live collection of child object references
    var children = viewObject.children.slice(0);
 
    for (var i = 0; i < children.length; ++i) {
        viewObject.remove(children[i]);
    }
}
	function setImageQR(){
		removeAllChildren(view_box);
	

	
	var addressQR = _requires['cache'].data.address;
	text_title_rec = _requires['util'].group({
		title: _requires['util'].makeLabel({
			text: L('label_bitcoinaddress'),
			top: 10,
			font:{ fontSize: 12 }
		}),
		address: _requires['util'].makeLabel({
			text: addressQR,
			top: 30,
			font:{ fontSize: 13 }
		})
	});
	text_title_rec.top = 0;
	
	home_title_center = _requires['util'].makeLabel({
		text:L('label_tab_receive'),
		color:"white",
		font:{ fontSize:20, fontWeight:'normal'},
		textAlign: 'center',
		top: 28, center: 0
	});
	top_bar_receive.add( home_title_center );
	
	if(OS_ANDROID){
		home_title_center.top = 20;
	}
	
	
	function createQRcode( qr_data ){
		
	 	view_qr = _requires['util'].group({
			'img_qrcode': _requires['util'].makeImageButton({
			    image: qr_data,
			    width: 290, height: 290,
			    top:40, left: 0,
			    listener: function(){
					Ti.UI.Clipboard.setText( addressQR );
					_requires['util'].createDialog({
						message:L('text_copied_message'),
						buttonNames: [L('label_close')]
					}).show();
				}
			}),
			title: text_title_rec
		});
		
		view_box.add(view_qr);
		
		var tap = _requires['util'].makeLabel({
			text:L('label_qrcopy'),
			textAlign: 'left',
			font:{fontFamily: 'HelveticaNeue-Light', fontSize:15, fontWeight:'light'},
			bottom: 100
		});
		
		view_box.add(tap);
		
	}
	
	var f = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, 'qr_address.png');
	if( !f.exists() ){
		_requires['network'].connect({
			'method': 'create_qrcode',
			'binary': true,
			'post': {
				id: _requires['cache'].data.id,
				address: _requires['cache'].data.address
			},
			'callback': function( result ){
				f.write( result );
				createQRcode(f);
			},
			'onError': function( error ){
				alert(error);
			}
		});
	}
	else{
		createQRcode(f);
	}
	
	}
	view_receive.add(view_box);
	
	
	
	view_receive.add(top_bar_receive);
	
