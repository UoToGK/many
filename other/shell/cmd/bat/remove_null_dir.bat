@echo off

for /f "delims=" %%a in ('dir /ad /b /s C:\Users\uoto\AppData\^|sort /r') do (

rd "%%a">nul 2>nul &&echo ��Ŀ¼"%%a"�ɹ�ɾ����

)

pause

@REM @echo off

@REM for %%i in (c d e f) do (

@REM if exist %%i:\ (

@REM for /f "delims=" %%a in ('dir /ad /b /s "%%i:\"^|sort /r') do (

@REM rd "%%a"

@REM )

@REM )

@REM )

@REM pause
