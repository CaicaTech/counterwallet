module.exports = (function() {
	var self = {};
	
	require('vendor/UintArray');
	var bitcore = require('vendor/bitcore');
	var MnemonicJS = require('vendor/mnemonic');
	var account = null;
	var basePath = 'm/0\'/0/';
	
	self.init = function(passphrase, derive, nokeep){
		if( passphrase == null ) return null;
		
		var words = passphrase.split(' ');
		var seed = new MnemonicJS(words).toHex();
		
		var bitcore = require('vendor/bitcore');
		var master = bitcore.HDPrivateKey.fromSeed(seed);
		
		var d = basePath + '0';
		if( derive != null ) d = derive;
		
		var masterderive = master.derive( d );
		if( !nokeep ) account = masterderive;
		
		return masterderive;
	};
	
	self.createHDAddress = function( d ){
		var _requires = globals.requires;
		var derive = self.init(_requires['cache'].data.passphrase, basePath + d, true);
		
		return self.getAddress( derive );
	};
	
	self.changeHD = function( d ){
		var _requires = globals.requires;
		
		self.init(_requires['cache'].data.passphrase, basePath + d);
		
		_requires['cache'].data.address = self.getAddress();
		_requires['cache'].save();
		
		var f3 = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, 'qr_address.png');
		if( f3.exists() ){
			f3.deleteFile();
		}
		return _requires['cache'].data.address;
	};
	
	self.getpassphrase = function( passphrase ){
		var words = null;
		if( passphrase != null ) words = passphrase.split(' ');
		var m;
		try{
			m = new MnemonicJS(words);
		}
		catch(e){ throw e; }
		
		return m.toWords().toString().replace(/,/gi, ' ');
	};
	
	self.getAddress = function( derive ){
		if( account == null && derive == null ) return null;
		
		var d = account;
		if( derive != null ) d = derive;
		
		var priv = bitcore.PrivateKey(d.privateKey);
		return priv.toAddress().toString();
	};
	
	self.getPrivKey = function(){
		if( account == null ) return null;
		return account.privateKey;
	};
	
	self.sign = function( raw_tx, params ){
		if( account == null ) return null;
		
		params.pubkey = self.getPublicKey();
		bitcore.signrawtransaction(raw_tx, self.getPrivKey(), params);
	};
	
	self.getPublicKey = function( passphrase, bool ){
		if( bool ) self.init(passphrase);
		if( account == null ) return null;
		return account.publicKey.toString();
	};
	
	self.URI = function( uri ){
		if( bitcore.URI.isValid(uri) ){
			var uri = new bitcore.URI(uri);
			if( uri.amount != null ) uri.amount /= 100000000;
			return uri;
		}
		else return null;	
	};
	
    return self;
}());