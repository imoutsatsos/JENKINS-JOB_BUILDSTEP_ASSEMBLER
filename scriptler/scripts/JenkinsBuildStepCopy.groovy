/*** BEGIN META {
  "name" : "JenkinsBuildStepCopy",
  "comment" : "Copies builders to target project based on JSON structure",
  "parameters" : [ 'vSourceDataJson', 'vTargetProject', 'vMode'],
  "core": "2.222.1",
  "authors" : [
    { name : "Ioannis K. Moutsatsos" }
  ]
} END META**/

import hudson.model.*
import jenkins.model.*
import org.biouno.unochoice.* 
import groovy.json.*
def jsonSlurper = new JsonSlurper()


newJobName=vTargetProject
appendMode=(vMode.toBoolean())?'append':'overwrite' //in this mode if project exists we append the new parameters, if false we replace them
println 'appendMode:'+appendMode


/*
Example sourcedata json 
sourceDataJson=
"""
{"SOURCE_DATA":[{"source_job":"Contribute_Pipeline","builder_index":"1","builder_label":"Groovy_1"},{"source_job":"Contribute_Pipeline","builder_index":"2","builder_label":"Scriptler_2"}]}
"""
*/

SOURCEDATA=vSourceDataJson
buildStepAssembly=jsonSlurper.parseText(SOURCEDATA).SOURCE_DATA

targetBuiderList=[]
buildStepAssembly.each{ 
  println it
  println it.source_job
  step_idx= (it.builder_index as int) -1
  
  println step_idx
    sourceJob=jenkins.model.Jenkins.instance.getJob(it.source_job)
    sBuilders=sourceJob.getBuildersList()
    targetBuiderList.add(sBuilders[(step_idx)])

}//end each buildStepAssembly

/*
targetBuiderList.each{
    println it.class.simpleName
}
*/

//println 'Copying builders from:\n\t'+sourceJob.name+"\tto:\t$newJobName\n"
jenkins=jenkins.model.Jenkins.instance

try{
jenkins.createProject(FreeStyleProject,newJobName)
} catch (IllegalArgumentException e) {
    println "$newJobName already exists-Reusing existing job"
    reusing=true
}
targetJob=jenkins.model.Jenkins.instance.getJob(newJobName)
sBuilders=targetBuiderList
tBuilders=targetJob.getBuildersList()
k=0
/* appendMode: append, overwrite
In 'append' mode we append source builders to those of target
In 'overwrite' mode we overwrite target builders with those of source
*/
switch(appendMode){
case"append":
    println "Appending builders to $newJobName"
    sBuilders.each{  
  k++ 
  tBuilders.add(it)
  builderClass=(it.class as String).tokenize('.')[-1] as String
  println "$builderClass\tAppended-$k"
  printBuilderReport(it)
}
break
case"overwrite":
    println "Overwriting builders to $newJobName" 
  //remove all target builders
    tBuilders.each{
    tBuilders.remove(it)
  }
  //now append source builders
  sBuilders.each{  
  k++ 
  tBuilders.add(it)
  builderClass=(it.class as String).tokenize('.')[-1] as String
  println "$builderClass\tAppended-$k"
  printBuilderReport(it)
}
break
default:
    println "Unknown Mode. Defaulting to reviewing"
}


/* A method to print simple report 
for a particular class of Jenkins Builder
*/
def printBuilderReport(hudson.tasks.Builder builder) {
  println builder.class
}