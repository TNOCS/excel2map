# excel2map
Convert an Excel table to a beautiful map using csWeb.

## Getting started
Download this repository with your git client or as a zipped file. Extract the contents into a folder on your local harddrive. Run the start-excel2map.bat script. This will run the excel2map-v*.exe excecutable, which is a packaged jx (nodejs) server, and open page http://localhost:3002 in your default webbrowser. Finally, open a sample Excel sheet (e.g. excel2map_voorbeeld_regios.xlsm). After enabling the macros in Excel, clicking the 'Upload data to map' button will upload the data in your worksheet. The resulting map can be shown by clicking the 'Show map' button in the Excel sheet. 

Now you can start creating your own maps! 

Note: to lookup adresses, you'll need a database that links the addresses to lat/lon coordinates. For Dutch addresses, a stripped version of the BAG-database can be downloaded here: [BAG](https://www.dropbox.com/s/oya8cv4wj7md04h/bagadres.db?dl=0) Place it in the public/data folder of the excel2map folder.
