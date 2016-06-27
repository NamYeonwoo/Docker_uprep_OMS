(function(window, $) {

    var pages = ['app/view/resource.html'];
    var control = uPREP.createControl(uPREP.SERVICE.RESOURCE, pages);

    control.buttonToggle = true;

    control.resourceData = null;
    control.resourceTable = null;

    control.resourceAllocationData = null;
    control.resourceAllocationTable = null;
    control.binder = "&";

    control.TYPE = {
        "RESOURCE" : 0,
        "RESOURCE_ALLOCATION" : 1
    };

    control.bind = function() {

        control.getRefreshButton1().click(function(){
            control.requestResourceData();
        });

        control.getRefreshButton2().click(function(){
            control.requestResourceAllocationData();
        });

        control.initializeContents();
    };

    control.event = function(event) {
        if(event.action=='beforeShow'){
            if(control.resourceTable != null) {
                control.requestResourceData();
            }
            if(control.resourceAllocationTable != null){
                control.requestResourceAllocationData();
            }
        }
        if(event.action=='afterShow'){
            if(control.resourceTable == null) {
                //control.requestResourceData();
            }
            if(control.resourceAllocationTable == null){
                //control.requestResourceAllocationData();
            }
        }
    };

    control.initializeContents = function() {
        control.getWebSocketPort();
        control.requestResourceData();
        control.requestResourceAllocationData();
    };

    /* WebSocket */
    control.initializeWebSocket = function(port, path){
        control.webSocket = uPREP.createWebSocket(port, path, function(result) {
            control.setRefreshMessageVisible(true, control.TYPE.RESOURCE);
        },function(result){
            control.setRefreshMessageVisible(true, control.TYPE.RESOURCE_ALLOCATION);
        });
    };

    /* control ���� */
    //control.getOverlayMethodRadioGroup = function(){
    //    return $('[name="overlayMethod"]');
    //};
    control.getResourceGrid = function() {
        return $( "#resourceGrid" );
    };
    control.getResourceAllocationGrid = function() {
        return $( "#resourceAllocationGrid" );
    };

    control.getLastUpdateTime1 = function() {
        return $( "#lastUpdateTime1" );
    };
    control.getRefreshButton1 = function() {
        return $( "#refreshButton1" );
    };
    control.getRefreshMessage1 = function() {
        return $( "#refreshMessage1" );
    };

    control.getLastUpdateTime2 = function() {
        return $( "#lastUpdateTime2" );
    };
    control.getRefreshButton2 = function() {
        return $( "#refreshButton2" );
    };
    control.getRefreshMessage2 = function() {
        return $( "#refreshMessage2" );
    };

    /* Ajax Request */
    control.getWebSocketPort = function(){
        var jsonData = {};
        jsonData.UPREP = "uPREP";

        uPREP.sendAjax('/WebSocketPort', 'POST', jsonData, function(result){

            var port = control.WEBSOCKET_PORT;
            if(result.WEBSOCKET != null) {
                port = result.WEBSOCKET;
            }

            control.initializeWebSocket(port, "CS");
        },function(err){
            console.log(err);
        });
    };

    control.requestResourceData = function(typeFlag){
        var jsonData = {};
        jsonData.UPREP = "uPREP";

        uPREP.sendAjax('/GetResourceList', 'POST', jsonData, function(result){
            control.createResourceDataTable(result, typeFlag, function(){

            });
        },function(err){
            console.log(err);
        });
    };

    control.requestResourceAllocationData = function(typeFlag){
        var jsonData = {};
        jsonData.UPREP = "uPREP";

        uPREP.sendAjax('/GetResourceAllocationList', 'POST', jsonData, function(result){
            control.createResourceAllocationDataTable(result, typeFlag, function(){

            });
        },function(err){
            console.log(err);
        });
    };

    control.removeResourceAllocation = function(resourceId, virtualPeerId){
        var jsonData = {};
        jsonData.UPREP = "uPREP";
        jsonData.RESOURCE_ID = resourceId;
        jsonData.VIRTUAL_PEER_ID = virtualPeerId;

        uPREP.sendAjax('/DisableCsMessage', 'POST', jsonData, function(result){

        },function(err){
            console.log(err);
        });
    };


    /* Control Action */
    control.setRefreshMessageVisible = function(type, target){
        if(type != null && type == true){
            if(target == control.TYPE.RESOURCE){
                control.getRefreshMessage1().show();
            }
            if(target == control.TYPE.RESOURCE_ALLOCATION){
                control.getRefreshMessage2().show();
            }
        }
        else{
            if(target == control.TYPE.RESOURCE){
                control.getRefreshMessage1().hide();
            }
            if(target == control.TYPE.RESOURCE_ALLOCATION){
                control.getRefreshMessage2().hide();
            }
        }
    };
    control.setCurrentTime = function(target){
        var data = new Date();
        var current_time = data.toTimeString().split(" ")[0];

        if(target == control.TYPE.RESOURCE){
            control.getLastUpdateTime1().text(current_time);
        }
        if(target == control.TYPE.RESOURCE_ALLOCATION){
            control.getLastUpdateTime2().text(current_time);
        }

    };
    control.loadResourceDataTable = function(callback){

        control.resourceTable = $('#resourceDataTable').on('search.dt', control.OnChange).on('page.dt', control.OnChange).DataTable(
            {
                "lengthMenu": [[5, 10, 20, -1], [5, 10, 20, "All"]],
                "order": [[ 6, "desc" ]]
            }
        );

        if(callback != null){
            callback();
        }
    };
    control.loadResourceAllocationDataTable = function(callback){

        control.resourceAllocationTable = $('#resourceAllocationDataTable').on('search.dt', control.OnChange).on('page.dt', control.OnChange).DataTable(
            {
                "lengthMenu": [[5, 10, 20, -1], [5, 10, 20, "All"]],
                "order": [[ 6, "desc" ]]
            }
        );

        if(callback != null){
            callback();
        }
    };
    control.createResourceDataTable = function(data, typeFlag, callback){
        control.resourceData = data;
        var html ="";

        if(control.resourceTable != null){
            $('#resourceDataTable').DataTable().destroy();
            control.resourceTable = null;
        }

        control.setCurrentTime(control.TYPE.RESOURCE);
        control.setRefreshMessageVisible(false,control.TYPE.RESOURCE);

        for(var index = 0; index < control.resourceData.length; index++){
            var trTag = "";

            var resourceId = control.resourceData[index].RESOURCE_ID != null ? control.resourceData[index].RESOURCE_ID: "";
            var csUrl = control.resourceData[index].CS_URL != null ? control.resourceData[index].CS_URL: "-";
            var max_up_bw = control.resourceData[index].MAX_UP_BW != null ? control.resourceData[index].MAX_UP_BW: "";
            var max_dn_bw = control.resourceData[index].MAX_DN_BW != null ? control.resourceData[index].MAX_DN_BW: "";
            var max_num_connection = control.resourceData[index].MAX_NUM_CONNECTION != null ? control.resourceData[index].MAX_NUM_CONNECTION: "";
            var max_num_overlay_network = control.resourceData[index].MAX_NUM_OVERLAY_NETWORK != null ? control.resourceData[index].MAX_NUM_OVERLAY_NETWORK: "";
            var created = control.resourceData[index].CREATED_AT != null ? control.resourceData[index].CREATED_AT: "-";

            trTag += "<tr>";
            trTag += "<td class='dataTableCell' style='none' name='RESOURCE_ID'>"+ resourceId +"</td>";
            trTag += "<td class='dataTableCell' style='none'>"+ csUrl +"</td>";
            trTag += "<td class='dataTableCell' style='none'>"+ max_up_bw +"</td>";
            trTag += "<td class='dataTableCell' style='none'>"+ max_dn_bw +"</td>";
            trTag += "<td class='dataTableCell' style='none'>"+ max_num_connection +"</td>";
            trTag += "<td class='dataTableCell' style='none'>"+ max_num_overlay_network +"</td>";
            trTag += "<td class='dataTableCell' style='none'>"+ created +"</td>";
            trTag += "</tr>";

            html += trTag;
            //html += trTag.replace(/none/gi, isSelectedRow ? "background-color:#BDF3F3" : "");
        }

        control.getResourceGrid().html(html);
        control.loadResourceDataTable();

        if(callback != null){
            callback();
        }
    };
    control.createResourceAllocationDataTable = function(data, typeFlag, callback){
        control.resourceAllocationData = data;
        var html ="";

        if(control.resourceAllocationTable != null){
            $('#resourceAllocationDataTable').DataTable().destroy();
            control.resourceAllocationTable = null;
        }

        control.setCurrentTime(control.TYPE.RESOURCE_ALLOCATION);
        control.setRefreshMessageVisible(false, control.TYPE.RESOURCE_ALLOCATION);

        for(var index = 0; index < control.resourceAllocationData.length; index++){
            var trTag = "";

            var resourceId = control.resourceAllocationData[index].RESOURCE_ID != null ? control.resourceAllocationData[index].RESOURCE_ID: "";
            var requester_peer_id = control.resourceAllocationData[index].REQUESTER_PEER_ID != null ? control.resourceAllocationData[index].REQUESTER_PEER_ID: "";
            var virtual_peer_id = control.resourceAllocationData[index].VIRTUAL_PEER_ID != null ? control.resourceAllocationData[index].VIRTUAL_PEER_ID: "";
            var max_up_bw = control.resourceAllocationData[index].MAX_UP_BW != null ? control.resourceAllocationData[index].MAX_UP_BW: "";
            var max_dn_bw = control.resourceAllocationData[index].MAX_DN_BW != null ? control.resourceAllocationData[index].MAX_DN_BW: "";
            var max_num_connection = control.resourceAllocationData[index].MAX_NUM_CONNECTION != null ? control.resourceAllocationData[index].MAX_NUM_CONNECTION: "";
            var created_at = control.resourceAllocationData[index].CREATED_AT != null ? control.resourceAllocationData[index].CREATED_AT: "";
            var key = resourceId + control.binder + virtual_peer_id;
            
            trTag += "<tr>";
            trTag += "<td class='dataTableCell' style='none' name='RESOURCE_ID'>"+ resourceId +"</td>";
            trTag += "<td class='dataTableCell' style='none'>"+ requester_peer_id +"</td>";
            trTag += "<td class='dataTableCell' style='none'>"+ virtual_peer_id +"</td>";
            trTag += "<td class='dataTableCell' style='none'>"+ max_up_bw +"</td>";
            trTag += "<td class='dataTableCell' style='none'>"+ max_dn_bw +"</td>";
            trTag += "<td class='dataTableCell' style='none'>"+ max_num_connection +"</td>";
            trTag += "<td class='dataTableCell' style='none'>"+ created_at +"</td>";
            trTag += "<td class='dataTableCell' style='none'>";
            trTag +=    "<button type='button' class='btn-danger m-r-3' value='"+ key +"'>Delete</button>";
            /* trTag +=    "<button type='button' class='btn-primary' value='"+ overlay_network_id +"'>CS Use</button>";*/
            trTag += "</td>";
            trTag += "</tr>";

            html += trTag;
            //html += trTag.replace(/none/gi, isSelectedRow ? "background-color:#BDF3F3" : "");
        }

        control.getResourceAllocationGrid().html(html);
        control.loadResourceAllocationDataTable();
        control.bindDataTableDeleteButtonEvent();

        if(callback != null){
            callback();
        }
    };

    /* Event */
    control.OnChange = function(a,b,c){
        //control.setAutoRefreshStatus(control.overlayTable==null || control.overlayTable.page() == 0 && control.overlayTable.search() == "");
    };

    control.bindDataTableDeleteButtonEvent = function(){
        $("#resourceAllocationGrid").find(".btn-danger").click(function(event){
            var value = event.target.value.split(control.binder);
            if(value.length > 1){
                var resourceId = value[0];
                var virtual_peer_id = value[1];
                control.removeResourceAllocation(resourceId, virtual_peer_id);
            }
        });
    };

})(window, jQuery);