/*
 * File:  chemrefCommonBootStrap.js
 * Date:  18-Jan-2013  J. Westbrook
 *
 * Updates:
 *    20-May-2017 jdw overhaul/refactor
 *     2-Jun-2017 jdw add NGL support
 *     3-Jun-2017 jdw resolve issues with multiple NGL instances -
 *     3-Jun-2017 jdw deal with missing expt or ideal coordinates -- still some issues with 'create reports'
 *                    for multiple reports where some do not have ideal xyz --
 *    14-Jun-2017 jdw change event binding within  bs table
 *    14-Jun-2017 jdw toggle tabs - diminish jump scrolling behavior -
 *    14-Jun-2017 jdw fix report and search section visibility on empty
 *    18-Jun-2017 jdw relace DOMSubtreeModified with MutationObserver -
 *
 * if ( $.trim( $('#leftmenu').text() ) == "")
 *  $('#leftMenuWrapper').remove();
 */
//
// Globals -
//
var consoleDebug = true;
var sessionId = '';
var entryId = '';
var entryModelFileName = '';
var entrySfFileName = '';
var successFlag = 'false';
var errorFlag = '';
var errotText = '';
//
var chemrefAdminOpsUrl = '/service/chemref/adminops';
var chemrefIdOpsUrl = '/service/chemref/inline_idops';
var chemrefFileOpsUrl = '/service/chemref/inline_fileops';
var chemrefFullSearchUrl = '/service/chemref/search';
var chemrefEditorUrl = '/service/chemref/editor';
var newSessionServiceUrl = '/service/chemref/newsession';
var getSessionInfoServiceUrl = '/service/chemref/getsessioninfo';
var pagePath = '';
var nglReportsIndex = 0;
var nglRepresentations = [];
var nglLabelRepresentations = [];

(function() {
    var b, d, c = this,
        a = c.console;
    c.log = b = function() {
        d.push(arguments);
        a && a.log[a.firebug ? "apply" : "call"](a, Array.prototype.slice.call(arguments))
    };
    c.logargs = function(e) { b(e, arguments.callee.caller.arguments) };
    b.history = d = []
})();

/*
String.prototype.startsWith = function(str) {
    return this.indexOf(str) == 0;
};
*/

function logContext(message) {
    //console.log("%lc: " + message + " ( session id " + sessionId + " entry id " + entryId + " entry filename " + entryModelFileName + ")");
    // log("%lc: " + message + " ( session id " + sessionId + " entry id " + entryId + " entry model filename " + entryModelFileName +" entry sf filename " + entrySfFileName + ")");
    // log("%log: " + message + " ( session id " + sessionId + ")");
    log("%log: " + message);
}

function updateNglViews(jsonObj) {
    if ('webPathList' in jsonObj && 'idCodeList' in jsonObj) {
        var webPathList = jsonObj.webPathList.toString().split(",");
        var idCodeList = jsonObj.idCodeList.toString().split(",");
        var idCode;
        for (var i = 0; i < webPathList.length; i++) {
            //logContext("launchNgl webPath is " + webPathList[i]);
            //logContext("launchNgl idCode  is " + idCodeList[i]);
            nglId = "#" + idCodeList[i]+"_ngl_expt"
            if ($(nglId).length) {
                makeNglView(idCodeList[i], webPathList[i], 'expt');
            }
            nglId = "#" + idCodeList[i]+"_ngl_ideal"
            if ($(nglId).length) {
                makeNglView(idCodeList[i], webPathList[i], 'ideal');
            }
        }
    }
}

function clearNglGlobalVars(){
	nglReportsIndex = 0;
	nglRepresentations.length = 0;
	nglLabelRepresentations.length = 0;
}

function makeNglView(idCode, webXyzPath, xyzType) {
    //logContext("launchNgl webPath is " + webXyzPath);
    //logContext("launchNgl idCode  is " + idCode);
    // maintain graphics context in displayed reports
    //var globalNglObj = {};
    var nglId;
    var xyxSelId;

    if (xyzType == 'ideal') {
        nglId = idCode + "_ngl_ideal";
        xyzSelId = "/1";
    } else {
        nglId = idCode + "_ngl_expt";
        xyzSelId = "/0";
    }

    //logContext("nglId  is    " + nglId);
    //logContext("xyzSelId  is " + xyzSelId);
    // only if there is element in place -
    if ($(nglId).length) {
        logContext("Skip missing ngl pane for " + nglId);
        return true
}
    //
    var stage = new NGL.Stage(nglId, { backgroundColor: "white" });
    //globalNglObj[nglId] = stage;
    //
    var tooltip = document.createElement("div");
    Object.assign(tooltip.style, {
        display: "none",
        position: "fixed",
        zIndex: 10,
        pointerEvents: "none",
        backgroundColor: "rgba( 0, 0, 0, 0.6 )",
        color: "lightgrey",
        padding: "0.5em",
        fontFamily: "sans-serif"
    });
    document.body.appendChild(tooltip);
    //
    stage.setSize("600px", "600px");
    stage.loadFile(webXyzPath, {defaultRepresentation: true}).then(function(o) {
	nglRepresentations.push(o);
        //licorice = o.addRepresentation("licorice", { sele: xyzSelId, multipleBond: "symmetric", color: "element" });
	//licorice.setVisibility(true);
	l = o.addRepresentation("label", { labelType: "atomname", color: "black", fontWeight: "bold", xOffset: 0.1, yOffset: 0.1, radius: 1.4 });
	l.setVisibility(false);
	nglLabelRepresentations.push(l);
	cb = document.getElementsByClassName('nglReportLabelsCheckbox')[nglReportsIndex];
	if(cb){
		cb.addEventListener("change", () => {t=window.event.target;c=document.getElementsByClassName('nglReportLabelsCheckbox');index=0;for(x=0;x<c.length;++x){if(c[x]==window.event.target){index=x;break;}};l=nglLabelRepresentations[index];v = l.visible;l.setVisibility(!v);});
	} else {
		console.log('error - labels checkbox did not load');
	}
	o.setSelection('not _H');
	h = document.getElementsByClassName('nglReportHydrogensCheckbox')[nglReportsIndex];
        if(h){
		h.addEventListener("change", () => {t=window.event.target;c=document.getElementsByClassName('nglReportHydrogensCheckbox');index=0;for(x=0;x<c.length;++x){if(c[x]==window.event.target){index=x;break;}};r=nglRepresentations[index];sele='not _H';if(c[x].checked){sele='*';};r.setSelection(sele);});
        }
	nglReportsIndex++;
        stage.autoView();
        //var pa = o.structure.getPrincipalAxes();
        //stage.animationControls.rotate(pa.getRotationQuaternion(), 1500);
    });
    stage.mouseControls.remove("hoverPick");
    // listen to `hovered` signal to move tooltip around and change its text
    stage.signals.hovered.add(function(pickingProxy) {
        if (pickingProxy && (pickingProxy.atom || pickingProxy.bond)) {
            var atom = pickingProxy.atom || pickingProxy.closestBondAtom;

            if (pickingProxy.atom) {
                var atom = pickingProxy.atom || pickingProxy.closestBondAtom;
                tooltip.innerText = "atom: " + atom.atomname;
            } else if (pickingProxy.bond) {
                var bond = pickingProxy.bond;
                tooltip.innerText = "bond: " + bond.atom1.atomname + " - " + bond.atom2.atomname
            }

            var cp = pickingProxy.mouse.position;
            tooltip.style.bottom = window.innerHeight - cp.y + 3 + "px";
            tooltip.style.left = cp.x + 3 + "px";
            tooltip.style.display = "block";
        } else {
            tooltip.style.display = "none";
        }
    });
    //
    var selId = "div.ngl-class-" + xyzType + "-" + idCode;
    $(selId).visibilityChanged({
        callback: function(element, visible) {
            // do something here
            //logContext("NGL handle resize called id " + element[0].id)
            //logContext("NGL handle resize called class " + element[0].className)
            //logContext("NGL handle resize called idcode " + element[0].getAttribute("data-payload"))
            stage.handleResize();
        },
        runOnLoad: false,
        frequency: 100
    });
}

function setDownloadFileUrl(id) {
    var url;
    var fn;
    if (entryId.length > 0) {
        //fn  = entryId + "-updated.cif";
        fn = entryModelFileName;
        url = "/sessions/" + sessionId + "/" + fn;
    } else {
        url = "#";
        fn = "";
    }
    $(id).attr("href", url);
    $(id).html(fn);
    $(id).show();
}

function getDownloadFileName() {
    var fn;
    if (entryModelFileName.length > 0) {
        fn = "Download annotated file: ";
    } else {
        fn = "No file uploaded";
    }
    return fn;
}


function newSession(context) {
    var retObj;
    clearServiceContext();
    var serviceData = getServiceContext();
    logContext("Calling newsession ");
    //$.ajax({url: newSessionServiceUrl, async: false, data: {context: context}, type: 'post', success: assignSession } );
    $.ajax({
        url: newSessionServiceUrl,
        async: false,
        data: serviceData,
        type: 'post',
        success: function(jsonObj) {
            retObj = jsonObj;
        }
    });
    //
    assignContext(retObj);
    //logContext("After newsession ");
    appendContextToMenuUrls();
}

function updateDownloadOptions(jsonObj) {
    var url;
    var el;
    var fn;
    var arr;
    var htmlS;
    if ("logfiles" in jsonObj) {
        arr = jsonObj.logfiles;
        htmlS = "";
        for (var i = 0; i < arr.length; i++) {
            fn = arr[i];
            url = "/sessions/" + sessionId + "/" + fn;
            el = '<span> &nbsp; <a href="' + url + '">' + fn + '</a> </span>'
            logContext("log file " + i + " " + el);
            htmlS += el;
        }
        if (arr.length > 0) {
            $("#download-logfiles").html(htmlS);
            $("#download-logfiles-label").html("Log files:");
            $("#download-logfiles").show();
            $("#download-logfiles-label").show();
        }
    }

}

function getSessionInfo() {
    var retObj;
    var serviceData = getServiceContext();
    logContext("Calling getSessionInfo() for entry " + entryId);
    $.ajax({
        url: getSessionInfoServiceUrl,
        async: false,
        data: serviceData,
        type: 'post',
        success: function(jsonObj) {
            retObj = jsonObj;
        }
    });
    return retObj;
}

function appendContextToMenuUrls() {
    // append the current session id to menu urls

    $("fieldset legend a, #top-menu-options li a").attr('href', function(index, href) {
        ret = href.split("?")[0];
        if (sessionId.length > 0) {
            ret += (/\?/.test(ret) ? '&' : '?') + 'sessionid=' + sessionId;
        }
        if (entryId.length > 0) {
            ret += (/\?/.test(ret) ? '&' : '?') + 'entryid=' + entryId;
        }
        if (entryModelFileName.length > 0) {
            ret += (/\?/.test(ret) ? '&' : '?') + 'entrymodelfilename=' + entryModelFileName;
        }
        if (entrySfFileName.length > 0) {
            ret += (/\?/.test(ret) ? '&' : '?') + 'entrysffilename=' + entrySfFileName;
        }
        //console.log("index = " + index + " href " + href + " ret = " + ret);
        return ret;
    });


}

function assignContext(jsonObj) {
    if ("sessionid" in jsonObj) {
        sessionId = jsonObj.sessionid;
    }
    //  message  =jsonObj.htmlcontent;
    errorFlag = jsonObj.errorflag;
    errorText = jsonObj.errortext;
    if ('entryid' in jsonObj) {
        entryId = jsonObj.entryid;
    }
    if ('entrymodelfilename' in jsonObj) {
        entryModelFileName = jsonObj.entrymodelfilename;
    }
    if ('entrysffilename' in jsonObj) {
        entrySfFileName = jsonObj.entrysffilename;
    }

    //console.log("Assigning - session id " + sessionId + " entry id " + entryId + " entry filename " + entryModelFileName);
}

function getCurrentContext() {
    var myUrl = $(location).attr('href');
    pagePath = $.url(myUrl).attr('relative');
    params = $.url(myUrl).param();
    if ("sessionid" in params) {
        sessionId = params.sessionid;
    }
    if ("entryid" in params) {
        entryId = params.entryid;
    }
    if ("entrymodelfilename" in params) {
        entryModelFileName = params.entrymodelfilename;
    }
    if ("entrysffilename" in params) {
        entrySfFileName = params.entrysffilename;
    }

    //logContext("after getCurrentContext()");
}

function clearServiceContext() {
    sessionId = '';
    entryId = '';
    entryModelFileName = '';
    entrySfFileName = '';
}

function getServiceContext() {
    var sc = {};
    sc.sessionid = sessionId;
    sc.entryid = entryId;
    sc.entrymodelfilename = entryModelFileName;
    sc.entrysffilename = entrySfFileName;
    return sc;
}

function getDisplayButtonLabel() {
    var retS = '';
    if (entryModelFileName.length > 0) {
        retS = "Current data file: " + entryModelFileName;
    } else {
        retS = "No current data file ";
    }
    return retS;
}

function setOptionButtonVisible(id) {
    if (entryModelFileName.length > 0) {
        $(id).show();
    } else {
        $(id).hide();
    }
}

function progressStart() {
    $("#loading").fadeIn('slow').spin("large", "black");
}

function progressEnd() {
    $("#loading").fadeOut('fast').spin(false);
}

function updateCompletionStatus(jsonObj, statusId) {
    var errFlag = jsonObj.errorflag;
    var statusText = jsonObj.statustext;
    //  if (errText.length > 0 ) {
    if (errFlag) {
        $(statusId + ' div.op-status').html(statusText);
        $(statusId + ' div.op-status').addClass('error-status');
    } else {
        $(statusId + ' div.op-status').html(statusText);
        $(statusId + ' div.op-status').removeClass('error-status');
    }
    $(statusId + ' div.op-status').show();
}

function updateReportContent(jsonObj, contentId) {
    var retHtml = jsonObj.htmlcontent;
    var errFlag = jsonObj.errorflag;
    logContext('Updating report content  = ' + contentId);
    if (!errFlag) {
        $(contentId).show();
        //logContext('Updating report content  with = ' + retHtml);
        //logContext('Selection container ' + $(contentId).length);
        //logContext('Selection report div ' + $(contentId + ' div.report-content').length);
        $(contentId + ' div.report-content').append(retHtml);
        $(contentId + ' div.report-content').show();
        $('[data-toggle=tab]').unbind("click").on("click", function(e){
            e.preventDefault();
            //e.stopImmediatePropagation();
            if ($(this).parent().hasClass('active')){
            $($(this).attr("data-target")).toggleClass('active');
             }
        });
    }
    // Activate 3D views
    updateNglViews(jsonObj);
}

function updateLinkContent(jsonObj, contentId) {
    var retHtml = jsonObj.htmllinkcontent;
    var errFlag = jsonObj.errorflag;
    //logContext('Updating link content id = ' + contentId);
    if (retHtml.length > 0) {
        //logContext('Updating link content  with = ' + retHtml);
        //logContext('Selection container ' + $(contentId).length);
        //logContext('Selection link div ' + $(contentId + ' div.op-links').length);
        $(contentId + ' div.op-links ').html(retHtml);
        $(contentId + ' div.op-links ').show();
    } else {
        $(contentId + ' div.op-links ').html('');
        $(contentId + ' div.op-links ').hide();
    }
}


function assignReportOp(selector) {
    $(selector).unbind("click").on("click", function(e) {

        var reportId = "#" + $(this).html().toString() + "_report_section";
        // look for an existing report section -
        //logContext("Report display request for idCode " + reportId);

        if ($(reportId).length) {
            logContext("Skip existing report display request for " + reportId);
            return true
        }

        e.preventDefault();
        $.ajax({
            cache: false,
            type: "post",
            url: chemrefIdOpsUrl,
            dataType: 'json',
            data: {
                operation: "report",
                sessionid: sessionId,
                idcode: $(this).html(),
            },
            success: function(jsonObj) {
                //logContext("Report operation completed");
                // updateLinkContent(jsonObj,   '#chemref-inline-idops-form');
                updateReportContent(jsonObj, '#chemref-report-results-container');
                assignReportOp("a.app-ref-report");
            }
        });
    });
}

function updateSearchResultsBsTable(jsonObj, contentId) {
    //
    //   Appends and renders selected incoming datasets as dynamic tables to dom element 'contentId'
    //
    //   ?? Assumes contentId == resultSetContainerId
    //
    var resultSetContainerId = '';
    var resultSetTableId = '';
    //
    if (!jsonObj.errFlag) {
        logContext("Displaying " + contentId)
        $(contentId).show();
        //$(contentId + ' div.search-results').show();
    }
    //
    // $(contentId).empty();
    //
    if ('resultSetTableData' in jsonObj) {
        var myData = JSON.parse(jsonObj.resultSetTableData);
        if (consoleDebug) {
            logContext(" myData props  = " + Object.getOwnPropertyNames(myData).sort());
        }
        for (var myId in myData) {
            rS = myData[myId];
            if (Object.getOwnPropertyNames(rS).length == 0) {
                logContext(" +Skipping empty data set key = " + myId);
                continue;
            }
            //logContext(" rS props  = " + Object.getOwnPropertyNames(rS).sort());
            resultSetContainerId = rS.resultSetContainerId;
            $(contentId).append(rS.resultSetTableTemplate);

            var resultSetTableId = rS.resultSetTableId;
            var rsData = rS.resultSetTableData;

            //logContext("data set length " + rsData.length);
            //logContext(" data table dom id " + resultSetTableId);

            $("#" + resultSetTableId).bootstrapTable({
                data: rsData,
                exportDataType: 'all',
                onPostBody: function(){
                    //logContext("Fired post body");
                    assignReportOp("a.app-ref-report");
                },
                /*
                onSort:function(){
                    logContext("Fired sort");
                },
                onPageChange: function(){
                    logContext("Fired page changed");
                }
                */
            });
            logContext("Displaying " + resultSetContainerId)
            $(resultSetContainerId).show();
        }
    } else {
        logContext(" No table data in object ")
        logContext(" jsonObj props = " + Object.getOwnPropertyNames(jsonObj).sort());
    }

    //
    if (jsonObj.errflag) {
        logContext('Error flag is set  = ' + jsonObj.errflag);

    }
}

function pagerFunc() {
    return {
        type: 'owner',
        sort: 'updated',
        direction: 'desc',
        per_page: 20,
        page: 1
    };
}

function createReportObserver(observeId, visId) {
    var target = $(observeId).get(0);

    // create an observer instance
    var observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if ( $.trim( $(observeId).html() ) == ""){
                //logContext("Report DIV is empty .... ");
                $(visId).hide();
            }
      });
    });

    // configuration of the observer:
    var config = { childList: true, subtree:true };

    // pass in the target node, as well as the observer options
    observer.observe(target, config);
}

function createSearchObserver(observeId, subSelector) {
    var target = $(observeId).get(0);

    // create an observer instance
    var observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        // do stuff when `childList`, `subtree` of `#myTable` modified
        //logContext("Detected mutation " + mutation.type);

        //var num =$(observeId +' ' + subSelector).length
        //logContext("Section count " + num)

        if ( $(observeId + ' ' + subSelector).length == 0  ){
                //logContext("Observed section is empty .... ");
                $(observeId).hide();
        }
      });
    });

    // configuration of the observer:
    var config = { childList: true, subtree:true };

    // pass in the target node, as well as the observer options
    observer.observe(target, config);
}

//
// Document ready entry point
//

$(document).ready(function() {
    $("#uploadProgress").find('*').hide();
    $('#chemref-report-results-container').hide();
    $('#chemref-search-results-container').hide();

    getCurrentContext();
    appendContextToMenuUrls();
    //
    if (sessionId.length == 0) {
        newSession('request session');
        logContext('Assigning new session id  = ' + sessionId);
    }
    // logContext('Selection report container ' + $('#chemref-report-results-container').length);

    if ($("#chemref-full-search-dialog").length > 0) {
        $('#chemref-report-results-container').hide();
        $('#chemref-search-results-container').hide();
        /*
        $('#report-content').unbind("DOMSubtreeModified").bind("DOMSubtreeModified", function(e) {
            if (false) {
                logContext("Modified: " + e.target.nodeName);
                var vc = $('#report-content  div.results-section').is(":visible");
                logContext("vis " + vc);
                var hc = $('#report-content  div.results-section').is(":hidden");
                logContext("hid " + hc);
                var num =$('#report-content  div.results-section').length
                logContext("num " + num)
             }
            if ( $.trim( $('#report-content').html() ) == ""){
                logContext("Report DIV is empty .... ");
                $('#chemref-report-results-container').hide();
            }
        });
        */
        createReportObserver('#report-content', '#chemref-report-results-container');
        createSearchObserver('#chemref-search-results-container', 'div.results-section');
     /*
        $('#chemref-search-results-container').unbind("DOMSubtreeModified").bind("DOMSubtreeModified", function(e) {
            if (false) {
                logContext("Modified: " + e.target.nodeName);
                var vc = $('#chemref-search-results-container  div.results-section').is(":visible");
                logContext("vis " + vc);
                var hc = $('#chemref-search-results-container  div.results-section').is(":hidden");
                logContext("hid " + hc);
            }
                var num =$('#chemref-search-results-container  div.results-section').length
                logContext("num " + num)
            if ( $('#chemref-search-results-container  div.results-section').length == 0  ){
                logContext("Search DIV is empty .... ");
                $('#chemref-search-results-container').hide();
            //} else {
            //    $('#chemref-search-results-container').show();
            }
        });
        */
        $("#searchTarget1").typeahead({
            items: 20,
            minLength: 2,
            source: function(query, response) {
                $.ajax({
                    cache: false,
                    timeout: 60000,
                    type: "post",
                    url: "/service/chemref/search/autocomplete",
                    dataType: "json",
                    data: {
                        term: query,
                        extra_param: "constant1",
                        searchType: $("#searchType1").val(),
                        searchOp: $("#searchOp1").val()
                    },
                    success: function(data) {
                        if (data != null) {
                            response(data);
                        }
                    }
                });
            },
            select: function(event, ui) {
                /* console.log(ui.item ? ("Selected: " + ui.item.value + " aka " + ui.item.id) : "Nothing selected, input was " + this.value); */
            }
        });

        <!-- chemref reference entity search form -->
        $('#chemref-full-search-form').ajaxForm({
            url: chemrefFullSearchUrl,
            type: 'post',
            dataType: 'json',
            success: function(jsonObj) {
                logContext("Full search completed");
                progressEnd();
                $('#chemref-full-search-button').show();
                updateCompletionStatus(jsonObj, '#chemref-full-search-form');
                updateSearchResultsBsTable(jsonObj, '#chemref-search-results-container');
            },
            beforeSubmit: function(arr, $form, options) {
                $('#chemref-full-search-status.op-status').hide();

                progressStart();
                $('#chemref-full-search-button').hide();

                selectValue = $("#searchType1 option:selected").text();

                arr.push({
                    "name": "searchName",
                    "value": selectValue
                });

                arr.push({
                    "name": "sessionid",
                    "value": sessionId
                });
            }
        });
    }



    // -- WORKING COLLECTION OF ADMIN FUNCTIONS --
    if ($("#chemref-admin-dialog").length > 0) {
        $('#chemref-report-results-container').hide();
        createReportObserver('#report-content', '#chemref-report-results-container');
        /*
        $('#report-content').unbind("DOMSubtreeModified").bind("DOMSubtreeModified", function(e) {
            if ( $.trim( $('#report-content').html() ) == ""){
                logContext("Report DIV is empty .... ");
                $('#chemref-report-results-container').hide();
            }
        });
        */
        <!-- chemref admin operations form -->
        $('#chemref-admin-ops-form').ajaxForm({
            url: chemrefAdminOpsUrl,
            dataType: 'json',
            success: function(jsonObj) {
                //logContext("Operation completed");
                progressEnd();
                $('#chemref-admin-ops-button').show();
                updateCompletionStatus(jsonObj, '#chemref-admin-ops-form');
            },
            beforeSubmit: function(arr, $form, options) {
                $('#chemref-admin-ops-form div.op-status').hide();
                progressStart();
                $('#chemref-admin-ops-button').hide();
                arr.push({
                    "name": "sessionid",
                    "value": sessionId
                });
            }
        });

        <!-- chemref inline idops form -->
        $('#chemref-inline-idops-form').ajaxForm({
            url: chemrefIdOpsUrl,
            dataType: 'json',
            success: function(jsonObj) {
                //logContext("Operation completed");

                updateCompletionStatus(jsonObj, '#chemref-inline-idops-form');
                updateLinkContent(jsonObj, '#chemref-inline-idops-form');
                updateReportContent(jsonObj, '#chemref-report-results-container');
                // $('#chemref-report-results-container  div.tab-style').tabs({ collapsible: true });
                // $('#chemref-report-results-container  div.accordion-style').accordion({ collapsible: true, heightStyle: "content" });
                //$('#chemref-report-results-container  div.multi-accordion-style').multiOpenAccordion({active: 0 });
                $('#chemref-report-results-container  div.report-content').show();
                $('#chemref-inline-idops-button').show();
                progressEnd();
            },
            beforeSubmit: function(arr, $form, options) {
                $('#chemref-inline-idops-form div.op-status').hide();
                $('#chemref-inline-idops-form div.op-links').hide();
                $('#chemref-report-results-container  div.report-content').hide();

                progressStart();
                $('#chemref-inline-idops-button').hide();
                arr.push({
                    "name": "sessionid",
                    "value": sessionId
                });
            }
        });




        <!-- chemref inline fileops form -->
        $('#chemref-inline-fileops-form').ajaxForm({
            url: chemrefFileOpsUrl,
            dataType: 'json',
            success: function(jsonObj) {
                //logContext("Operation completed");

                updateCompletionStatus(jsonObj, '#chemref-inline-fileops-form');
                updateLinkContent(jsonObj, '#chemref-inline-fileops-form');
                updateReportContent(jsonObj, '#chemref-report-results-container');

                //$('#chemref-report-results-container  div.tab-style').tabs({ collapsible: true });
                //$('#chemref-report-results-container  div.accordion-style').accordion({ collapsible: true, heightStyle: "content" });
                //$('#chemref-report-results-container  div.multi-accordion-style').multiOpenAccordion({active: 0 });

                $('#chemref-report-results-container  div.report-content').show();
                $('#chemref-inline-fileops-button').show();
                progressEnd();
            },
            beforeSubmit: function(arr, $form, options) {
                $('#chemref-inline-idops-form div.op-status').hide();
                $('#chemref-inline-idops-form div.op-links').hide();
                $('#chemref-report-results-container  div.report-content').hide();

                progressStart();
                $('#chemref-inline-fileops-button').hide();
                arr.push({
                    "name": "sessionid",
                    "value": sessionId
                });
            }
        });

    }

    // -- chemref editor --
    if ($("#chemref-editor-dialog").length > 0) {
        $('#chemref-editor-form').ajaxForm({
            url: chemrefEditorUrl,
            dataType: 'json',
            success: function(jsonObj) {
                progressEnd();
                $('#chemref-editor-button').show();
                updateCompletionStatus(jsonObj, '#chemref-editor-form');
                if (('location' in jsonObj) && (jsonObj.location != "")) {
                    window.open(jsonObj.location, '_blank');
                }
            },
            beforeSubmit: function(arr, $form, options) {
                $('#chemref-editor-form div.op-status').hide();
                progressStart();
                $('#chemref-editor-button').hide();
                arr.push({
                    "name": "sessionid",
                    "value": sessionId
                });
            }
        });
    }

    <!-- Download task operations -->
    if ($("#download-dialog").length > 0) {
        $("#download-logfiles").hide();
        $("#download-logfiles-label").hide();
        var sObj = getSessionInfo();
        updateDownloadOptions(sObj);
        //
        $('#download-url').hide();
        $("#download-url-label").html(getDownloadFileName());
        setDownloadFileUrl("#download-url");
    }
    //    <!-- make the nav item for the current page active -->
    $('.nav a[href="' + pagePath + '"]').parent().addClass('active');

}); // end-ready
