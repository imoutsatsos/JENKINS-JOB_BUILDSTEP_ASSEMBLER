/*
R-Processing on Jenkins: HelperJavaScript.js
@VIS_DUNN_COMPARE Parallel Coordinate Plots
@Since FEB-07-2020
@Author: Ioannis K. Moutsatsos
*/

/* 
assembles a json string of other parameters
and from it sets the value of the transfer parameter

jsonParams is used by the form 'reduction' action
*/
function addToSourceData(sourcedataId) {
  console.log('setting_json_parameters')
  var d = new Date();
  var timestamp = d.getFullYear() + ("0" + (d.getMonth() + 1)).slice(-2) + ("0" + d.getDate()).slice(-2) + ("0" + d.getHours()).slice(-2) + ("0" + d.getMinutes()).slice(-2) + ("0" + d.getSeconds()).slice(-2);
  var mp = jQuery("[type=checkbox][id^='check_']:checked").map(function () {  
    console.log(jQuery(this).prop("name"));
    var p = {};
    p['source_job'] = jQuery(jQuery('input[value=SOURCE_PROJECT]')[0].nextSibling).find('option:selected').val();   
    p['builder_index'] = document.getElementById('check_' + jQuery(this).prop("name")).value.split('_')[1];
    p['builder_label'] = document.getElementById('check_' + jQuery(this).prop("name")).value;
    //document.getElementById(jQuery(this).prop("name")).value;
    console.log(p);
    return p
  });

  /* we merge new entries */
  if (document.getElementById(sourcedataId).value != null && document.getElementById(sourcedataId).value != "") {
    jsonParams = JSON.parse(document.getElementById(sourcedataId).value)
    jsonParams.SOURCE_DATA = jsonParams.SOURCE_DATA.concat(Object.values(mp).slice(0, mp.length))
    //remove duplicate entries based on data_url
    uniqueParams = removeDuplicates(jsonParams.SOURCE_DATA, 'builder_label')
    jsonParams.SOURCE_DATA = uniqueParams //reset to the unique values
    document.getElementById(sourcedataId).value = JSON.stringify(jsonParams)
  } else {
    jsonParams = {
      SOURCE_DATA: Object.values(mp).slice(0, mp.length),
    }
  } //end if else
  document.getElementById(sourcedataId).value = JSON.stringify(jsonParams)
  transferParentId = document.getElementById(sourcedataId).parentNode.id
  jQuery('#' + transferParentId).trigger('change')
}

function setJsonTransferParam(transferParamId) {
  if (document.getElementById('ractionLabel').value == null || document.getElementById('ractionLabel').value == "") {
    document.getElementById('ractionLabel').value = prompt("Please enter a PLOT_LABEL", "CrossCompare_");
  }
  var d = new Date();
  var timestamp = d.getFullYear() + ("0" + (d.getMonth() + 1)).slice(-2) + ("0" + d.getDate()).slice(-2) + ("0" + d.getHours()).slice(-2) + ("0" + d.getMinutes()).slice(-2) + ("0" + d.getSeconds()).slice(-2);

  jsonParams = {
    DATA_LABEL: jQuery(jQuery('input[value=SOURCE_BUILD]')[0].nextSibling).find('option:selected').val(),
    SOURCE_DATA: JSON.parse(document.getElementById('sourcedataJson').value).SOURCE_DATA,
    MERGE_BY: document.getElementById('mergeBy').value,
    TSTAMP: timestamp,
    RACTION_LABEL: jQuery('#ractionLabel').val(),
    RACTION_PATH: 'raction_' + timestamp,
    RACTION_ARTIFACTS: 'http:/job/%JOB_NAME%/%BUILD_NUMBER%/artifact/raction_' + timestamp,
    TSTAMP: timestamp,
    INTERACTIVE_CHART: 'http:/job/%JOB_NAME%/%BUILD_NUMBER%/artifact/raction_' + timestamp + '/crossComparison.html',
    SESSION_PATH: document.getElementById('jobSessionPath').value

  }
  document.getElementById(transferParamId).value = JSON.stringify(jsonParams)
  transferParentId = document.getElementById(transferParamId).parentNode.id
  jQuery('#' + transferParentId).trigger('change')
}
/*
setup json string for managing actions of BUILDSTEP_LIST 
*/

function setJsonActionParams(actionParamId, sourceEntryId) {
  console.log('setting_json_actionParameters:')
  if (actionParamId == 'sourcedataJson') {
    rowNames = jQuery('#' + jQuery('input[value=BUILDSTEP_LIST]')[0].nextSibling.id).find('input:checked').map(function () {
      return Q(this).val()
    })
    jsonParams = {
      ACTION: sourceEntryId,
      BUILDSTEP_LIST: Object.values(rowNames).slice(0, rowNames.length).join(',')
    }
    if (sourceEntryId=='deleteData'){
    dataLabelArray=Object.values(rowNames).slice(0, rowNames.length)
    removeSourceData(dataLabelArray, actionParamId) //note hardcoded!!
    }// manageDataAction-delete

    if (sourceEntryId=='moveUp'){
      dataLabelArray=Object.values(rowNames).slice(0, rowNames.length)
      moveBy=document.getElementById('mvStep').value
      moveArrayElements(dataLabelArray, actionParamId, moveBy)
    }
    if (sourceEntryId=='moveDown'){
      dataLabelArray=Object.values(rowNames).slice(0, rowNames.length)
      moveBy=-(document.getElementById('mvStep').value)
      moveArrayElements(dataLabelArray, actionParamId, moveBy)
    }
  } //end if manageDataAction
  
  document.getElementById(actionParamId).value = JSON.stringify(jsonParams)
  transferParentId = document.getElementById(actionParamId).parentNode.id
  jQuery('#' + transferParentId).trigger('change')

}

/*
a function for opening a URL
Allows previewing graphical output from R
http://nrusca-sd189.nibr.novartis.net:8080/job/SESSIONS_WORKSPACE/ws/TEST_4TSNE_node01lly9npa64jsnxrxmojetl48c825/reduction_20190205144248/reduction.pdf
*/
function openWin(artifact) {
  jobSessionWs = jQuery('#jobSessionWs').val(),
    rowNames = jQuery('#' + jQuery('input[value=PLOT_LIST]')[0].nextSibling.id).find('input:checked').map(function () {
      reductionId = (Q(this).val()).replace('JSON_PARAM', 'RAction')
      return window.open(jobSessionWs + reductionId + '/' + artifact);
    })

}

/*
remove duplicates from an array
*/
function removeDuplicates(originalArray, prop) {
  var newArray = [];
  var lookupObject = {};

  for (var i in originalArray) {
    lookupObject[originalArray[i][prop]] = originalArray[i];
  }

  for (i in lookupObject) {
    newArray.push(lookupObject[i]);
  }
  /*
  due to weird behavior of array object need to slice
  length is +1 with toJSON() method
  */
  return newArray.slice(0, newArray.length - 1);
}

/*
function to delete by data_label elements from the SOURCEDATA json array
*/
function removeSourceData(dataLabelArray, sourcedataId){
  if (document.getElementById(sourcedataId).value != null && document.getElementById(sourcedataId).value != "") {
    jsonParams = JSON.parse(document.getElementById(sourcedataId).value)
    oriData=jsonParams.SOURCE_DATA
    //remove entries based on param_label
    console.log('ToDelete: '+ dataLabelArray.map(function(item){return item.split('@')[2]}))
    //console.log('oriData')
    //console.log(oriData)
    dataLabelArray.map(function(item){return item.split('@')[2]}).forEach(element => {
      delIndx=oriData.map(function(e) { return e.builder_label; }).indexOf(element,0) //index of element matching param_label
      if (delIndx>-1){
       console.log('Deleting:'+element +' at Index:' +delIndx)
      oriData.splice(delIndx,1)
      }else{
        console.log('Element: '+element +' not found')
      }
    });
 
    jsonParams.SOURCE_DATA = oriData//set to the unique values
    console.log(jsonParams.SOURCE_DATA)
    document.getElementById(sourcedataId).value = JSON.stringify(jsonParams)  
  }
}

/*
function for moving items up and down the list
*/
function moveArrayElements(dataLabelArray, sourcedataId, moveBy){
  mvStep=moveBy
  if (document.getElementById(sourcedataId).value != null && document.getElementById(sourcedataId).value != "") {
    jsonParams = JSON.parse(document.getElementById(sourcedataId).value)
    oriData=jsonParams.SOURCE_DATA
    //move entries based on param_label
    console.log('ToDelete: '+ dataLabelArray.map(function(item){return item.split('@')[2]}))
    dataLabelArray.map(function(item){return item.split('@')[2]}).forEach(element => {
      oriIndx=oriData.map(function(e) { return e.builder_label; }).indexOf(element,0) //index of element matching param_label
      m2move=oriData[oriIndx]
      mvIndx=oriIndx-mvStep
      if (mvStep>0){
        //add and remove original element
        oriData.splice(mvIndx, 0,m2move);
        oriData.splice(oriIndx+1, 1);
        }else{
        //remove and add original element
        oriData.splice(oriIndx, 1);
        oriData.splice(mvIndx, 0,m2move);
        
        }

    });
 
    jsonParams.SOURCE_DATA = oriData//set to the unique values
    console.log(jsonParams.SOURCE_DATA)
    document.getElementById(sourcedataId).value = JSON.stringify(jsonParams)  
  }
}

/*
function for selecting/deselecting all of the source parameters
*/

function selectAllSourceParams(){   
  if(jQuery('#select_allParams')[0].checked) {    
    // Iterate each checkbox
   jQuery("[type=checkbox][id^='check_']").each(function() {
        this.checked = true;
    });
}
else {  
 jQuery("[type=checkbox][id^='check_']").each(function() {
        this.checked = false;
    });

}
}