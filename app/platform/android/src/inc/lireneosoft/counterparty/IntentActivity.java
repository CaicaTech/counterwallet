package inc.lireneosoft.counterparty;

import android.app.Activity;
import android.os.Bundle;
import android.content.Intent;
import android.util.Log;
import android.net.Uri;

import org.appcelerator.titanium.TiApplication;
import org.appcelerator.titanium.TiRootActivity;
import org.appcelerator.titanium.proxy.ActivityProxy;
import org.appcelerator.kroll.KrollDict;

public class IntentActivity extends Activity {

    private static final String TAG = "IntentActivity";
    
    private void activate(String source){
        Intent intent = new Intent();
        intent.setClassName(this, "inc.lireneosoft.counterparty.IndiesquareWalletActivity");
        intent.setAction(Intent.ACTION_VIEW);
        intent.putExtra("source", source);
        try{
            startActivity(intent);
        }catch(Exception e){
            Log.d(TAG, "**** e:"+e);
        }
    }
    
    @Override
    public void onCreate(Bundle savedInstanceState){
        super.onCreate(savedInstanceState);
        
        Intent currentIntent = getIntent();
        Bundle extras = currentIntent.getExtras();
        String source = null;
        if( extras != null ) source = extras.getString("source");
        
        TiRootActivity app = (TiRootActivity) TiApplication.getAppRootOrCurrentActivity();
        if( app == null ){
            activate(source);
        }
        else{
            ActivityProxy proxy = app.getActivityProxy();
            if( proxy == null ){
                activate(source);
            }
            else{
                KrollDict event = new KrollDict();
                event.put("data", source);
                proxy.fireEvent("app:resume", event);
            }
        }
        finish();
    }

    @Override
    protected void onNewIntent(Intent intent){
        super.onNewIntent(intent);
        finish();
    }
}