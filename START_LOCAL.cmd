@echo off
setlocal
cd /d "%~dp0"
call "%~dp0config\local-server.cmd"
where py >nul 2>nul
if not errorlevel 1 (
 py -3 "%~dp0tools\local_server.py" --host "%CE_RMS_HOST%" --port "%CE_RMS_PORT%" --open
 goto :done
)
where python >nul 2>nul
if not errorlevel 1 (
 python "%~dp0tools\local_server.py" --host "%CE_RMS_HOST%" --port "%CE_RMS_PORT%" --open
 goto :done
)
echo ERROR: Python 3 is required. See START_HERE.md.
:done
pause
endlocal
