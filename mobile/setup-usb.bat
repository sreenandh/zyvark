@echo off
echo Configuring USB Debugging for RescueNow...
adb reverse tcp:3000 tcp:3000
adb reverse tcp:8081 tcp:8081
echo Port forwarding enabled!
pause
