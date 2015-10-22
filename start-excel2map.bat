@echo off
echo  
echo Checking and creating required project folders...
echo Folder: node_modules...
IF NOT EXIST .\node_modules (
		mkdir .\node_modules
		echo         ...created
) else (
		echo         ...exists
)

START /B http://localhost:3002

START .\excel2map-v0.1-alpha