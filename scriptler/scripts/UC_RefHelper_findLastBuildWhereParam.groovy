/*** BEGIN META {
  "name" : "UC_helper_findBuildsWhereParam",
  "comment" : "Returns a map of builds related by a common build parameter whose value is defined by the user. Keys are in PROJECT_NAME#BUILD_NUMBER format",
  "parameters" : ['vSearchSpace', 'vName','vValue','vIncludeParent'],
  "core": "1.593",
  "authors" : [
    { name : "Ioannis Moutsatsos" }
  ]
} END META**/

/*
vSearchSpace  : Required; A comma delimited list of Job names
vName         : Required; A comma delimited list of Parameter names 
vValue        : Required; parameter value to match
vIncludeParent: Optional;'true' Use 'false' to not add parent
*/
import jenkins.model.*;
def options=[:] //by default we add the PARAMETER VALUE; this is the parent data set KEY
def builds=[]
def includeParent=vIncludeParent
if (includeParent==''||includeParent==null||includeParent=='true'){
options.put(vValue,vValue)
}
jobNames=vSearchSpace.tokenize(',').collect{it.trim()}
paramNames=vName.tokenize(',').collect{it.trim()}
jobNames.each{ job->
jenkins.model.Jenkins.instance.getItem(job).getBuilds().each{
  paramNames.each{pName->
      commonParam=it.buildVariables.getAt(pName)
    bMap=[:]
  if (commonParam==vValue && it.result.toString()=='SUCCESS'){
    //uc_key=job+'#'+it.number
    bMap.put('job',job)
    bMap.put('buildNum',it.number)
    bMap.put('displayName',it.getDisplayName())
    
   // uc_value="$job: ${it.getDisplayName()}"
  //  options.put(uc_key,uc_value.toString())
    builds.add(bMap)
  }
    
  }


}
} //end each JobNames


builds.groupBy{it.'job'}.each{job->  
  latestBuildNum=job.collect{j->j.value['buildNum']}.flatten().max{val->val}
  uc_key=job.key+'#'+latestBuildNum
  bindx=builds.findIndexValues{it['buildNum']==latestBuildNum&it['job']==job.key}
  uc_value=job.key+'#'+latestBuildNum+':'+ builds[bindx]['displayName']
  options.put(uc_key,uc_value.toString())
//  println 
}

return options