// var clevertap
document.onreadystatechange = function() {
  
  if (document.readyState === 'interactive') renderApp();

  function renderApp() {
    
    var onInit = app.initialized();

    onInit.then(getClient).catch(handleErr);

    function getClient(_client) {
      window.client = _client;
      client.events.on('app.activated', renderCustomerName);
    }
  }
};

function renderCustomerName() {
  client.data.get('loggedInAgent').then(res => {
    client.iparams.get().then(response=>{
      window.clevertap = {event:[], profile:[], account:[], onUserLogin:[], notifications:[], privacy:[]};
    window.clevertap.account.push({"id": response.CT_accountId}, response.region);
    window.clevertap.privacy.push({optOut: false}); //set the flag to true, if the user of the device opts out of sharing their data
    window.clevertap.privacy.push({useIP: false}); //set the flag to true, if the user agrees to share their IP data
      (function () {
        var wzrk = document.createElement('script');
        wzrk.type = 'text/javascript';
        wzrk.async = true;
        wzrk.src = ('https:' == document.location.protocol ? 'https://d2r1yp2w7bby2u.cloudfront.net' : 'https://static.clevertap.com') + '/js/clevertap.min.js';
        var s = document.getElementsByTagName('script')[0];
        s.parentNode.insertBefore(wzrk, s);
      })();
      setTimeout(()=>{
        if(window.clevertap.getCleverTapID()){
          let clevertap = window.clevertap
          let options = {
            accountId: response.SC_accountId,
            apikey: response.apiKey,
            name: res.loggedInAgent.first_name,
            email: res.loggedInAgent.email,
            Id: res.loggedInAgent.id,
            clevertap
          }
          invokeSdk(options)
        }
      },1000)
      
    }).catch(function(err){
      if(err){
        console.log(err)
        notifyUser('alert', 'Someting went wrong. Please refresh your page');
      }
      
  })
  
  }).catch(handleErr);
}

function resize() {
  var height = document.getElementsByClassName("fw-widget-wrapper");
  height = height[0].offsetHeight
  client.instance.resize({
      height: height
  });
}

function notifyUser(status, message) {
  client.interface.trigger('showNotify', {
      type: status,
      message: message
  });
}

function invokeSdk(resp) {
  let id = resp.name.split(" ")
  id = id[0]
  let initOptions = {
      accountId: resp.accountId,
      apikey: resp.apikey,
      cuid: id,
      name: resp.name,
      clevertap : resp.clevertap
  }

  // let PatchClient = window.PatchClient
  // initiating the sdk with initialization parameters
  SignedCallSDK.initSignedCall(initOptions).then(res => {
   window.PatchClient = res
    document.getElementById('patch-call-button').addEventListener('click', ()=>{
      resize();
      var cuidValue = document.getElementsByClassName("patch-cuid");
      var contextValue = document.getElementsByClassName("patch-context");
      cuidValue = cuidValue[0].value
      contextValue = contextValue[0].value
      window.PatchClient.call(cuidValue,contextValue)
    })
  }).catch(err => {
    console.log('SC error', err);
      if (err.message === "Unable to get microphone access. SDK failed to initialise.") {
          let err = 'Please grant microphone permission to use Patch dialer. For more information visit - https://support.google.com/chrome/answer/2693767'
          console.log(err);
          let elem = $('.no-access')
          elem.addClass('active')
          let width = $('.fw-widget-wrapper').outerWidth();
          let height = $('.fw-widget-wrapper').outerHeight();
          elem.height(height)
          elem.width(width)
      } else {
        console.log('Something went wrong. Please refresh your page');
      }
  });
}

function handleErr(err = 'None') {
  console.error(`Error occured. Details:`, err);
}
