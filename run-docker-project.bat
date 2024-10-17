@echo off
for %%a in ("%~dp0\.") do set "parent=%%~nxa"
set WORKDIR=%parent%

docker build -t %WORKDIR% .

docker run -p 4005:4005 %WORKDIR%