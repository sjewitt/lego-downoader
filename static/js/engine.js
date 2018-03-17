var engine = {
    
	plandata : null,
    
    init : function(){
//    	this.plansloaded();
    	//NOTE The plans are loaded into mongo as a separate process
    	engine.getplandata({'setnumber':'showall'});
    },
    
    //check that the plans are loaded
    plansloaded : function(){
    	$.ajax({
            type: "GET",
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            url : "/api/plansloaded"
        }).done(function(data){
        	engine.planDataLoaded = data['planDataLoaded'];
            console.log(engine.planDataLoaded);
            if(engine.planDataLoaded){
            	engine.getplandata({'setnumber':'showall'});	//in case I need to pass in a set number later
            }
        }).fail(function(jqxhr, status, e){ 
            console.log("err"); 
        });
    },
    
    //Load the plans into memory
    loadplans : function(filterObj){
    	console.log("Loading plans:");
    	
    	$.ajax({
            type: "GET",
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            url : "/api/loadplans"
        }).done(function(data){
        	engine.planDataLoaded = data['planDataLoaded'];
            console.log(engine.planDataLoaded);
            
            //load the search/browse form
            if(engine.planDataLoaded){
            	engine.getplandata()
            }
            
        }).fail(function(jqxhr, status, e){ 
            console.log("err"); 
        });
    },
    
    /*
     * display the plans
     */
    getplandata : function(params){
    	$.ajax({
            type: "GET",
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            url : "/api/getplandata?setnumber=" + params.setnumber
        }).done(function(data){
        	engine.planData = data;
        	var _out = "<table id='plans_listing'><thead><tr><th>Set number</th><th>Description</th><th>Notes</th><th>Add to DB</th><th></th></tr></thead>";
        	_out += "<tfoot><th>Set number</th><th>Description</th><th>Notes</th><th>Add to DB</th><th></th></tfoot><tbody>";
        	
            for(var a=0;a<engine.planData.length;a++){
            	
            	var _link = engine.planData[a].Description;
//            	var _link = '<a href="' + engine.planData[a].URL + '" target="_blank">' + engine.planData[a].Description + '</a>';

            	//detect the download status form the object. The downloaded flag will be checked a the python end.
            	var _isFlaggedForDownload = engine.planData[a].download;
            	var _isDownloaded = engine.planData[a].downloaded;
            	
            	var _downloadFlagIsChecked = '';
            	if(_isFlaggedForDownload){
            		_downloadFlagIsChecked = 'checked="checked"';
            		console.log(engine.planData[a]);
            	}
            	if(_isDownloaded){
            		_downloadFlagIsChecked = 'disabled="disabled"';
            			console.log(engine.planData[a]);
            	}
            	
            	var _isDownloadedMsg = '';
            	if(_isDownloaded){
            		_isDownloadedMsg = '[<a href="/api/getstoredplan?getlocal=' + engine.planData[a].key + '.pdf" target="_blank">open</a>]'; 
            		_isDownloadedMsg += ' [<a href="/api/getstoredplan?action=download&getlocal=' + engine.planData[a].key + '.pdf">download</a>]'
            	}
            	
            	_out += '<tr><td>' 
            		+ engine.planData[a].SetNumber+'</td><td>' 
            		+ _link + '</td><td>' 
            		+ engine.planData[a].Notes 
            		+ '</td><td class="download_checkbox"><input type="checkbox" value="' 
            		+ engine.planData[a].key + '" ' + _downloadFlagIsChecked + '></td>'
            		+ '<td>'+_isDownloadedMsg+'</td>'
            		+ '</tr>';
            }
            _out += '</table>';
            $('#plans_list').html(_out);
            $('#plans_listing').dataTable({
            	  "pageLength": 50
            });
            
            //see SO #30794672:
            //$('td.download_checkbox > input').click(function(){
            $('table').on('click','td.download_checkbox',function(){
            	console.log('clicked');

            	//send AJAX call to back end for this
            	engine.setDownloadFlag($(this).find('input').attr('value'),$(this).find('input').is(':checked'));
            });
            
        }).fail(function(jqxhr, status, e){ 
            console.log("err"); 
        });
    },
    
    setDownloadFlag : function(setnumber,flag){
    	$.ajax({
            type: "GET",
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            url : "/api/flagdownload?setnumber=" + setnumber + "&flag=" + flag    //flag is boolean - enable/disable the download
        }).done(function(data){ });
    },
    
    
    _getQSVal : function(url,param){
        var _params = decodeURI(url).split('?');
        var _out = '';
        if(_params.length === 2){
            var _bits = _params[1].split(/&/g);
            for(var b=0;b<_bits.length;b++){
                if(_bits[b].split(/=/)[0] === param){
                    //get rid of hash, if found:
                    _out = _bits[b].split(/=/)[1];
                    if(_out.indexOf('#') !== -1){
                        _out = _out.split(/#/)[0];
                    }
                    return(_out);
                }
            }
        }
        return(null);
    }

};

//ajax start/stop for progress icon
$(document).bind('ajaxStart', function(){
    $("#ajax-loading").dialog({
        'modal':true
    });
}).bind('ajaxStop', function(){
    $("#ajax-loading").dialog('close');
});
