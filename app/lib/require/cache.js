module.exports = (function() {
	var self = {};
	var crypt = require('crypt/api');
	
	function getPath(){
		if( OS_ANDROID ){
			var newDir = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, 'save');
			if( !newDir.exists() ) newDir.createDirectory();
			
			var file = Ti.Filesystem.getFile(newDir.nativePath, 'save_file.json');
			if( !file.exists() ) file.write('');
			
			return file.nativePath;
		}
		else return globals.SAVE_FILE_PATH;
	}
	
	function getRSAPath(){
		if( OS_ANDROID ){
			var newDir = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, 'jithd');
			if( !newDir.exists() ) newDir.createDirectory();
			
			var file = Ti.Filesystem.getFile(newDir.nativePath, 'jithd.json');
			if( !file.exists() ) file.write('');
			
			return file.nativePath;
		}
		else return globals.CRYPT_FILE_PATH;
	}
	
	function getData(){
		var f = Ti.Filesystem.getFile( getPath() );
		var data = f.read();
		
		if ( !data || data.length <= 0 ) data = '{}';
		else{
			var rsa_info = self.load_rsa();
			var RSAkey = (globals.Crypt_key == null)? (globals.Crypt_key = crypt.loadRSAkey(rsa_info.a)): globals.Crypt_key;
			try{
				var DecryptionResult = crypt.decrypt(data.toString(), RSAkey);
				data = DecryptionResult.plaintext;
			}
			catch(e){
				Ti.API.info(e);
				throw new Error('*** Access deny.');
			}
		}
		return JSON.parse(data);
	}
	
	self.data = null;
	
	self.init = function(){
		var f = Ti.Filesystem.getFile( getPath() );
	    f.write('');
	    
	    var f2 = Ti.Filesystem.getFile( getRSAPath() );
	    f2.write('');
	    
	    var f3 = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, 'qr_address.png');
		if( f3.exists() ) f3.deleteFile();
		
		Ti.App.Properties.setString('current_address', null);
	    
	    self.load();
	};
	
	self.load_rsa = function(){
		var f  = Ti.Filesystem.getFile( getRSAPath() );
			
		var json = f.read();
		if ( !json || json.length <= 0 ) json = '{}';
		
		return JSON.parse(json);
	};
	
	self.save_rsa = function( data ){
		var f  = Ti.Filesystem.getFile( getRSAPath() );
	    f.write(JSON.stringify( data ));
	};
	
	self.load = function(){
		try{
			globals.datas = getData();
			self.data = globals.datas;
			return true;
		}
		catch(e){
			return false;
		}
	};
	
	self.save = function(){
		var f = Ti.Filesystem.getFile( getPath() );
	    
	    var str_data = JSON.stringify(self.data);
	    var rsa_info = self.load_rsa();
		    
	    var RSAkey = (globals.Crypt_key == null)? (globals.Crypt_key = crypt.loadRSAkey(rsa_info.a)): globals.Crypt_key;
	    var PubKey = crypt.publicKeyString(RSAkey);
	    
	    var EncryptionResult = crypt.encrypt(str_data, PubKey);
	    str_data = EncryptionResult.cipher;
	    f.write(str_data);
	};
	
	return self;
}());