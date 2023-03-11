set basePath=C:\data_zxb\toutiao\


for /l %%i in (17,1,30) do (set /a end=%%i+1 && .\mongoexport.exe -h 30.4.0.22:24800 -u devsup01 -p devPsaf83 -d mcraw -c DS_TEMPLATE20190416000001 -f "MK,YMSJ,BT,LJ,NR,NRDBQ" --query "{captureTime:{'$gte':ISODate('2019-04-%%iT16:00:00Z'),'$lt':ISODate('2019-04-%end%T15:59:59Z')}}"  -o %basePath%%%i.csv --type=csv)

pause

set basePath=C:\data_zxb\toutiao\

for /l %i in (17,1,30) do  (set /a endTime=%i+1  echo %endTime%)

pause

set basePath=C:\data_zxb\toutiao\
setlocal enabledelayedexpansion
for /l %i in (17,1,18) do (
    set /a end=%i+1 
    pause
    echo %end%)
  
  setlocal enabledelayedexpansion
for /l %i in (32,1,60) do (
  set /a a=%i+1
  
   echo %a%
)