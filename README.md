# JOB_BUILDSTEP_ASSEMBLER README #
JOB_BUILDSTEP_ASSEMBLER:A utility job to assemble build steps from builders of one or more freestyle projects

### What is this repository for? ###

The repository provides an archive of the key artifacts required to setup (or update) the job on a Jenkins server. Artifacts include:

* Job configuration, and job-specific properties and scripts
* Shared Groovy Scriptlets
* Shared External scripts

### Job Dependencies ###

### Deployment Instructions ###

* Clone the repository ```git clone https://github.com/imoutsatsos/JENKINS-JOB_BUILDSTEP_ASSEMBLER.git```
* Deploy artifacts with [gradle](https://gradle.org/)
	* Open console in repository folder and execute command ```gradle deploy```
	* Deployment creates a **backup of all original files** (if they exist) in **qmic-JOB_BUILDSTEP_ASSEMBLER/backup** folder
	* Project configuration, scripts and properties are deployed to **$JENKINS_HOME/jobs/JOB_BUILDSTEP_ASSEMBLER** folder
	* Scriptlets are deployed to **$JENKINS_HOME/scriptlet/scripts** folder

* Review project plugins (shown below with latest version tested) and install as needed
 	* scriptler@3.1
  	* uno-choice@2.3
  	* htmlpublisher@1.23
  	* summary_report@1.15
  	* ws-cleanup@0.38
  	* build-name-setter@2.1.0
 

### How do I build this job? ###

1. 
2. 
3. 
4. 


### Who do I talk to? ###

* Ioannis K. Moutsatsos
